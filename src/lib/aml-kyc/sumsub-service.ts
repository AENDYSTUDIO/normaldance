import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔐 Sumsub Service - Identity Verification Integration
 *
 * Сервис для интеграции с Sumsub API для проверки документов пользователей
 * в соответствии с международными стандартами KYC/AML
 */

import { DocumentType, KYCLevel, KYCStatus, PersonalData } from "./types";

import { ComplianceService } from "./compliance-service";
import { generateId } from "./utils";

// Импортируем глобальный экземпляр Prisma
import { db } from "../../lib/db";

export interface SumsubConfig {
  apiKey: string;
  secret: string;
  appId: string;
  apiUrl: string;
  webHookSecret?: string;
}

export interface SumsubApplicant {
  id: string;
  externalUserId: string;
  createdAt: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dob?: string; // Date of birth in YYYY-MM-DD format
  country?: string; // ISO 3166-1 alpha-2
  customAttributes?: Record<string, any>;
}

export interface SumsubCheckResult {
  id: string;
  status: "completed" | "pending" | "rejected" | "consider";
  reviewResult?: {
    reviewAnswer: "GREEN" | "RED" | "GRAY";
    moderationComment?: string;
    clientComment?: string;
  };
  createdAt: string;
  checkType: string;
  requirements?: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

export interface SumsubVerificationLevel {
  levelName: string;
  requiredDocuments: DocumentType[];
  additionalChecks: string[];
}

export class SumsubService {
  private config: SumsubConfig;
  private complianceService: ComplianceService;

  constructor(config: SumsubConfig) {
    this.config = config;
    this.complianceService = new ComplianceService();
  }

  /**
   * Создание нового кандидата для верификации в Sumsub
   */
  async createApplicant(
    userId: string,
    email?: string,
    phone?: string,
    personalData?: PersonalData
  ): Promise<{ success: boolean; applicantId?: string; message?: string }> {
    try {
      // Подготовка данных для создания кандидата
      const applicantData: Partial<SumsubApplicant> = {
        externalUserId: userId,
        email,
        phone,
      };

      if (personalData) {
        applicantData.firstName = personalData.firstName;
        applicantData.lastName = personalData.lastName;
        applicantData.dob = personalData.dateOfBirth;
        applicantData.country = personalData.nationality;
      }

      // Формирование тела запроса
      const requestBody = {
        externalUserId: applicantData.externalUserId,
        email: applicantData.email,
        phone: applicantData.phone,
        firstName: applicantData.firstName,
        lastName: applicantData.lastName,
        dob: applicantData.dob,
        country: applicantData.country,
        customAttributes: {
          platform: "NormalDance",
          createdAt: new Date().toISOString(),
        },
      };

      // Подготовка заголовков для аутентификации
      const headers = this.getAuthHeaders(
        "POST",
        "/resources/applicants",
        requestBody
      );

      // Выполнение запроса к API Sumsub
      const response = await fetch(
        `${this.config.apiUrl}/resources/applicants`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        applicantId: result.id,
        message: "Applicant created successfully",
      };
    } catch (error) {
      SecureLogger.error("Error creating Sumsub applicant:", error);
      return {
        success: false,
        message: `Failed to create applicant: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Создание токена доступа для веб-сайта (Web SDK)
   */
  async generateAccessToken(
    applicantId: string,
    levelName: string
  ): Promise<{ success: boolean; token?: string; message?: string }> {
    try {
      // Подготовка заголовков для аутентификации
      const headers = this.getAuthHeaders(
        "POST",
        `/resources/accessTokens?applicantId=${applicantId}&levelName=${levelName}`
      );

      // Выполнение запроса к API Sumsub
      const response = await fetch(
        `${this.config.apiUrl}/resources/accessTokens?applicantId=${applicantId}&levelName=${levelName}`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        token: result.token,
        message: "Access token generated successfully",
      };
    } catch (error) {
      SecureLogger.error("Error generating Sumsub access token:", error);
      return {
        success: false,
        message: `Failed to generate access token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Получение информации о кандидате
   */
  async getApplicantInfo(applicantId: string): Promise<SumsubApplicant | null> {
    try {
      // Подготовка заголовков для аутентификации
      const headers = this.getAuthHeaders(
        "GET",
        `/resources/applicants/${applicantId}`
      );

      // Выполнение запроса к API Sumsub
      const response = await fetch(
        `${this.config.apiUrl}/resources/applicants/${applicantId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        id: result.id,
        externalUserId: result.externalUserId,
        createdAt: result.createdAt,
        email: result.email,
        phone: result.phone,
        firstName: result.firstName,
        lastName: result.lastName,
        dob: result.dob,
        country: result.country,
        customAttributes: result.customAttributes,
      };
    } catch (error) {
      SecureLogger.error("Error fetching Sumsub applicant info:", error);
      return null;
    }
  }

  /**
   * Получение результатов проверки кандидата
   */
  async getApplicantChecks(applicantId: string): Promise<SumsubCheckResult[]> {
    try {
      // Подготовка заголовков для аутентификации
      const headers = this.getAuthHeaders(
        "GET",
        `/resources/applicants/${applicantId}/checks`
      );

      // Выполнение запроса к API Sumsub
      const response = await fetch(
        `${this.config.apiUrl}/resources/applicants/${applicantId}/checks`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
      }

      const results = await response.json();

      return results.map((check: any) => ({
        id: check.id,
        status: check.status,
        reviewResult: check.reviewResult
          ? {
              reviewAnswer: check.reviewResult.reviewAnswer,
              moderationComment: check.reviewResult.moderationComment,
              clientComment: check.reviewResult.clientComment,
            }
          : undefined,
        createdAt: check.createdAt,
        checkType: check.checkType,
        requirements: check.requirements
          ? check.requirements.map((req: any) => ({
              id: req.id,
              type: req.type,
              status: req.status,
            }))
          : undefined,
      }));
    } catch (error) {
      SecureLogger.error("Error fetching Sumsub applicant checks:", error);
      return [];
    }
  }

  /**
   * Отправка документа для проверки
   */
  async submitDocument(
    applicantId: string,
    documentType: DocumentType,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<{ success: boolean; imageId?: string; message?: string }> {
    try {
      // Определение типа документа для Sumsub
      const sumsubDocType = this.mapDocumentTypeToSumsub(documentType);

      // Создание формы данных для отправки файла
      const formData = new FormData();
      formData.append(
        "source",
        new Blob([fileBuffer], { type: "application/octet-stream" })
      );
      formData.append("idDocType", sumsubDocType);

      // Подготовка заголовков для аутентификации (без Content-Type, т.к. используется multipart/form-data)
      const headers = this.getAuthHeaders(
        "POST",
        `/resources/applicants/${applicantId}/documents`
      );

      // Для multipart запроса нужно добавить только аутентификационные заголовки
      // Content-Type будет автоматически установлен браузером с boundary
      const fetchHeaders = {
        ...headers,
        // Удаляем Content-Type, чтобы браузер установил его автоматически с правильным boundary
      };

      // Выполнение запроса к API Sumsub
      const response = await fetch(
        `${this.config.apiUrl}/resources/applicants/${applicantId}/documents`,
        {
          method: "POST",
          headers: fetchHeaders as HeadersInit,
          body: formData as any, // Приведение к any для корректной работы с FormData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        imageId: result.imageId,
        message: "Document submitted successfully",
      };
    } catch (error) {
      SecureLogger.error("Error submitting document to Sumsub:", error);
      return {
        success: false,
        message: `Failed to submit document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Получение уровня верификации Sumsub
   */
  async getVerificationLevel(
    levelName: string
  ): Promise<SumsubVerificationLevel | null> {
    try {
      // Подготовка заголовков для аутентификации
      const headers = this.getAuthHeaders(
        "GET",
        `/resources/settings/applications/${this.config.appId}/levels/${levelName}`
      );

      // Выполнение запроса к API Sumsub
      const response = await fetch(
        `${this.config.apiUrl}/resources/settings/applications/${this.config.appId}/levels/${levelName}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sumsub API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Преобразование типов документов из Sumsub в наши типы
      const requiredDocuments: DocumentType[] = [];
      if (result.requirements && Array.isArray(result.requirements)) {
        for (const req of result.requirements) {
          if (
            req.type === "ID" ||
            req.type === "PASSPORT" ||
            req.type === "DRIVERS"
          ) {
            requiredDocuments.push("PASSPORT");
          } else if (
            req.type === "UTILITY_BILL" ||
            req.type === "BANK_STATEMENT"
          ) {
            requiredDocuments.push("UTILITY_BILL");
          } else if (req.type === "SELFIE") {
            requiredDocuments.push("SELFIE");
          }
        }
      }

      return {
        levelName: result.name || levelName,
        requiredDocuments,
        additionalChecks: result.checks || [],
      };
    } catch (error) {
      SecureLogger.error("Error fetching Sumsub verification level:", error);
      return null;
    }
  }

  /**
   * Обработка вебхука от Sumsub
   */
  async handleWebhook(payload: any, signature: string): Promise<boolean> {
    // Проверка подписи вебхука, если предоставлен секрет
    if (this.config.webHookSecret) {
      // В реальной реализации здесь должна быть проверка подписи
      // const expectedSignature = this.calculateWebhookSignature(payload);
      // if (signature !== expectedSignature) {
      //   SecureLogger.error("Invalid webhook signature");
      //   return false;
      // }
    }

    try {
      // Обработка события вебхука
      const { type, applicantId, reviewResult } = payload;

      if (
        type === "applicant.statusChanged" ||
        type === "applicant.reviewResultChanged"
      ) {
        // Обновление статуса KYC в нашей системе
        await this.updateKYCStatusFromWebhook(applicantId, reviewResult);
      }

      return true;
    } catch (error) {
      SecureLogger.error("Error handling Sumsub webhook:", error);
      return false;
    }
  }

  /**
   * Обновление статуса KYC на основе результатов проверки Sumsub
   */
  private async updateKYCStatusFromWebhook(
    applicantId: string,
    reviewResult: any
  ): Promise<void> {
    try {
      // Получение профиля KYC по applicantId
      const kycProfile = await db.kYCProfile.findFirst({
        where: {
          additionalData: {
            path: ["sumsubApplicantId"],
            equals: applicantId,
          },
        },
      });

      if (!kycProfile) {
        SecureLogger.error(`KYC profile not found for applicant ID: ${applicantId}`);
        return;
      }

      // Определение нового статуса и уровня на основе результатов Sumsub
      let newStatus: KYCStatus = "PENDING";
      let newLevel: KYCLevel = kycProfile.level as KYCLevel;

      if (reviewResult && reviewResult.reviewAnswer) {
        switch (reviewResult.reviewAnswer) {
          case "GREEN":
            newStatus = "VERIFIED";
            // Повышение уровня в зависимости от типа проверки
            if (reviewResult.type && reviewResult.type.includes("advanced")) {
              newLevel = "ENHANCED";
            } else {
              newLevel = "STANDARD";
            }
            break;
          case "RED":
            newStatus = "REJECTED";
            break;
          case "GRAY":
            newStatus = "IN_REVIEW";
            break;
          default:
            newStatus = "PENDING";
        }
      }

      // Обновление профиля KYC
      await db.kYCProfile.update({
        where: { id: kycProfile.id },
        data: {
          status: newStatus,
          level: newLevel,
          lastUpdated: new Date(),
          additionalData: {
            ...kycProfile.additionalData,
            sumsubLastResult: reviewResult,
            sumsubLastUpdate: new Date().toISOString(),
          },
        },
      });

      // Создание события комплаенса
      await this.complianceService.createComplianceEvent({
        type:
          newStatus === "VERIFIED"
            ? "KYC_APPROVED"
            : newStatus === "REJECTED"
            ? "KYC_REJECTED"
            : "KYC_SUBMITTED",
        userId: kycProfile.userId,
        walletAddress: kycProfile.walletAddress,
        data: {
          applicantId,
          previousStatus: kycProfile.status,
          newStatus,
          reviewResult,
        },
        severity: newStatus === "REJECTED" ? "HIGH" : "MEDIUM",
      });
    } catch (error) {
      SecureLogger.error("Error updating KYC status from webhook:", error);
    }
  }

  /**
   * Карта типов документов для преобразования в формат Sumsub
   */
  private mapDocumentTypeToSumsub(documentType: DocumentType): string {
    switch (documentType) {
      case "PASSPORT":
        return "PASSPORT";
      case "NATIONAL_ID":
        return "ID_CARD";
      case "DRIVING_LICENSE":
        return "DRIVERS";
      case "RESIDENCE_PERMIT":
        return "RESIDENCE_PERMIT";
      case "TAX_ID":
        return "TAX_ID";
      case "UTILITY_BILL":
        return "UTILITY_BILL";
      case "BANK_STATEMENT":
        return "BANK_STATEMENT";
      case "SELFIE":
        return "SELFIE";
      default:
        return "OTHER";
    }
  }

  /**
   * Генерация заголовков аутентификации для API Sumsub
   */
  private getAuthHeaders(
    method: string,
    path: string,
    body: any = null
  ): Record<string, string> {
    const timestamp = Date.now().toString();
    const methodUpper = method.toUpperCase();

    // Формирование строки для подписи
    let stringToSign = timestamp + methodUpper + path;
    if (body) {
      const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
      stringToSign += bodyStr;
    }

    // В Node.js для вычисления HMAC-SHA256 нужно использовать crypto
    // Но поскольку мы в браузере, используем Web Crypto API
    const signature = this.calculateHMAC(this.config.secret, stringToSign);

    return {
      "X-App-Id": this.config.appId,
      "X-Timestamp": timestamp,
      "X-Nonce": generateId("nonce"),
      "X-Signature": signature,
    };
  }

  /**
   * Вычисление HMAC-SHA256 подписи
   */
  private calculateHMAC(secret: string, message: string): string {
    // В браузерной среде используем Web Crypto API
    // В Node.js среде нужно использовать crypto модуль
    // Для совместимости с обеими средами, возвращаем заглушку
    // Реализация будет зависеть от среды выполнения

    // Это заглушка - в реальной реализации нужно использовать соответствующую криптографическую библиотеку
    // В Node.js: const crypto = require('crypto');
    // return crypto.createHmac('sha256', secret).update(message).digest('hex');

    // Для браузера: реализация через Web Crypto API
    SecureLogger.warn(
      "HMAC calculation needs to be implemented based on runtime environment"
    );
    return "IMPLEMENT_HMAC_CALCULATION"; // Заглушка
  }
}
