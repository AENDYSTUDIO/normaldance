import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🛡️ OFAC Service - Office of Foreign Assets Control Integration
 *
 * Сервис для работы с OFAC форматом и проверки санкционных списков
 * в соответствии с требованиями OFAC и международными стандартами
 */

import { OFACMessage, VASPInfo, VASPRegistryEntry } from "./types";
import { TravelRuleCrypto } from "./crypto";
import { generateId } from "../aml-kyc/utils";

export interface OFACConfig {
  enabled: boolean;
  endpoint: string;
  apiKey?: string;
  updateInterval: number; // в часах
  timeout: number; // в миллисекундах
  retryAttempts: number;
}

export interface OFACScreeningResult {
  matches: Array<{
    entity: {
      name: string;
      type: string;
      list: string;
      score: number;
    };
    confidence: number;
    details: string;
  }>;
  recommendation: "APPROVE" | "REVIEW" | "BLOCK";
  processedAt: string;
  requiresBlocking: boolean;
  requiresReview: boolean;
}

export class OFACService {
  private config: OFACConfig;
  private crypto: TravelRuleCrypto;
  private sanctionsCache: Map<string, any> = new Map();
  private lastCacheUpdate: Date = new Date(0);

  constructor(config: OFACConfig) {
    this.config = config;
    this.crypto = new TravelRuleCrypto({
      encryption: {
        algorithm: "AES-256-GCM",
        keyRotationInterval: 30,
      },
      signature: {
        algorithm: "ECDSA",
        keyId: "ofac-signing-key",
      },
    });

    // Инициализация периодического обновления кэша
    this.initializeCacheUpdate();
  }

  /**
   * Создание OFAC сообщения для проверки
   */
  async createOFACMessage(params: {
    transactionId: string;
    amount: number;
    currency: string;
    date: string;
    entities: Array<{
      type: "INDIVIDUAL" | "ENTITY";
      name: string;
      aliases?: string[];
      dateOfBirth?: string;
      nationality?: string;
      addresses?: string[];
      identificationNumbers?: string[];
      additionalInfo?: Record<string, any>;
    }>;
    parties: Array<{
      type: "ORIGINATOR" | "BENEFICIARY";
      name: string;
      address?: string;
      accountNumber?: string;
    }>;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }): Promise<OFACMessage> {
    const messageId = generateId("ofac_msg");
    const timestamp = new Date().toISOString();

    const ofacMessage: OFACMessage = {
      header: {
        version: "1.0",
        timestamp,
        messageId,
        priority: params.priority || "MEDIUM",
      },
      screeningRequest: {
        entities: params.entities,
        transaction: {
          id: params.transactionId,
          amount: params.amount,
          currency: params.currency,
          date: params.date,
          parties: params.parties,
        },
      },
    };

    return ofacMessage;
  }

  /**
   * Отправка OFAC сообщения на проверку
   */
  async sendMessage(
    message: OFACMessage,
    recipientVasp: VASPRegistryEntry
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Валидация сообщения
      const validationError = this.validateOFACMessage(message);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Выполнение проверки санкционных списков
      const screeningResult = await this.performOFACScreening(message);

      // Добавление результатов в сообщение
      message.response = {
        matches: screeningResult.matches,
        recommendation: screeningResult.recommendation,
        processedAt: screeningResult.processedAt,
      };

      // Если требуется блокировка, возвращаем ошибку
      if (screeningResult.requiresBlocking) {
        return {
          success: false,
          error: `Transaction blocked due to OFAC screening: ${screeningResult.matches.map(m => m.entity.name).join(", ")}`,
        };
      }

      // Определение эндпоинта получателя
      const endpoint = recipientVasp.technicalEndpoints?.ofacEndpoint;
      if (!endpoint) {
        return {
          success: false,
          error: "Recipient VASP does not have OFAC endpoint",
        };
      }

      // Шифрование сообщения (если требуется)
      let encryptedMessage = message;
      if (recipientVasp.encryptionKeys.length > 0) {
        const encryptionKey = recipientVasp.encryptionKeys[0];
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
          error: response.error || "Failed to send OFAC message",
        };
      }
    } catch (error) {
      SecureLogger.error("Error sending OFAC message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Выполнение OFAC проверки
   */
  async performOFACScreening(message: OFACMessage): Promise<OFACScreeningResult> {
    try {
      const matches: Array<{
        entity: {
          name: string;
          type: string;
          list: string;
          score: number;
        };
        confidence: number;
        details: string;
      }> = [];

      // Обновление кэша санкционных списков при необходимости
      await this.updateSanctionsCacheIfNeeded();

      // Проверка каждой сущности
      for (const entity of message.screeningRequest.entities) {
        const entityMatches = await this.screenEntity(entity);
        matches.push(...entityMatches);
      }

      // Определение рекомендации
      const recommendation = this.determineRecommendation(matches);

      const result: OFACScreeningResult = {
        matches,
        recommendation,
        processedAt: new Date().toISOString(),
        requiresBlocking: recommendation === "BLOCK",
        requiresReview: recommendation === "REVIEW" || recommendation === "BLOCK",
      };

      return result;
    } catch (error) {
      SecureLogger.error("Error performing OFAC screening:", error);
      return {
        matches: [],
        recommendation: "REVIEW",
        processedAt: new Date().toISOString(),
        requiresBlocking: false,
        requiresReview: true,
      };
    }
  }

  /**
   * Проверка отдельной сущности
   */
  private async screenEntity(entity: {
    type: "INDIVIDUAL" | "ENTITY";
    name: string;
    aliases?: string[];
    dateOfBirth?: string;
    nationality?: string;
    addresses?: string[];
    identificationNumbers?: string[];
  }): Promise<Array<{
    entity: {
      name: string;
      type: string;
      list: string;
      score: number;
    };
    confidence: number;
    details: string;
  }>> {
    const matches: Array<{
      entity: {
        name: string;
        type: string;
        list: string;
        score: number;
      };
      confidence: number;
      details: string;
    }> = [];

    // Проверка по основному имени
    const nameMatches = this.checkNameAgainstSanctions(entity.name);
    matches.push(...nameMatches);

    // Проверка по псевдонимам
    if (entity.aliases) {
      for (const alias of entity.aliases) {
        const aliasMatches = this.checkNameAgainstSanctions(alias);
        matches.push(...aliasMatches);
      }
    }

    // Проверка по номерам документов
    if (entity.identificationNumbers) {
      for (const idNumber of entity.identificationNumbers) {
        const idMatches = this.checkIdentificationAgainstSanctions(idNumber);
        matches.push(...idMatches);
      }
    }

    // Проверка по национальности
    if (entity.nationality) {
      const nationalityMatches = this.checkNationalityAgainstSanctions(entity.nationality);
      matches.push(...nationalityMatches);
    }

    return matches;
  }

  /**
   * Проверка имени по санкционным спискам
   */
  private checkNameAgainstSanctions(name: string): Array<{
    entity: {
      name: string;
      type: string;
      list: string;
      score: number;
    };
    confidence: number;
    details: string;
  }> {
    const matches: Array<{
      entity: {
        name: string;
        type: string;
        list: string;
        score: number;
      };
      confidence: number;
      details: string;
    }> = [];

    const normalizedName = name.toLowerCase().trim();

    // Проверка по кэшированным санкционным спискам
    for (const [listName, sanctionsList] of this.sanctionsCache) {
      for (const entry of sanctionsList.entries || []) {
        // Проверка основного имени
        if (entry.name && entry.name.toLowerCase().includes(normalizedName)) {
          matches.push({
            entity: {
              name: entry.name,
              type: entry.type || "UNKNOWN",
              list: listName,
              score: this.calculateMatchScore(name, entry.name),
            },
            confidence: this.calculateConfidence(name, entry.name),
            details: `Name match: ${name} -> ${entry.name}`,
          });
        }

        // Проверка по псевдонимам
        if (entry.aliases) {
          for (const alias of entry.aliases) {
            if (alias.toLowerCase().includes(normalizedName)) {
              matches.push({
                entity: {
                  name: entry.name,
                  type: entry.type || "UNKNOWN",
                  list: listName,
                  score: this.calculateMatchScore(name, alias),
                },
                confidence: this.calculateConfidence(name, alias),
                details: `Alias match: ${name} -> ${alias}`,
              });
            }
          }
        }
      }
    }

    return matches;
  }

  /**
   * Проверка номера документа по санкционным спискам
   */
  private checkIdentificationAgainstSanctions(idNumber: string): Array<{
    entity: {
      name: string;
      type: string;
      list: string;
      score: number;
    };
    confidence: number;
    details: string;
  }> {
    const matches: Array<{
      entity: {
        name: string;
        type: string;
        list: string;
        score: number;
      };
      confidence: number;
      details: string;
    }> = [];

    const normalizedId = idNumber.toLowerCase().trim();

    for (const [listName, sanctionsList] of this.sanctionsCache) {
      for (const entry of sanctionsList.entries || []) {
        if (entry.identificationNumbers) {
          for (const sanctionId of entry.identificationNumbers) {
            if (sanctionId.toLowerCase().includes(normalizedId)) {
              matches.push({
                entity: {
                  name: entry.name,
                  type: entry.type || "UNKNOWN",
                  list: listName,
                  score: 95, // Высокий балл для совпадения ID
                },
                confidence: 95,
                details: `ID match: ${idNumber} -> ${sanctionId}`,
              });
            }
          }
        }
      }
    }

    return matches;
  }

  /**
   * Проверка национальности по санкционным спискам
   */
  private checkNationalityAgainstSanctions(nationality: string): Array<{
    entity: {
      name: string;
      type: string;
      list: string;
      score: number;
    };
    confidence: number;
    details: string;
  }> {
    const matches: Array<{
      entity: {
        name: string;
        type: string;
        list: string;
        score: number;
      };
      confidence: number;
      details: string;
    }> = [];

    // Список стран под санкциями
    const sanctionedCountries = ["AF", "IR", "KP", "MM", "SY", "VE", "YE", "ZW", "RU", "BY"];

    if (sanctionedCountries.includes(nationality.toUpperCase())) {
      matches.push({
        entity: {
          name: `Country: ${nationality}`,
          type: "COUNTRY",
          list: "GEOGRAPHIC_SANCTIONS",
          score: 80,
        },
        confidence: 100,
        details: `Nationality from sanctioned country: ${nationality}`,
      });
    }

    return matches;
  }

  /**
   * Расчет оценки совпадения
   */
  private calculateMatchScore(input: string, match: string): number {
    const inputLower = input.toLowerCase();
    const matchLower = match.toLowerCase();

    if (inputLower === matchLower) {
      return 100;
    }

    if (inputLower.includes(matchLower) || matchLower.includes(inputLower)) {
      return 85;
    }

    // Простая метрика схожести (в реальной системе использовать более сложные алгоритмы)
    const similarity = this.calculateSimilarity(inputLower, matchLower);
    return Math.round(similarity * 100);
  }

  /**
   * Расчет уверенности в совпадении
   */
  private calculateConfidence(input: string, match: string): number {
    const score = this.calculateMatchScore(input, match);
    
    if (score >= 95) return 95;
    if (score >= 85) return 80;
    if (score >= 70) return 60;
    if (score >= 50) return 40;
    return 20;
  }

  /**
   * Расчет схожести строк
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Расчет расстояния Левенштейна
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Определение рекомендации на основе совпадений
   */
  private determineRecommendation(matches: Array<{
    entity: {
      name: string;
      type: string;
      list: string;
      score: number;
    };
    confidence: number;
    details: string;
  }>): "APPROVE" | "REVIEW" | "BLOCK" {
    if (matches.length === 0) {
      return "APPROVE";
    }

    // Проверка на высокорисковые совпадения
    const highRiskMatches = matches.filter(m => m.confidence >= 90);
    if (highRiskMatches.length > 0) {
      return "BLOCK";
    }

    // Проверка на среднерисковые совпадения
    const mediumRiskMatches = matches.filter(m => m.confidence >= 70);
    if (mediumRiskMatches.length > 0) {
      return "REVIEW";
    }

    // Низкорисковые совпадения
    return "REVIEW";
  }

  /**
   * Валидация OFAC сообщения
   */
  validateOFACMessage(message: OFACMessage): string | null {
    // Проверка заголовка
    if (!message.header) {
      return "OFAC message header is required";
    }

    if (!message.header.messageId) {
      return "OFAC message ID is required";
    }

    if (!message.header.version) {
      return "OFAC message version is required";
    }

    if (!message.header.timestamp) {
      return "OFAC message timestamp is required";
    }

    // Проверка запроса на скрининг
    if (!message.screeningRequest) {
      return "OFAC screening request is required";
    }

    if (!message.screeningRequest.entities || message.screeningRequest.entities.length === 0) {
      return "OFAC screening request entities are required";
    }

    if (!message.screeningRequest.transaction) {
      return "OFAC screening request transaction is required";
    }

    if (!message.screeningRequest.transaction.id) {
      return "OFAC transaction ID is required";
    }

    if (!message.screeningRequest.transaction.amount || message.screeningRequest.transaction.amount <= 0) {
      return "OFAC transaction amount must be positive";
    }

    if (!message.screeningRequest.transaction.currency) {
      return "OFAC transaction currency is required";
    }

    if (!message.screeningRequest.transaction.date) {
      return "OFAC transaction date is required";
    }

    return null;
  }

  /**
   * Обновление кэша санкционных списков
   */
  private async updateSanctionsCacheIfNeeded(): Promise<void> {
    const now = new Date();
    const hoursSinceLastUpdate = (now.getTime() - this.lastCacheUpdate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastUpdate >= this.config.updateInterval) {
      await this.updateSanctionsCache();
      this.lastCacheUpdate = now;
    }
  }

  /**
   * Обновление кэша санкционных списков
   */
  private async updateSanctionsCache(): Promise<void> {
    try {
      // В реальной системе здесь будет загрузка из внешних источников
      // Пока используем моковые данные

      const mockSanctionsLists = {
        "OFAC_SDN": {
          entries: [
            {
              name: "John Doe",
              type: "INDIVIDUAL",
              aliases: ["J. Doe", "Johnny Doe"],
              identificationNumbers: ["PASS123456"],
            },
            {
              name: "Evil Corp",
              type: "ENTITY",
              aliases: ["Evil Corporation"],
              identificationNumbers: ["REG789012"],
            },
          ],
        },
        "EU_SANCTIONS": {
          entries: [
            {
              name: "Jane Smith",
              type: "INDIVIDUAL",
              aliases: ["J. Smith"],
              identificationNumbers: ["ID987654"],
            },
          ],
        },
      };

      this.sanctionsCache.clear();
      for (const [listName, list] of Object.entries(mockSanctionsLists)) {
        this.sanctionsCache.set(listName, list);
      }

      SecureLogger.log("Sanctions cache updated successfully");
    } catch (error) {
      SecureLogger.error("Error updating sanctions cache:", error);
    }
  }

  /**
   * Инициализация периодического обновления кэша
   */
  private initializeCacheUpdate(): void {
    // Обновление кэша при инициализации
    this.updateSanctionsCache();

    // Установка периодического обновления
    setInterval(() => {
      this.updateSanctionsCache();
    }, this.config.updateInterval * 60 * 60 * 1000); // Преобразование часов в миллисекунды
  }

  /**
   * Отправка HTTP запроса
   */
  private async sendHttpRequest(
    endpoint: string,
    message: OFACMessage
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OFAC-Version": "1.0",
          ...(this.config.apiKey && { "Authorization": `Bearer ${this.config.apiKey}` }),
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
export { OFACService };