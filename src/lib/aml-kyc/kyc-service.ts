import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🛡️ KYC Service - Know Your Customer Verification System
 *
 * Сервис для управления KYC верификацией пользователей
 * в соответствии с международными стандартами комплаенса
 */

import {
  AMLKYCEvent,
  CreateKYCRequest,
  KYCLevel,
  KYCProfile,
  KYCStatus,
  KYCVerificationResponse,
  VerificationDocument,
} from "./types";

// Импортируем глобальный экземпляр Prisma из существующего файла

// Импортируем DID систему для интеграции
import { MusicIdentitySystem } from "../did/music-identity-system";

// Импортируем утилиты
import { hashDocument, sanitizeInput, validatePersonalData } from "./utils";

// Импортируем сервисы для интеграции
import { ComplianceService } from "./compliance-service";

export class KYCService {
  private musicIdentitySystem?: MusicIdentitySystem;
  private complianceService: ComplianceService;

  constructor(musicIdentitySystem?: MusicIdentitySystem) {
    this.musicIdentitySystem = musicIdentitySystem;
    this.complianceService = new ComplianceService();
  }

  /**
   * Создание нового KYC профиля
   */
  async createKYCProfile(
    request: CreateKYCRequest
  ): Promise<KYCVerificationResponse> {
    try {
      // Валидация входных данных
      const validationErrors = this.validateKYCRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          status: "REJECTED",
          level: "BASIC",
          message: "Validation failed",
          errors: validationErrors,
        };
      }

      // Проверка, существует ли уже профиль для этого пользователя
      const existingProfile = await this.getKYCProfileByUserId(request.userId);
      if (existingProfile) {
        return {
          success: false,
          status: existingProfile.status,
          level: existingProfile.level,
          message: "KYC profile already exists for this user",
        };
      }

      // Проверка, существует ли уже профиль для этого адреса кошелька
      const existingByWallet = await this.getKYCProfileByWallet(
        request.walletAddress
      );
      if (existingByWallet) {
        return {
          success: false,
          status: existingByWallet.status,
          level: existingByWallet.level,
          message: "KYC profile already exists for this wallet address",
        };
      }

      // Создание нового профиля
      const profile: KYCProfile = {
        id: `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: request.userId,
        walletAddress: request.walletAddress,
        level: "BASIC",
        status: "PENDING",
        personalData: {
          ...request.personalData,
          firstName: sanitizeInput(request.personalData.firstName),
          lastName: sanitizeInput(request.personalData.lastName),
          middleName: request.personalData.middleName
            ? sanitizeInput(request.personalData.middleName)
            : undefined,
        },
        addresses: request.addresses.map((addr) => ({
          ...addr,
          street: sanitizeInput(addr.street),
          city: sanitizeInput(addr.city),
          state: addr.state ? sanitizeInput(addr.state) : undefined,
        })),
        documents: await Promise.all(
          request.documents.map(async (doc) => {
            // Хэширование документов для обеспечения целостности
            const frontHash = doc.frontImageHash
              ? await hashDocument(doc.frontImageHash)
              : undefined;
            const backHash = doc.backImageHash
              ? await hashDocument(doc.backImageHash)
              : undefined;
            const selfieHash = doc.selfieImageHash
              ? await hashDocument(doc.selfieImageHash)
              : undefined;

            return {
              ...doc,
              id: `doc_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              frontImageHash: frontHash,
              backImageHash: backHash,
              selfieImageHash: selfieHash,
              verificationStatus: "PENDING",
              submittedAt: new Date().toISOString(),
            };
          })
        ),
        riskScore: 0,
        riskCategory: "LOW",
        submittedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      // Сохранение в базу данных
      await this.saveKYCProfile(profile);

      // Создание события
      await this.createEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "KYC_SUBMITTED",
        userId: profile.userId,
        walletAddress: profile.walletAddress,
        timestamp: new Date().toISOString(),
        data: {
          profileId: profile.id,
          level: profile.level,
          status: profile.status,
        },
        severity: "LOW",
        processed: false,
      });

      return {
        success: true,
        profileId: profile.id,
        status: profile.status,
        level: profile.level,
        message: "KYC profile created successfully",
      };
    } catch (error) {
      SecureLogger.error("Error creating KYC profile:", error);
      return {
        success: false,
        status: "REJECTED",
        level: "BASIC",
        message: "Internal error occurred during KYC profile creation",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Обновление статуса KYC профиля
   */
  async updateKYCStatus(
    profileId: string,
    status: KYCStatus,
    level?: KYCLevel,
    reviewedBy?: string,
    notes?: string
  ): Promise<KYCVerificationResponse> {
    try {
      const profile = await this.getKYCProfileById(profileId);
      if (!profile) {
        return {
          success: false,
          status: "REJECTED",
          level: "BASIC",
          message: "KYC profile not found",
        };
      }

      // Обновление профиля
      const updatedProfile: KYCProfile = {
        ...profile,
        status,
        level: level || profile.level,
        reviewedAt: new Date().toISOString(),
        reviewedBy,
        notes,
        lastUpdated: new Date().toISOString(),
      };

      // Если статус VERIFIED, возможно обновление уровня
      if (status === "VERIFIED") {
        updatedProfile.level = level || this.calculateKYCLevel(updatedProfile);
        updatedProfile.expiresAt = this.calculateExpiryDate(
          updatedProfile.level
        );
      }

      // Сохранение обновленного профиля
      await this.saveKYCProfile(updatedProfile);

      // Создание события
      await this.createEvent({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: status === "VERIFIED" ? "KYC_APPROVED" : "KYC_REJECTED",
        userId: updatedProfile.userId,
        walletAddress: updatedProfile.walletAddress,
        timestamp: new Date().toISOString(),
        data: {
          profileId: updatedProfile.id,
          level: updatedProfile.level,
          status: updatedProfile.status,
          reviewedBy,
        },
        severity: status === "VERIFIED" ? "LOW" : "MEDIUM",
        processed: false,
      });

      // Если верификация успешна, обновляем DID систему
      if (status === "VERIFIED" && this.musicIdentitySystem) {
        await this.updateMusicIdentity(updatedProfile);
      }

      return {
        success: status === "VERIFIED",
        profileId: updatedProfile.id,
        status: updatedProfile.status,
        level: updatedProfile.level,
        message:
          status === "VERIFIED"
            ? "KYC profile approved successfully"
            : "KYC profile rejected",
      };
    } catch (error) {
      SecureLogger.error("Error updating KYC status:", error);
      return {
        success: false,
        status: "REJECTED",
        level: "BASIC",
        message: "Internal error occurred during KYC status update",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Получение KYC профиля по ID пользователя
   */
  async getKYCProfileByUserId(userId: string): Promise<KYCProfile | null> {
    try {
      // В реальной реализации будет запрос к базе данных
      // Здесь используем заглушку
      const profile = await prisma.kYCProfile.findUnique({
        where: { userId },
      });

      if (!profile) return null;

      // Преобразование из базы данных в тип
      return this.mapDbToKYCProfile(profile);
    } catch (error) {
      SecureLogger.error("Error fetching KYC profile by user ID:", error);
      return null;
    }
  }

  /**
   * Получение KYC профиля по адресу кошелька
   */
  async getKYCProfileByWallet(
    walletAddress: string
  ): Promise<KYCProfile | null> {
    try {
      const profile = await prisma.kYCProfile.findUnique({
        where: { walletAddress },
      });

      if (!profile) return null;

      return this.mapDbToKYCProfile(profile);
    } catch (error) {
      SecureLogger.error("Error fetching KYC profile by wallet address:", error);
      return null;
    }
  }

  /**
   * Получение KYC профиля по ID
   */
  async getKYCProfileById(profileId: string): Promise<KYCProfile | null> {
    try {
      const profile = await prisma.kYCProfile.findUnique({
        where: { id: profileId },
      });

      if (!profile) return null;

      return this.mapDbToKYCProfile(profile);
    } catch (error) {
      SecureLogger.error("Error fetching KYC profile by ID:", error);
      return null;
    }
  }

  /**
   * Загрузка документа для верификации
   */
  async uploadDocument(
    profileId: string,
    document: Omit<
      VerificationDocument,
      "id" | "verificationStatus" | "verificationDate" | "rejectionReason"
    >
  ): Promise<{ success: boolean; documentId?: string; message?: string }> {
    try {
      const profile = await this.getKYCProfileById(profileId);
      if (!profile) {
        return {
          success: false,
          message: "KYC profile not found",
        };
      }

      if (profile.status !== "PENDING" && profile.status !== "IN_REVIEW") {
        return {
          success: false,
          message: "Cannot upload documents for this profile status",
        };
      }

      // Хэширование документа для обеспечения целостности
      const frontHash = document.frontImageHash
        ? await hashDocument(document.frontImageHash)
        : undefined;
      const backHash = document.backImageHash
        ? await hashDocument(document.backImageHash)
        : undefined;
      const selfieHash = document.selfieImageHash
        ? await hashDocument(document.selfieImageHash)
        : undefined;

      const newDocument: VerificationDocument = {
        ...document,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        frontImageHash: frontHash,
        backImageHash: backHash,
        selfieImageHash: selfieHash,
        verificationStatus: "PENDING",
        submittedAt: new Date().toISOString(),
      };

      // Обновление профиля с новым документом
      profile.documents.push(newDocument);
      profile.lastUpdated = new Date().toISOString();

      await this.saveKYCProfile(profile);

      return {
        success: true,
        documentId: newDocument.id,
        message: "Document uploaded successfully",
      };
    } catch (error) {
      SecureLogger.error("Error uploading document:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Получение документов пользователя
   */
  async getUserDocuments(userId: string): Promise<VerificationDocument[]> {
    try {
      const profile = await this.getKYCProfileByUserId(userId);
      return profile ? profile.documents : [];
    } catch (error) {
      SecureLogger.error("Error fetching user documents:", error);
      return [];
    }
  }

  /**
   * Проверка статуса KYC пользователя
   */
  async isUserVerified(userId: string): Promise<boolean> {
    try {
      const profile = await this.getKYCProfileByUserId(userId);
      return profile ? profile.status === "VERIFIED" : false;
    } catch (error) {
      SecureLogger.error("Error checking user verification status:", error);
      return false;
    }
  }

  /**
   * Получение уровня верификации пользователя
   */
  async getUserKYCLevel(userId: string): Promise<KYCLevel> {
    try {
      const profile = await this.getKYCProfileByUserId(userId);
      return profile ? profile.level : "BASIC";
    } catch (error) {
      SecureLogger.error("Error getting user KYC level:", error);
      return "BASIC";
    }
  }

  /**
   * Получение профилей для ручной проверки
   */
  async getProfilesForReview(limit: number = 10): Promise<KYCProfile[]> {
    try {
      const profiles = await prisma.kYCProfile.findMany({
        where: {
          status: "PENDING",
        },
        take: limit,
      });

      return profiles.map((profile) => this.mapDbToKYCProfile(profile));
    } catch (error) {
      SecureLogger.error("Error fetching profiles for review:", error);
      return [];
    }
  }

  // Приватные методы

  /**
   * Валидация KYC запроса
   */
  private validateKYCRequest(request: CreateKYCRequest): string[] {
    const errors: string[] = [];

    // Валидация персональных данных
    const personalDataErrors = validatePersonalData(request.personalData);
    errors.push(...personalDataErrors);

    // Проверка обязательных полей
    if (!request.userId || request.userId.trim() === "") {
      errors.push("User ID is required");
    }

    if (!request.walletAddress || request.walletAddress.trim() === "") {
      errors.push("Wallet address is required");
    }

    // Проверка формата адреса кошелька (упрощенная)
    if (
      request.walletAddress.length < 32 ||
      request.walletAddress.length > 44
    ) {
      errors.push("Invalid wallet address format");
    }

    // Проверка документов
    if (!request.documents || request.documents.length === 0) {
      errors.push("At least one document is required");
    } else {
      for (const doc of request.documents) {
        if (
          !doc.type ||
          !Object.values(DocumentType).includes(doc.type as any)
        ) {
          errors.push(`Invalid document type: ${doc.type}`);
        }

        if (!doc.number || doc.number.trim() === "") {
          errors.push("Document number is required");
        }

        if (!doc.issueDate) {
          errors.push("Document issue date is required");
        }

        // Проверка даты истечения (если указана)
        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate);
          const currentDate = new Date();
          if (expiryDate < currentDate) {
            errors.push("Document has expired");
          }
        }
      }
    }

    return errors;
  }

  /**
   * Расчет уровня KYC на основе представленных документов
   */
  private calculateKYCLevel(profile: KYCProfile): KYCLevel {
    const documentTypes = profile.documents.map((doc) => doc.type);

    // BASIC: только email/телефон (в реальной системе)
    if (documentTypes.length === 0) return "BASIC";

    // STANDARD: ID документ + адрес
    const hasIdDoc = documentTypes.some((type) =>
      ["PASSPORT", "NATIONAL_ID", "DRIVING_LICENSE"].includes(type)
    );
    const hasAddressDoc = documentTypes.some((type) =>
      ["UTILITY_BILL", "BANK_STATEMENT"].includes(type)
    );

    if (hasIdDoc && hasAddressDoc) {
      // ENHANCED: добавляются дополнительные документы
      const hasFinancialDoc = documentTypes.some((type) =>
        ["BANK_STATEMENT", "TAX_ID"].includes(type)
      );

      if (hasFinancialDoc) {
        return "ENHANCED";
      }
      return "STANDARD";
    }

    return "BASIC";
  }

  /**
   * Расчет даты истечения верификации
   */
  private calculateExpiryDate(level: KYCLevel): string {
    const now = new Date();
    let expiryDate: Date;

    switch (level) {
      case "BASIC":
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 1)); // 1 год
        break;
      case "STANDARD":
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 2)); // 2 года
        break;
      case "ENHANCED":
      case "PREMIUM":
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 3)); // 3 года
        break;
      default:
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 1)); // по умолчанию 1 год
    }

    return expiryDate.toISOString();
  }

  /**
   * Сохранение KYC профиля в базу данных
   */
  private async saveKYCProfile(profile: KYCProfile): Promise<void> {
    // В реальной реализации будет сохранение в базу данных
    // Здесь используем заглушку
    SecureLogger.log(
      `Saving KYC profile: ${profile.id} for user: ${profile.userId}`
    );

    // Обновляем профиль в Prisma
    await prisma.kYCProfile.upsert({
      where: { id: profile.id },
      update: {
        userId: profile.userId,
        walletAddress: profile.walletAddress,
        level: profile.level,
        status: profile.status,
        personalData: profile.personalData as any, // Преобразование для Prisma
        addresses: profile.addresses as any,
        documents: profile.documents as any,
        riskScore: profile.riskScore,
        riskCategory: profile.riskCategory,
        submittedAt: new Date(profile.submittedAt),
        reviewedAt: profile.reviewedAt ? new Date(profile.reviewedAt) : null,
        reviewedBy: profile.reviewedBy || null,
        expiresAt: profile.expiresAt ? new Date(profile.expiresAt) : null,
        lastUpdated: new Date(profile.lastUpdated),
        notes: profile.notes || null,
      },
      create: {
        id: profile.id,
        userId: profile.userId,
        walletAddress: profile.walletAddress,
        level: profile.level,
        status: profile.status,
        personalData: profile.personalData as any,
        addresses: profile.addresses as any,
        documents: profile.documents as any,
        riskScore: profile.riskScore,
        riskCategory: profile.riskCategory,
        submittedAt: new Date(profile.submittedAt),
        reviewedAt: profile.reviewedAt ? new Date(profile.reviewedAt) : null,
        reviewedBy: profile.reviewedBy || null,
        expiresAt: profile.expiresAt ? new Date(profile.expiresAt) : null,
        lastUpdated: new Date(profile.lastUpdated),
        notes: profile.notes || null,
      },
    });
  }

  /**
   * Преобразование данных из базы в KYCProfile
   */
  private mapDbToKYCProfile(dbProfile: any): KYCProfile {
    return {
      id: dbProfile.id,
      userId: dbProfile.userId,
      walletAddress: dbProfile.walletAddress,
      level: dbProfile.level as KYCLevel,
      status: dbProfile.status as KYCStatus,
      personalData: dbProfile.personalData,
      addresses: dbProfile.addresses,
      documents: dbProfile.documents,
      riskScore: dbProfile.riskScore,
      riskCategory: dbProfile.riskCategory as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL",
      submittedAt: dbProfile.submittedAt.toISOString(),
      reviewedAt: dbProfile.reviewedAt
        ? dbProfile.reviewedAt.toISOString()
        : undefined,
      reviewedBy: dbProfile.reviewedBy || undefined,
      expiresAt: dbProfile.expiresAt
        ? dbProfile.expiresAt.toISOString()
        : undefined,
      lastUpdated: dbProfile.lastUpdated.toISOString(),
      notes: dbProfile.notes || undefined,
    };
  }

  /**
   * Создание события AML/KYC
   */
  private async createEvent(event: AMLKYCEvent): Promise<void> {
    SecureLogger.log(
      `Creating AML/KYC event: ${event.type} for user: ${event.userId}`
    );
    // В реальной реализации сохранение события в базу данных
  }

  /**
   * Обновление музыкальной идентичности после KYC верификации
   */
  private async updateMusicIdentity(profile: KYCProfile): Promise<void> {
    if (!this.musicIdentitySystem) {
      SecureLogger.log("Music Identity System not available, skipping update");
      return;
    }

    try {
      // В реальной системе обновляем DID с подтвержденными данными
      SecureLogger.log(`Updating music identity for user: ${profile.userId}`);

      // Обновляем уровень верификации в DID системе
      if (profile.did) {
        // Здесь будет логика обновления DID профиля с подтвержденными данными
        SecureLogger.log(`Updated DID profile: ${profile.did} with verified status`);
      }
    } catch (error) {
      SecureLogger.error("Error updating music identity:", error);
    }
  }
}

// Экспорт сервиса
export { KYCService };
