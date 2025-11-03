import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🐱 CAT Service - Common Address Transaction Implementation
 *
 * Сервис для работы с CAT форматом Travel Rule сообщений
 * в соответствии со стандартом Common Address Transaction
 */

import { CATMessage, VASPInfo, VASPRegistryEntry } from "./types";
import { TravelRuleCrypto } from "./crypto";
import { generateId } from "../aml-kyc/utils";

export interface CATConfig {
  enabled: boolean;
  endpoint: string;
  version: string;
  timeout: number; // в миллисекундах
  retryAttempts: number;
}

export class CATService {
  private config: CATConfig;
  private crypto: TravelRuleCrypto;

  constructor(config: CATConfig) {
    this.config = config;
    this.crypto = new TravelRuleCrypto({
      encryption: {
        algorithm: "AES-256-GCM",
        keyRotationInterval: 30,
      },
      signature: {
        algorithm: "ECDSA",
        keyId: "cat-signing-key",
      },
    });
  }

  /**
   * Создание CAT сообщения
   */
  async createCATMessage(params: {
    transactionId: string;
    blockchain: string;
    asset: string;
    amount: number;
    fromAddress: string;
    toAddress: string;
    originator: {
      type: "NATURAL" | "LEGAL";
      name: string;
      dateOfBirth?: string;
      nationality?: string;
      address?: string;
      identificationNumber?: string;
    };
    beneficiary: {
      type: "NATURAL" | "LEGAL";
      name: string;
      dateOfBirth?: string;
      nationality?: string;
      address?: string;
      identificationNumber?: string;
    };
    purpose?: string;
    sourceOfFunds?: string;
    senderVasp: VASPInfo;
    recipientVasp: VASPInfo;
  }): Promise<CATMessage> {
    const messageId = generateId("cat_msg");
    const timestamp = new Date().toISOString();

    const catMessage: CATMessage = {
      header: {
        version: this.config.version,
        messageId,
        timestamp,
        sender: {
          vaspId: params.senderVasp.id,
          name: params.senderVasp.name,
          endpoint: this.config.endpoint,
        },
        recipient: {
          vaspId: params.recipientVasp.id,
          name: params.recipientVasp.name,
          endpoint: params.recipientVasp.technicalEndpoints?.catEndpoint || "",
        },
      },
      payload: {
        transaction: {
          id: params.transactionId,
          blockchain: params.blockchain,
          asset: params.asset,
          amount: params.amount,
          fromAddress: params.fromAddress,
          toAddress: params.toAddress,
          timestamp,
        },
        originator: params.originator,
        beneficiary: params.beneficiary,
        purpose: params.purpose,
        sourceOfFunds: params.sourceOfFunds,
      },
      security: {
        signature: "",
        publicKey: "",
        algorithm: "ECDSA",
      },
    };

    // Подпись сообщения
    const signature = await this.crypto.signMessage(catMessage);
    catMessage.security.signature = signature.signature;
    catMessage.security.publicKey = signature.publicKey;

    return catMessage;
  }

  /**
   * Отправка CAT сообщения
   */
  async sendMessage(
    message: CATMessage,
    recipientVasp: VASPRegistryEntry
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Валидация сообщения
      const validationError = this.validateCATMessage(message);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Проверка подписи
      const signatureValid = await this.verifyMessageSignature(message);
      if (!signatureValid) {
        return {
          success: false,
          error: "Invalid message signature",
        };
      }

      // Определение эндпоинта получателя
      const endpoint = recipientVasp.technicalEndpoints?.catEndpoint;
      if (!endpoint) {
        return {
          success: false,
          error: "Recipient VASP does not have CAT endpoint",
        };
      }

      // Шифрование сообщения (если требуется)
      let encryptedMessage = message;
      if (recipientVasp.encryptionKeys.length > 0) {
        const encryptionKey = recipientVasp.encryptionKeys[0]; // Используем первый доступный ключ
        encryptedMessage = await this.crypto.encryptMessage(message, encryptionKey);
      }

      // Отправка сообщения
      const response = await this.sendHttpRequest(endpoint, encryptedMessage);

      if (response.success) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: response.error || "Failed to send CAT message",
        };
      }
    } catch (error) {
      SecureLogger.error("Error sending CAT message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Получение CAT сообщения
   */
  async receiveMessage(messageId: string): Promise<{
    success: boolean;
    message?: CATMessage;
    error?: string;
  }> {
    try {
      // В реальной системе здесь будет получение сообщения из очереди или по API
      // Пока возвращаем заглушку
      return {
        success: false,
        error: "CAT message receiving not implemented",
      };
    } catch (error) {
      SecureLogger.error("Error receiving CAT message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Валидация CAT сообщения
   */
  validateCATMessage(message: CATMessage): string | null {
    // Проверка заголовка
    if (!message.header) {
      return "CAT message header is required";
    }

    if (!message.header.messageId) {
      return "CAT message ID is required";
    }

    if (!message.header.version) {
      return "CAT message version is required";
    }

    if (!message.header.timestamp) {
      return "CAT message timestamp is required";
    }

    if (!message.header.sender?.vaspId) {
      return "CAT message sender VASP ID is required";
    }

    if (!message.header.recipient?.vaspId) {
      return "CAT message recipient VASP ID is required";
    }

    // Проверка полезной нагрузки
    if (!message.payload) {
      return "CAT message payload is required";
    }

    if (!message.payload.transaction?.id) {
      return "CAT transaction ID is required";
    }

    if (!message.payload.transaction?.blockchain) {
      return "CAT transaction blockchain is required";
    }

    if (!message.payload.transaction?.asset) {
      return "CAT transaction asset is required";
    }

    if (!message.payload.transaction?.amount || message.payload.transaction.amount <= 0) {
      return "CAT transaction amount must be positive";
    }

    if (!message.payload.transaction?.fromAddress) {
      return "CAT transaction from address is required";
    }

    if (!message.payload.transaction?.toAddress) {
      return "CAT transaction to address is required";
    }

    if (!message.payload.originator?.name) {
      return "CAT originator name is required";
    }

    if (!message.payload.beneficiary?.name) {
      return "CAT beneficiary name is required";
    }

    // Проверка безопасности
    if (!message.security) {
      return "CAT message security section is required";
    }

    if (!message.security.signature) {
      return "CAT message signature is required";
    }

    if (!message.security.publicKey) {
      return "CAT message public key is required";
    }

    if (!message.security.algorithm) {
      return "CAT message signature algorithm is required";
    }

    return null;
  }

  /**
   * Преобразование CAT сообщения в Travel Rule формат
   */
  convertCATToTravelRule(catMessage: CATMessage): any {
    return {
      id: catMessage.header.messageId,
      version: catMessage.header.version,
      timestamp: catMessage.header.timestamp,
      transactionId: catMessage.payload.transaction.id,
      virtualAsset: {
        type: catMessage.payload.transaction.asset,
        amount: catMessage.payload.transaction.amount,
      },
      originatingVASP: {
        vaspInfo: {
          id: catMessage.header.sender.vaspId,
          name: catMessage.header.sender.name,
        },
        customerInfo: {
          naturalPerson: catMessage.payload.originator.type === "NATURAL" ? {
            name: {
              firstName: catMessage.payload.originator.name.split(" ")[0],
              lastName: catMessage.payload.originator.name.split(" ").slice(1).join(" "),
            },
            dateOfBirth: catMessage.payload.originator.dateOfBirth,
            nationality: catMessage.payload.originator.nationality,
            addresses: catMessage.payload.originator.address ? [{
              street: catMessage.payload.originator.address,
              city: "Unknown", // CAT формат не предоставляет детальной информации
              country: catMessage.payload.originator.nationality || "Unknown",
              isPrimary: true,
              addressType: "RESIDENTIAL" as const,
            }] : [],
            identificationDocuments: catMessage.payload.originator.identificationNumber ? [{
              type: "PASSPORT" as const,
              number: catMessage.payload.originator.identificationNumber,
              issuingCountry: catMessage.payload.originator.nationality || "Unknown",
              issueDate: new Date().toISOString().split("T")[0],
            }] : [],
          } : undefined,
          legalPerson: catMessage.payload.originator.type === "LEGAL" ? {
            name: catMessage.payload.originator.name,
            registrationNumber: catMessage.payload.originator.identificationNumber,
            incorporationDate: new Date().toISOString().split("T")[0],
            jurisdiction: catMessage.payload.originator.nationality || "Unknown",
            address: {
              street: catMessage.payload.originator.address || "Unknown",
              city: "Unknown",
              country: catMessage.payload.originator.nationality || "Unknown",
            },
          } : undefined,
        },
        walletAddress: catMessage.payload.transaction.fromAddress,
        verificationLevel: "STANDARD" as const,
      },
      benefitingVASP: {
        vaspInfo: {
          id: catMessage.header.recipient.vaspId,
          name: catMessage.header.recipient.name,
        },
        customerInfo: {
          naturalPerson: catMessage.payload.beneficiary.type === "NATURAL" ? {
            name: {
              firstName: catMessage.payload.beneficiary.name.split(" ")[0],
              lastName: catMessage.payload.beneficiary.name.split(" ").slice(1).join(" "),
            },
            dateOfBirth: catMessage.payload.beneficiary.dateOfBirth,
            nationality: catMessage.payload.beneficiary.nationality,
            addresses: catMessage.payload.beneficiary.address ? [{
              street: catMessage.payload.beneficiary.address,
              city: "Unknown",
              country: catMessage.payload.beneficiary.nationality || "Unknown",
              isPrimary: true,
              addressType: "RESIDENTIAL" as const,
            }] : [],
            identificationDocuments: catMessage.payload.beneficiary.identificationNumber ? [{
              type: "PASSPORT" as const,
              number: catMessage.payload.beneficiary.identificationNumber,
              issuingCountry: catMessage.payload.beneficiary.nationality || "Unknown",
              issueDate: new Date().toISOString().split("T")[0],
            }] : [],
          } : undefined,
          legalPerson: catMessage.payload.beneficiary.type === "LEGAL" ? {
            name: catMessage.payload.beneficiary.name,
            registrationNumber: catMessage.payload.beneficiary.identificationNumber,
            incorporationDate: new Date().toISOString().split("T")[0],
            jurisdiction: catMessage.payload.beneficiary.nationality || "Unknown",
            address: {
              street: catMessage.payload.beneficiary.address || "Unknown",
              city: "Unknown",
              country: catMessage.payload.beneficiary.nationality || "Unknown",
            },
          } : undefined,
        },
        walletAddress: catMessage.payload.transaction.toAddress,
        verificationLevel: "STANDARD" as const,
      },
      purposeOfTransaction: catMessage.payload.purpose ? {
        type: "PERSONAL_EXPENSES" as const,
        description: catMessage.payload.purpose,
      } : undefined,
      sourceOfFunds: catMessage.payload.sourceOfFunds ? {
        type: "OTHER" as const,
        description: catMessage.payload.sourceOfFunds,
      } : undefined,
      technicalInformation: {
        protocol: "CAT",
        format: "JSON",
        encryption: {
          algorithm: "AES-256-GCM",
        },
        signature: {
          algorithm: catMessage.security.algorithm,
          publicKey: catMessage.security.publicKey,
          value: catMessage.security.signature,
        },
      },
    };
  }

  /**
   * Преобразование Travel Rule в CAT формат
   */
  convertTravelRuleToCAT(travelRuleMessage: any): CATMessage {
    const originator = travelRuleMessage.originatingVASP.customerInfo.naturalPerson;
    const beneficiary = travelRuleMessage.benefitingVASP.customerInfo.naturalPerson;

    return {
      header: {
        version: "1.0",
        messageId: travelRuleMessage.id,
        timestamp: travelRuleMessage.timestamp,
        sender: {
          vaspId: travelRuleMessage.originatingVASP.vaspInfo.id,
          name: travelRuleMessage.originatingVASP.vaspInfo.name,
          endpoint: "",
        },
        recipient: {
          vaspId: travelRuleMessage.benefitingVASP.vaspInfo.id,
          name: travelRuleMessage.benefitingVASP.vaspInfo.name,
          endpoint: "",
        },
      },
      payload: {
        transaction: {
          id: travelRuleMessage.transactionId,
          blockchain: "SOLANA", // По умолчанию
          asset: travelRuleMessage.virtualAsset.type,
          amount: travelRuleMessage.virtualAsset.amount,
          fromAddress: travelRuleMessage.originatingVASP.walletAddress,
          toAddress: travelRuleMessage.benefitingVASP.walletAddress,
          timestamp: travelRuleMessage.timestamp,
        },
        originator: originator ? {
          type: "NATURAL",
          name: `${originator.name.firstName} ${originator.name.lastName}`,
          dateOfBirth: originator.dateOfBirth,
          nationality: originator.nationality,
          address: originator.addresses?.[0]?.street,
          identificationNumber: originator.identificationDocuments?.[0]?.number,
        } : {
          type: "LEGAL",
          name: travelRuleMessage.originatingVASP.customerInfo.legalPerson?.name || "",
          identificationNumber: travelRuleMessage.originatingVASP.customerInfo.legalPerson?.registrationNumber,
        },
        beneficiary: beneficiary ? {
          type: "NATURAL",
          name: `${beneficiary.name.firstName} ${beneficiary.name.lastName}`,
          dateOfBirth: beneficiary.dateOfBirth,
          nationality: beneficiary.nationality,
          address: beneficiary.addresses?.[0]?.street,
          identificationNumber: beneficiary.identificationDocuments?.[0]?.number,
        } : {
          type: "LEGAL",
          name: travelRuleMessage.benefitingVASP.customerInfo.legalPerson?.name || "",
          identificationNumber: travelRuleMessage.benefitingVASP.customerInfo.legalPerson?.registrationNumber,
        },
        purpose: travelRuleMessage.purposeOfTransaction?.description,
        sourceOfFunds: travelRuleMessage.sourceOfFunds?.description,
      },
      security: {
        signature: travelRuleMessage.technicalInformation.signature?.value || "",
        publicKey: travelRuleMessage.technicalInformation.signature?.publicKey || "",
        algorithm: travelRuleMessage.technicalInformation.signature?.algorithm || "ECDSA",
      },
    };
  }

  // Приватные методы

  /**
   * Проверка подписи сообщения
   */
  private async verifyMessageSignature(message: CATMessage): Promise<boolean> {
    try {
      return await this.crypto.verifySignature(
        message,
        message.security.signature,
        message.security.publicKey
      );
    } catch (error) {
      SecureLogger.error("Error verifying CAT message signature:", error);
      return false;
    }
  }

  /**
   * Отправка HTTP запроса
   */
  private async sendHttpRequest(
    endpoint: string,
    message: CATMessage
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CAT-Version": this.config.version,
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (response.ok) {
        return {
          success: true,
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }
    } catch (error) {
      SecureLogger.error("Error sending HTTP request:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}

// Экспорт сервиса
export { CATService };