import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🌍 Travel Rule Service - FATF Compliance Implementation
 *
 * Основной сервис для реализации Travel Rule в соответствии с требованиями FATF
 * для передачи информации о транзакциях между VASP (Virtual Asset Service Providers)
 */

import {
  TravelRuleMessage,
  TravelRuleStatus,
  VASPInfo,
  VASPRegistryEntry,
  TravelRuleConfig,
  SendTravelRuleRequest,
  SendTravelRuleResponse,
  ReceiveTravelRuleRequest,
  ReceiveTravelRuleResponse,
  TravelRuleEvent,
  TravelRuleEventType,
  CATMessage,
  OFACMessage,
} from "./types";
import { CATService } from "./cat-service";
import { OFACService } from "./ofac-service";
import { TravelRuleCrypto } from "./crypto";
import { VASPRegistryService } from "./vasp-registry-service";
import { generateId } from "../aml-kyc/utils";

// Импортируем глобальный экземпляр Prisma
import { db } from "../db";

export class TravelRuleService {
  private config: TravelRuleConfig;
  private catService: CATService;
  private ofacService: OFACService;
  private crypto: TravelRuleCrypto;
  private vaspRegistry: VASPRegistryService;

  constructor(config: TravelRuleConfig) {
    this.config = config;
    this.catService = new CATService(config.protocols.cat);
    this.ofacService = new OFACService(config.protocols.ofac);
    this.crypto = new TravelRuleCrypto(config.security);
    this.vaspRegistry = new VASPRegistryService();
  }

  /**
   * Отправка Travel Rule сообщения
   */
  async sendTravelRuleMessage(
    request: SendTravelRuleRequest
  ): Promise<SendTravelRuleResponse> {
    try {
      // Валидация запроса
      const validationError = this.validateSendRequest(request);
      if (validationError) {
        return {
          success: false,
          status: "FAILED",
          error: {
            code: "VALIDATION_ERROR",
            message: validationError,
          },
        };
      }

      // Получение информации о VASP получателя
      const recipientVasp = await this.vaspRegistry.getVASPInfo(
        request.recipientVaspId
      );
      if (!recipientVasp) {
        return {
          success: false,
          status: "FAILED",
          error: {
            code: "VASP_NOT_FOUND",
            message: `Recipient VASP ${request.recipientVaspId} not found in registry`,
          },
        };
      }

      // Проверка поддержки протокола
      if (!recipientVasp.supportedProtocols.includes(request.protocol)) {
        return {
          success: false,
          status: "FAILED",
          error: {
            code: "PROTOCOL_NOT_SUPPORTED",
            message: `VASP ${request.recipientVaspId} does not support protocol ${request.protocol}`,
          },
        };
      }

      // Создание записи о сообщении
      const messageId = generateId("tr_msg");
      const timestamp = new Date().toISOString();

      // Сохранение сообщения в базу данных
      await this.saveTravelRuleMessage({
        id: messageId,
        transactionId: request.transactionId,
        senderVaspId: this.config.vaspInfo.id,
        recipientVaspId: request.recipientVaspId,
        protocol: request.protocol,
        status: "PENDING",
        timestamp,
        messageData: request.message,
        priority: request.priority || "MEDIUM",
      });

      // Отправка сообщения в зависимости от протокола
      let sendResult: { success: boolean; error?: string } = { success: false };

      switch (request.protocol) {
        case "CAT":
          sendResult = await this.catService.sendMessage(
            request.message as CATMessage,
            recipientVasp
          );
          break;
        case "OFAC":
          sendResult = await this.ofacService.sendMessage(
            request.message as OFACMessage,
            recipientVasp
          );
          break;
        default:
          sendResult = {
            success: false,
            error: `Protocol ${request.protocol} not implemented`,
          };
      }

      if (!sendResult.success) {
        // Обновление статуса на FAILED
        await this.updateMessageStatus(messageId, "FAILED");
        return {
          success: false,
          status: "FAILED",
          error: {
            code: "SEND_FAILED",
            message: sendResult.error || "Unknown error occurred",
          },
        };
      }

      // Обновление статуса на SENT
      await this.updateMessageStatus(messageId, "SENT");

      // Создание события
      await this.createEvent({
        id: generateId("tr_event"),
        type: "MESSAGE_SENT",
        timestamp,
        messageId,
        transactionId: request.transactionId,
        vaspId: request.recipientVaspId,
        data: {
          protocol: request.protocol,
          recipientVaspId: request.recipientVaspId,
        },
        severity: "LOW",
        processed: false,
      });

      return {
        success: true,
        messageId,
        status: "SENT",
        timestamp,
      };
    } catch (error) {
      SecureLogger.error("Error sending Travel Rule message:", error);
      return {
        success: false,
        status: "FAILED",
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Получение Travel Rule сообщений
   */
  async receiveTravelRuleMessages(
    request: ReceiveTravelRuleRequest
  ): Promise<ReceiveTravelRuleResponse> {
    try {
      const whereClause: any = {
        recipientVaspId: this.config.vaspInfo.id,
      };

      if (request.messageId) {
        whereClause.id = request.messageId;
      }

      if (request.transactionId) {
        whereClause.transactionId = request.transactionId;
      }

      if (request.senderVaspId) {
        whereClause.senderVaspId = request.senderVaspId;
      }

      if (request.status) {
        whereClause.status = request.status;
      }

      if (request.dateFrom || request.dateTo) {
        whereClause.timestamp = {};
        if (request.dateFrom) {
          whereClause.timestamp.gte = new Date(request.dateFrom);
        }
        if (request.dateTo) {
          whereClause.timestamp.lte = new Date(request.dateTo);
        }
      }

      const messages = await db.travelRuleMessage.findMany({
        where: whereClause,
        take: request.limit || 50,
        skip: request.offset || 0,
        orderBy: { timestamp: "desc" },
      });

      const totalCount = await db.travelRuleMessage.count({
        where: whereClause,
      });

      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        transactionId: msg.transactionId,
        senderVaspId: msg.senderVaspId,
        recipientVaspId: msg.recipientVaspId,
        protocol: msg.protocol,
        status: msg.status as TravelRuleStatus,
        timestamp: msg.timestamp.toISOString(),
        message: msg.messageData as TravelRuleMessage | CATMessage | OFACMessage,
      }));

      return {
        success: true,
        messages: formattedMessages,
        totalCount,
        hasMore: (request.offset || 0) + messages.length < totalCount,
      };
    } catch (error) {
      SecureLogger.error("Error receiving Travel Rule messages:", error);
      return {
        success: false,
        messages: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Обработка входящего Travel Rule сообщения
   */
  async processIncomingMessage(
    messageId: string,
    protocol: string
  ): Promise<{ success: boolean; status: TravelRuleStatus; error?: string }> {
    try {
      // Получение сообщения из базы данных
      const message = await db.travelRuleMessage.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return {
          success: false,
          status: "FAILED",
          error: "Message not found",
        };
      }

      if (message.status !== "RECEIVED") {
        return {
          success: false,
          status: message.status as TravelRuleStatus,
          error: `Message already processed (status: ${message.status})`,
        };
      }

      // Расшифровка сообщения (если необходимо)
      let decryptedMessage: any;
      try {
        decryptedMessage = await this.crypto.decryptMessage(message.messageData);
      } catch (error) {
        SecureLogger.error("Error decrypting message:", error);
        await this.updateMessageStatus(messageId, "FAILED");
        return {
          success: false,
          status: "FAILED",
          error: "Message decryption failed",
        };
      }

      // Валидация сообщения
      const validationError = this.validateIncomingMessage(
        decryptedMessage,
        protocol
      );
      if (validationError) {
        await this.updateMessageStatus(messageId, "REJECTED");
        return {
          success: false,
          status: "REJECTED",
          error: validationError,
        };
      }

      // AML/санкционная проверка
      const screeningResult = await this.performScreening(decryptedMessage);
      if (screeningResult.requiresBlocking) {
        await this.updateMessageStatus(messageId, "REJECTED");
        return {
          success: false,
          status: "REJECTED",
          error: "Message blocked due to screening results",
        };
      }

      // Обновление статуса на ACKNOWLEDGED
      await this.updateMessageStatus(messageId, "ACKNOWLEDGED");

      // Создание события
      await this.createEvent({
        id: generateId("tr_event"),
        type: "MESSAGE_RECEIVED",
        timestamp: new Date().toISOString(),
        messageId,
        transactionId: message.transactionId,
        vaspId: message.senderVaspId,
        data: {
          protocol,
          screeningResult,
        },
        severity: screeningResult.requiresReview ? "MEDIUM" : "LOW",
        processed: false,
      });

      return {
        success: true,
        status: "ACKNOWLEDGED",
      };
    } catch (error) {
      SecureLogger.error("Error processing incoming message:", error);
      return {
        success: false,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Подтверждение получения сообщения
   */
  async acknowledgeMessage(
    messageId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = await db.travelRuleMessage.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return {
          success: false,
          error: "Message not found",
        };
      }

      if (message.status !== "ACKNOWLEDGED") {
        return {
          success: false,
          error: `Cannot acknowledge message with status: ${message.status}`,
        };
      }

      await this.updateMessageStatus(messageId, "COMPLETED");

      // Создание события
      await this.createEvent({
        id: generateId("tr_event"),
        type: "MESSAGE_ACKNOWLEDGED",
        timestamp: new Date().toISOString(),
        messageId,
        transactionId: message.transactionId,
        vaspId: message.senderVaspId,
        data: {},
        severity: "LOW",
        processed: false,
      });

      return {
        success: true,
      };
    } catch (error) {
      SecureLogger.error("Error acknowledging message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Получение статистики Travel Rule
   */
  async getStatistics(): Promise<{
    totalMessages: number;
    sentMessages: number;
    receivedMessages: number;
    completedMessages: number;
    failedMessages: number;
    averageProcessingTime: number;
  }> {
    try {
      const totalMessages = await db.travelRuleMessage.count();
      const sentMessages = await db.travelRuleMessage.count({
        where: { senderVaspId: this.config.vaspInfo.id },
      });
      const receivedMessages = await db.travelRuleMessage.count({
        where: { recipientVaspId: this.config.vaspInfo.id },
      });
      const completedMessages = await db.travelRuleMessage.count({
        where: { status: "COMPLETED" },
      });
      const failedMessages = await db.travelRuleMessage.count({
        where: { status: "FAILED" },
      });

      // Расчет среднего времени обработки (упрощенный)
      const processingTimes = await db.travelRuleMessage.aggregate({
        where: {
          status: { in: ["COMPLETED", "FAILED"] },
        },
        _avg: {
          processingTime: true,
        },
      });

      const averageProcessingTime = processingTimes._avg.processingTime || 0;

      return {
        totalMessages,
        sentMessages,
        receivedMessages,
        completedMessages,
        failedMessages,
        averageProcessingTime: Number(averageProcessingTime),
      };
    } catch (error) {
      SecureLogger.error("Error getting Travel Rule statistics:", error);
      return {
        totalMessages: 0,
        sentMessages: 0,
        receivedMessages: 0,
        completedMessages: 0,
        failedMessages: 0,
        averageProcessingTime: 0,
      };
    }
  }

  // Приватные методы

  /**
   * Валидация запроса на отправку
   */
  private validateSendRequest(request: SendTravelRuleRequest): string | null {
    if (!request.transactionId) {
      return "Transaction ID is required";
    }

    if (!request.recipientVaspId) {
      return "Recipient VASP ID is required";
    }

    if (!request.protocol) {
      return "Protocol is required";
    }

    if (!request.message) {
      return "Message is required";
    }

    if (!["CAT", "OFAC"].includes(request.protocol)) {
      return "Unsupported protocol";
    }

    return null;
  }

  /**
   * Валидация входящего сообщения
   */
  private validateIncomingMessage(
    message: any,
    protocol: string
  ): string | null {
    try {
      switch (protocol) {
        case "CAT":
          return this.validateCATMessage(message as CATMessage);
        case "OFAC":
          return this.validateOFACMessage(message as OFACMessage);
        default:
          return `Unsupported protocol: ${protocol}`;
      }
    } catch (error) {
      return `Message validation error: ${error}`;
    }
  }

  /**
   * Валидация CAT сообщения
   */
  private validateCATMessage(message: CATMessage): string | null {
    if (!message.header?.messageId) {
      return "CAT message missing messageId";
    }

    if (!message.payload?.transaction?.id) {
      return "CAT message missing transaction ID";
    }

    if (!message.payload?.originator?.name) {
      return "CAT message missing originator name";
    }

    if (!message.payload?.beneficiary?.name) {
      return "CAT message missing beneficiary name";
    }

    return null;
  }

  /**
   * Валидация OFAC сообщения
   */
  private validateOFACMessage(message: OFACMessage): string | null {
    if (!message.header?.messageId) {
      return "OFAC message missing messageId";
    }

    if (!message.screeningRequest?.entities?.length) {
      return "OFAC message missing entities to screen";
    }

    if (!message.screeningRequest?.transaction?.id) {
      return "OFAC message missing transaction ID";
    }

    return null;
  }

  /**
   * Выполнение AML/санкционной проверки
   */
  private async performScreening(
    message: any
  ): Promise<{ requiresBlocking: boolean; requiresReview: boolean }> {
    try {
      // Базовая проверка на основе существующего AML сервиса
      // В реальной системе здесь будет интеграция с Chainalysis и другими сервисами

      // Упрощенная логика проверки
      const screeningResult = {
        requiresBlocking: false,
        requiresReview: false,
      };

      // Проверка на высокорисковые страны
      if (message.payload?.originator?.nationality) {
        const highRiskCountries = ["AF", "IR", "KP", "MM", "SY", "VE", "YE", "ZW"];
        if (highRiskCountries.includes(message.payload.originator.nationality)) {
          screeningResult.requiresReview = true;
        }
      }

      if (message.payload?.beneficiary?.nationality) {
        const highRiskCountries = ["AF", "IR", "KP", "MM", "SY", "VE", "YE", "ZW"];
        if (highRiskCountries.includes(message.payload.beneficiary.nationality)) {
          screeningResult.requiresReview = true;
        }
      }

      // Проверка на большие суммы
      if (message.payload?.transaction?.amount > 10000) {
        screeningResult.requiresReview = true;
      }

      return screeningResult;
    } catch (error) {
      SecureLogger.error("Error performing screening:", error);
      return {
        requiresBlocking: false,
        requiresReview: true, // При ошибке требуем ручной проверки
      };
    }
  }

  /**
   * Сохранение Travel Rule сообщения в базу данных
   */
  private async saveTravelRuleMessage(message: {
    id: string;
    transactionId: string;
    senderVaspId: string;
    recipientVaspId: string;
    protocol: string;
    status: TravelRuleStatus;
    timestamp: string;
    messageData: any;
    priority: string;
  }): Promise<void> {
    await db.travelRuleMessage.upsert({
      where: { id: message.id },
      update: {
        transactionId: message.transactionId,
        senderVaspId: message.senderVaspId,
        recipientVaspId: message.recipientVaspId,
        protocol: message.protocol,
        status: message.status,
        timestamp: new Date(message.timestamp),
        messageData: message.messageData as any,
        priority: message.priority,
      },
      create: {
        id: message.id,
        transactionId: message.transactionId,
        senderVaspId: message.senderVaspId,
        recipientVaspId: message.recipientVaspId,
        protocol: message.protocol,
        status: message.status,
        timestamp: new Date(message.timestamp),
        messageData: message.messageData as any,
        priority: message.priority,
      },
    });
  }

  /**
   * Обновление статуса сообщения
   */
  private async updateMessageStatus(
    messageId: string,
    status: TravelRuleStatus
  ): Promise<void> {
    await db.travelRuleMessage.update({
      where: { id: messageId },
      data: {
        status,
        updatedAt: new Date(),
        processingTime: status === "COMPLETED" || status === "FAILED"
          ? Math.floor((Date.now() - new Date().getTime()) / 1000)
          : undefined,
      },
    });
  }

  /**
   * Создание события Travel Rule
   */
  private async createEvent(event: TravelRuleEvent): Promise<void> {
    await db.travelRuleEvent.upsert({
      where: { id: event.id },
      update: {
        type: event.type,
        timestamp: new Date(event.timestamp),
        messageId: event.messageId || null,
        transactionId: event.transactionId || null,
        vaspId: event.vaspId || null,
        data: event.data as any,
        severity: event.severity,
        processed: event.processed,
      },
      create: {
        id: event.id,
        type: event.type,
        timestamp: new Date(event.timestamp),
        messageId: event.messageId || null,
        transactionId: event.transactionId || null,
        vaspId: event.vaspId || null,
        data: event.data as any,
        severity: event.severity,
        processed: event.processed,
      },
    });
  }
}

// Экспорт сервиса
export { TravelRuleService };