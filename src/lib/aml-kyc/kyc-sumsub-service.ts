import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔐 KYC Sumsub Service - Enhanced KYC with Sumsub Integration
 *
 * Расширенный KYC сервис с интеграцией Sumsub для верификации документов
 * в соответствии с международными стандартами комплаенса
 */

import {
  CreateKYCRequest,
  DocumentType,
  KYCLevel,
  KYCStatus,
  KYCVerificationResponse,
} from "./types";

import { ComplianceService } from "./compliance-service";
import { KYCService } from "./kyc-service";
import { SumsubConfig, SumsubService } from "./sumsub-service";

// Импортируем глобальный экземпляр Prisma
import { db } from "../../lib/db";

export interface KYCVerificationLevel {
  levelName: "basic" | "standard" | "enhanced" | "enterprise";
  displayName: string;
  requiredDocuments: DocumentType[];
  additionalChecks: string[];
  maxTransactionLimit?: number;
  features: string[];
}

export interface SumsubKYCRequest extends CreateKYCRequest {
  verificationLevel: "basic" | "standard" | "enhanced" | "enterprise";
  useSumsub?: boolean;
}

export interface SumsubKYCResponse extends KYCVerificationResponse {
  sumsubApplicantId?: string;
  sumsubAccessToken?: string;
  verificationLevel?: string;
  nextSteps?: string[];
}

export class KYCSumsubService {
  private kycService: KYCService;
  private sumsubService: SumsubService;
  private complianceService: ComplianceService;
  private sumsubConfig: SumsubConfig;

  // Определения уровней верификации
  private static readonly VERIFICATION_LEVELS: Record<
    string,
    KYCVerificationLevel
  > = {
    basic: {
      levelName: "basic",
      displayName: "Базовая верификация",
      requiredDocuments: ["SELFIE"],
      additionalChecks: ["email_verification", "phone_verification"],
      maxTransactionLimit: 1000,
      features: ["basic_trading", "limited_withdrawals"],
    },
    standard: {
      levelName: "standard",
      displayName: "Стандартная верификация",
      requiredDocuments: ["PASSPORT", "SELFIE"],
      additionalChecks: ["address_verification", "identity_verification"],
      maxTransactionLimit: 10000,
      features: ["full_trading", "standard_withdrawals", "nft_minting"],
    },
    enhanced: {
      levelName: "enhanced",
      displayName: "Расширенная верификация",
      requiredDocuments: ["PASSPORT", "SELFIE", "UTILITY_BILL"],
      additionalChecks: ["enhanced_due_diligence", "source_of_funds"],
      maxTransactionLimit: 50000,
      features: [
        "full_trading",
        "enhanced_withdrawals",
        "nft_minting",
        "staking",
      ],
    },
    enterprise: {
      levelName: "enterprise",
      displayName: "Корпоративная верификация",
      requiredDocuments: [
        "PASSPORT",
        "SELFIE",
        "UTILITY_BILL",
        "BANK_STATEMENT",
      ],
      additionalChecks: [
        "corporate_verification",
        "ubo_verification",
        "enhanced_due_diligence",
      ],
      maxTransactionLimit: 100000,
      features: [
        "full_trading",
        "enterprise_withdrawals",
        "nft_minting",
        "staking",
        "api_access",
      ],
    },
  };

  constructor(sumsubConfig: SumsubConfig) {
    this.kycService = new KYCService();
    this.sumsubService = new SumsubService(sumsubConfig);
    this.complianceService = new ComplianceService();
    this.sumsubConfig = sumsubConfig;
  }

  /**
   * Создание KYC профиля с поддержкой Sumsub
   */
  async createKYCProfileWithSumsub(
    request: SumsubKYCRequest
  ): Promise<SumsubKYCResponse> {
    try {
      // Валидация запроса
      const validationErrors = this.validateSumsubKYCRequest(request);
      if (validationErrors.length > 0) {
        return {
          success: false,
          status: "REJECTED",
          level: "BASIC",
          message: "Validation failed",
          errors: validationErrors,
        };
      }

      // Проверка существования профиля
      const existingProfile = await this.kycService.getKYCProfileByUserId(
        request.userId
      );
      if (existingProfile) {
        return {
          success: false,
          status: existingProfile.status,
          level: existingProfile.level,
          message: "KYC profile already exists for this user",
        };
      }

      let sumsubApplicantId: string | undefined;
      let sumsubAccessToken: string | undefined;

      // Если используется Sumsub для верификации
      if (request.useSumsub !== false) {
        // Создание кандидата в Sumsub
        const sumsubResult = await this.sumsubService.createApplicant(
          request.userId,
          undefined, // email можно добавить позже
          undefined, // phone можно добавить позже
          request.personalData
        );

        if (!sumsubResult.success) {
          return {
            success: false,
            status: "REJECTED",
            level: "BASIC",
            message: `Sumsub integration failed: ${sumsubResult.message}`,
          };
        }

        sumsubApplicantId = sumsubResult.applicantId;

        // Генерация токена доступа для Sumsub SDK
        const tokenResult = await this.sumsubService.generateAccessToken(
          sumsubApplicantId,
          this.mapLevelToSumsubLevel(request.verificationLevel)
        );

        if (tokenResult.success) {
          sumsubAccessToken = tokenResult.token;
        }
      }

      // Создание KYC профиля в нашей системе
      const kycRequest: CreateKYCRequest = {
        userId: request.userId,
        walletAddress: request.walletAddress,
        personalData: request.personalData,
        addresses: request.addresses,
        documents: request.documents,
      };

      const kycResult = await this.kycService.createKYCProfile(kycRequest);

      if (!kycResult.success) {
        return {
          ...kycResult,
          sumsubApplicantId,
          sumsubAccessToken,
        };
      }

      // Обновление профиля с информацией о Sumsub
      if (sumsubApplicantId) {
        await this.updateProfileWithSumsubData(
          kycResult.profileId!,
          sumsubApplicantId!,
          request.verificationLevel
        );
      }

      // Создание события комплаенса
      await this.complianceService.createComplianceEvent({
        type: "KYC_SUBMITTED",
        userId: request.userId,
        walletAddress: request.walletAddress,
        data: {
          profileId: kycResult.profileId,
          verificationLevel: request.verificationLevel,
          useSumsub: request.useSumsub !== false,
          sumsubApplicantId,
        },
        severity: "LOW",
      });

      const levelConfig =
        KYCSumsubService.VERIFICATION_LEVELS[request.verificationLevel];
      const mappedLevel = this.mapSumsubLevelToKYCLevel(
        request.verificationLevel
      );

      return {
        success: true,
        profileId: kycResult.profileId,
        status: "PENDING",
        level: mappedLevel,
        message: "KYC profile created successfully with Sumsub integration",
        sumsubApplicantId,
        sumsubAccessToken,
        verificationLevel: request.verificationLevel,
        nextSteps: this.getNextStepsForLevel(request.verificationLevel),
      };
    } catch (error) {
      SecureLogger.error("Error creating KYC profile with Sumsub:", error);
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
   * Обработка результатов верификации из Sumsub
   */
  async processSumsubVerificationResult(
    applicantId: string,
    reviewResult: any
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Поиск KYC профиля по applicant ID
      const kycProfile = await (db as any).kYCProfile.findFirst({
        where: {
          additionalData: {
            path: ["sumsubApplicantId"],
            equals: applicantId,
          },
        },
      });

      if (!kycProfile) {
        return {
          success: false,
          message: "KYC profile not found for applicant",
        };
      }

      // Определение нового статуса на основе результатов Sumsub
      let newStatus: KYCStatus = "PENDING";
      let newLevel: KYCLevel = kycProfile.level as KYCLevel;

      if (reviewResult && reviewResult.reviewAnswer) {
        switch (reviewResult.reviewAnswer) {
          case "GREEN":
            newStatus = "VERIFIED";
            // Определение уровня на типа проверки
            const verificationLevel = kycProfile.additionalData
              ?.verificationLevel as string;
            newLevel = this.mapSumsubLevelToKYCLevel(verificationLevel);
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

      // Обновление KYC профиля
      await this.kycService.updateKYCStatus(
        kycProfile.id,
        newStatus,
        newLevel,
        "SumsubSystem",
        `Sumsub verification result: ${reviewResult?.reviewAnswer}`
      );

      // Обновление дополнительной информации
      await prisma.kYCProfile.update({
        where: { id: kycProfile.id },
        data: {
          additionalData: {
            ...kycProfile.additionalData,
            sumsubLastResult: reviewResult,
            sumsubLastUpdate: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        message: `KYC status updated to ${newStatus}`,
      };
    } catch (error) {
      SecureLogger.error("Error processing Sumsub verification result:", error);
      return {
        success: false,
        message: "Internal error occurred during verification processing",
      };
    }
  }

  /**
   * Получение доступных уровней верификации
   */
  getAvailableVerificationLevels(): KYCVerificationLevel[] {
    return Object.values(KYCSumsubService.VERIFICATION_LEVELS);
  }

  /**
   * Получение информации об уровне верификации
   */
  getVerificationLevel(levelName: string): KYCVerificationLevel | null {
    return KYCSumsubService.VERIFICATION_LEVELS[levelName] || null;
  }

  /**
   * Обновление уровня верификации пользователя
   */
  async upgradeVerificationLevel(
    userId: string,
    newLevel: "basic" | "standard" | "enhanced" | "enterprise"
  ): Promise<{ success: boolean; message?: string; accessToken?: string }> {
    try {
      const profile = await this.kycService.getKYCProfileByUserId(userId);
      if (!profile) {
        return {
          success: false,
          message: "KYC profile not found",
        };
      }

      const currentLevel = (profile as any).additionalData
        ?.verificationLevel as string;
      if (currentLevel === newLevel) {
        return {
          success: false,
          message: "User already has this verification level",
        };
      }

      // Проверка требований для нового уровня
      const levelConfig = KYCSumsubService.VERIFICATION_LEVELS[newLevel];
      if (!levelConfig) {
        return {
          success: false,
          message: "Invalid verification level",
        };
      }

      // Обновление в Sumsub
      const sumsubApplicantId = profile.additionalData
        ?.sumsubApplicantId as string;
      let accessToken: string | undefined;

      if (sumsubApplicantId) {
        const tokenResult = await this.sumsubService.generateAccessToken(
          sumsubApplicantId,
          this.mapLevelToSumsubLevel(newLevel)
        );

        if (tokenResult.success) {
          accessToken = tokenResult.token;
        }
      }

      // Обновление локального профиля
      await (db as any).kYCProfile.update({
        where: { id: profile.id },
        data: {
          additionalData: {
            ...(profile as any).additionalData,
            verificationLevel: newLevel,
            levelUpgradeRequested: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        message: `Verification level upgrade initiated to ${newLevel}`,
        accessToken,
      };
    } catch (error) {
      SecureLogger.error("Error upgrading verification level:", error);
      return {
        success: false,
        message: "Internal error occurred during level upgrade",
      };
    }
  }

  /**
   * Получение статуса верификации из Sumsub
   */
  async getSumsubVerificationStatus(applicantId: string): Promise<{
    status: string;
    checks: any[];
    lastUpdate: string;
  } | null> {
    try {
      const checks = await this.sumsubService.getApplicantChecks(applicantId);
      const applicantInfo = await this.sumsubService.getApplicantInfo(
        applicantId
      );

      if (!applicantInfo) {
        return null;
      }

      return {
        status: this.determineOverallStatus(checks),
        checks,
        lastUpdate: applicantInfo.createdAt,
      };
    } catch (error) {
      SecureLogger.error("Error getting Sumsub verification status:", error);
      return null;
    }
  }

  // Приватные методы

  /**
   * Валидация Sumsub KYC запроса
   */
  private validateSumsubKYCRequest(request: SumsubKYCRequest): string[] {
    const errors: string[] = [];

    // Базовая валидация
    if (!request.userId || request.userId.trim() === "") {
      errors.push("User ID is required");
    }

    if (!request.walletAddress || request.walletAddress.trim() === "") {
      errors.push("Wallet address is required");
    }

    if (!request.verificationLevel) {
      errors.push("Verification level is required");
    } else if (
      !KYCSumsubService.VERIFICATION_LEVELS[request.verificationLevel]
    ) {
      errors.push("Invalid verification level");
    }

    // Валидация персональных данных
    if (!request.personalData.firstName || !request.personalData.lastName) {
      errors.push(
        "First name and last name are required for Sumsub verification"
      );
    }

    // Валидация документов для уровня
    const levelConfig =
      KYCSumsubService.VERIFICATION_LEVELS[request.verificationLevel];
    if (levelConfig && request.documents) {
      const providedDocTypes = request.documents.map((doc) => doc.type);

      for (const requiredDoc of levelConfig.requiredDocuments) {
        if (!providedDocTypes.includes(requiredDoc)) {
          errors.push(
            `Document type ${requiredDoc} is required for ${request.verificationLevel} level`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Обновление профиля с данными Sumsub
   */
  private async updateProfileWithSumsubData(
    profileId: string,
    applicantId: string,
    verificationLevel: string
  ): Promise<void> {
    await (db as any).kYCProfile.update({
      where: { id: profileId },
      data: {
        additionalData: {
          sumsubApplicantId: applicantId,
          verificationLevel,
          sumsubIntegrated: true,
          sumsubIntegrationDate: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Преобразование уровня в формат Sumsub
   */
  private mapLevelToSumsubLevel(level: string): string {
    const mapping: Record<string, string> = {
      basic: "basic-kyc",
      standard: "standard-kyc",
      enhanced: "enhanced-kyc",
      enterprise: "enterprise-kyc",
    };
    return mapping[level] || "basic-kyc";
  }

  /**
   * Преобразование Sumsub уровня в KYC уровень
   */
  private mapSumsubLevelToKYCLevel(level: string): KYCLevel {
    const mapping: Record<string, KYCLevel> = {
      basic: "BASIC",
      standard: "STANDARD",
      enhanced: "ENHANCED",
      enterprise: "PREMIUM",
    };
    return mapping[level] || "BASIC";
  }

  /**
   * Получение следующих шагов для уровня верификации
   */
  private getNextStepsForLevel(level: string): string[] {
    const levelConfig = KYCSumsubService.VERIFICATION_LEVELS[level];
    if (!levelConfig) return [];

    const steps: string[] = [];

    if (levelConfig.requiredDocuments.length > 0) {
      steps.push(
        `Upload required documents: ${levelConfig.requiredDocuments.join(", ")}`
      );
    }

    if (levelConfig.additionalChecks.length > 0) {
      steps.push(
        `Complete additional checks: ${levelConfig.additionalChecks.join(", ")}`
      );
    }

    steps.push("Wait for verification completion");
    steps.push("Check email for verification status");

    return steps;
  }

  /**
   * Определение общего статуса на основе проверок
   */
  private determineOverallStatus(checks: any[]): string {
    if (checks.length === 0) return "PENDING";

    const completedChecks = checks.filter(
      (check) => check.status === "completed"
    );
    const rejectedChecks = checks.filter(
      (check) =>
        check.status === "rejected" ||
        (check.reviewResult && check.reviewResult.reviewAnswer === "RED")
    );

    if (rejectedChecks.length > 0) return "REJECTED";
    if (completedChecks.length === checks.length) return "COMPLETED";
    return "IN_PROGRESS";
  }
}

// Экспорт сервиса
export { KYCSumsubService };
