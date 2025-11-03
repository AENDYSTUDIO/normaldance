import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🛡️ AML Service - Anti-Money Laundering System
 *
 * Сервис для мониторинга транзакций и предотвращения отмывания денег
 * в соответствии с требованиями FATF и международными стандартами
 */

import {
  AMLKYCEvent,
  AMLRiskLevel,
  AMLRule,
  AMLRuleAction,
  AMLRuleCondition,
  MonitoredTransaction,
  MonitoringStatus,
  SanctionsEntry,
  SanctionsList,
  TransactionMonitoringParams,
  TransactionType,
  UserRiskAssessment,
} from "./types";

import { ComplianceService } from "./compliance-service";
import { generateId } from "./utils";

// Импортируем глобальный экземпляр Prisma
import { prisma } from "../../lib/db";

export class AMLService {
  private complianceService: ComplianceService;
  private sanctionsLists: Map<string, SanctionsList> = new Map();

  constructor() {
    this.complianceService = new ComplianceService();
    this.loadSanctionsLists();
  }

  /**
   * Мониторинг транзакции в реальном времени
   */
  async monitorTransaction(
    transaction: Omit<
      MonitoredTransaction,
      "id" | "riskScore" | "riskLevel" | "monitoringStatus"
    >
  ): Promise<MonitoredTransaction> {
    try {
      // Создаем мониторинговую транзакцию с начальными значениями
      const monitoredTransaction: MonitoredTransaction = {
        id: generateId("tx"),
        transactionHash: transaction.transactionHash,
        userId: transaction.userId,
        walletAddress: transaction.walletAddress,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        timestamp: transaction.timestamp,
        blockNumber: transaction.blockNumber,
        riskScore: 0,
        riskLevel: "LOW",
        monitoringStatus: "CLEARED",
        additionalData: transaction.additionalData || {},
      };

      // Расчет риска транзакции
      const riskAssessment = await this.assessTransactionRisk(
        monitoredTransaction
      );
      monitoredTransaction.riskScore = riskAssessment.riskScore;
      monitoredTransaction.riskLevel = riskAssessment.riskLevel;

      // Проверка санкционных списков
      const sanctionsMatch = await this.checkSanctionsLists(
        monitoredTransaction
      );
      if (sanctionsMatch) {
        monitoredTransaction.riskScore = Math.max(
          monitoredTransaction.riskScore,
          90
        );
        monitoredTransaction.riskLevel = "CRITICAL";
        monitoredTransaction.flaggedReasons = [
          ...(monitoredTransaction.flaggedReasons || []),
          `Sanctions list match: ${
            sanctionsMatch.type
          } - ${sanctionsMatch.names.join(", ")}`,
        ];
      }

      // Проверка транзакции по AML правилам
      const ruleViolations = await this.checkAgainstAMLRules(
        monitoredTransaction
      );
      if (ruleViolations.length > 0) {
        monitoredTransaction.flaggedReasons = [
          ...(monitoredTransaction.flaggedReasons || []),
          ...ruleViolations,
        ];
      }

      // Обновление статуса мониторинга на основе риска
      monitoredTransaction.monitoringStatus = this.calculateMonitoringStatus(
        monitoredTransaction.riskLevel,
        monitoredTransaction.flaggedReasons?.length || 0
      );

      // Сохранение транзакции в базу данных
      await this.saveMonitoredTransaction(monitoredTransaction);

      // Создание события AML/KYC
      await this.createEvent({
        id: generateId("event"),
        type:
          monitoredTransaction.monitoringStatus === "FLAGGED" ||
          monitoredTransaction.monitoringStatus === "SUSPICIOUS"
            ? "TRANSACTION_FLAGGED"
            : "KYC_SUBMITTED",
        userId: monitoredTransaction.userId,
        walletAddress: monitoredTransaction.walletAddress,
        timestamp: new Date().toISOString(),
        data: {
          transactionId: monitoredTransaction.id,
          riskScore: monitoredTransaction.riskScore,
          riskLevel: monitoredTransaction.riskLevel,
          monitoringStatus: monitoredTransaction.monitoringStatus,
          flaggedReasons: monitoredTransaction.flaggedReasons,
        },
        severity: this.getEventSeverity(monitoredTransaction.riskLevel),
        processed: false,
      });

      // Если транзакция подозрительна, создаем SAR
      if (
        monitoredTransaction.monitoringStatus === "SUSPICIOUS" ||
        monitoredTransaction.monitoringStatus === "REPORTED"
      ) {
        await this.createSARForTransaction(monitoredTransaction);
      }

      return monitoredTransaction;
    } catch (error) {
      SecureLogger.error("Error monitoring transaction:", error);
      throw error;
    }
  }

  /**
   * Расчет риска транзакции
   */
  async assessTransactionRisk(
    transaction: MonitoredTransaction
  ): Promise<{ riskScore: number; riskLevel: AMLRiskLevel }> {
    try {
      // Инициализируем оценку риска
      const riskFactors: Array<{
        category: string;
        name: string;
        score: number;
        weight: number;
      }> = [];

      // Риск на основе суммы транзакции
      const amountRisk = this.calculateAmountRisk(
        transaction.amount,
        transaction.currency
      );
      riskFactors.push({
        category: "TRANSACTIONAL",
        name: "Amount Risk",
        score: amountRisk,
        weight: 30,
      });

      // Риск на основе типа транзакции
      const typeRisk = this.calculateTransactionTypeRisk(transaction.type);
      riskFactors.push({
        category: "TRANSACTIONAL",
        name: "Transaction Type Risk",
        score: typeRisk,
        weight: 20,
      });

      // Риск на основе частоты транзакций пользователя
      const frequencyRisk = await this.calculateUserTransactionFrequencyRisk(
        transaction.userId,
        transaction.timestamp
      );
      riskFactors.push({
        category: "BEHAVIORAL",
        name: "Transaction Frequency Risk",
        score: frequencyRisk,
        weight: 25,
      });

      // Риск на основе географического расположения
      const geoRisk = await this.calculateGeographicRisk(
        transaction.fromAddress,
        transaction.toAddress
      );
      riskFactors.push({
        category: "GEOGRAPHIC",
        name: "Geographic Risk",
        score: geoRisk,
        weight: 25,
      });

      // Вычисляем общий риск
      let totalWeight = 0;
      let weightedScore = 0;

      for (const factor of riskFactors) {
        totalWeight += factor.weight;
        weightedScore += factor.score * factor.weight;
      }

      const overallRiskScore = Math.round(weightedScore / totalWeight);
      const riskLevel = this.getRiskLevelFromScore(overallRiskScore);

      return {
        riskScore: overallRiskScore,
        riskLevel,
      };
    } catch (error) {
      SecureLogger.error("Error assessing transaction risk:", error);
      // Возвращаем средний риск в случае ошибки
      return {
        riskScore: 50,
        riskLevel: "MEDIUM",
      };
    }
  }

  /**
   * Проверка транзакции по санкционным спискам
   */
  async checkSanctionsLists(
    transaction: MonitoredTransaction
  ): Promise<SanctionsEntry | null> {
    try {
      // Проверяем адреса отправителя и получателя в санкционных списках
      for (const [_, sanctionsList] of this.sanctionsLists) {
        for (const entry of sanctionsList.entries) {
          // Проверяем совпадения по адресам (если они есть в данных)
          if (entry.identificationNumbers) {
            for (const idNumber of entry.identificationNumbers) {
              if (
                transaction.fromAddress.includes(idNumber) ||
                transaction.toAddress.includes(idNumber)
              ) {
                return entry;
              }
            }
          }

          // Проверяем совпадения по именам (если есть пользовательские данные)
          if (
            transaction.additionalData &&
            transaction.additionalData.senderName
          ) {
            for (const name of entry.names) {
              if (
                transaction.additionalData.senderName
                  .toLowerCase()
                  .includes(name.toLowerCase())
              ) {
                return entry;
              }
            }
          }

          if (
            transaction.additionalData &&
            transaction.additionalData.recipientName
          ) {
            for (const name of entry.names) {
              if (
                transaction.additionalData.recipientName
                  .toLowerCase()
                  .includes(name.toLowerCase())
              ) {
                return entry;
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      SecureLogger.error("Error checking sanctions lists:", error);
      return null;
    }
  }

  /**
   * Проверка транзакции по AML правилам
   */
  async checkAgainstAMLRules(
    transaction: MonitoredTransaction
  ): Promise<string[]> {
    try {
      const violations: string[] = [];

      // Получаем активные AML правила
      const activeRules = await this.getActiveAMLRules();

      for (const rule of activeRules) {
        if (!rule.isActive) continue;

        let ruleTriggered = false;

        // Проверяем условия правила
        for (const condition of rule.conditions) {
          const conditionMet = this.evaluateRuleCondition(
            condition,
            transaction
          );
          if (conditionMet) {
            ruleTriggered = true;

            // Выполняем действия правила
            for (const action of rule.actions) {
              await this.executeRuleAction(action, transaction, rule);
            }

            violations.push(`${rule.name}: ${rule.description}`);
            break; // Останавливаемся на первом сработавшем условии для этого правила
          }
        }
      }

      return violations;
    } catch (error) {
      SecureLogger.error("Error checking against AML rules:", error);
      return [];
    }
  }

  /**
   * Получение активных AML правил
   */
  async getActiveAMLRules(): Promise<AMLRule[]> {
    try {
      const rules = await prisma.aMLRule.findMany({
        where: { isActive: true },
        orderBy: { priority: "desc" },
      });

      return rules.map((rule) => this.mapDbToAMLRule(rule));
    } catch (error) {
      SecureLogger.error("Error fetching AML rules:", error);
      return [];
    }
  }

  /**
   * Оценка условия правила
   */
  private evaluateRuleCondition(
    condition: AMLRuleCondition,
    transaction: MonitoredTransaction
  ): boolean {
    try {
      let fieldValue: any;

      // Определяем значение поля для сравнения
      switch (condition.field) {
        case "amount":
          fieldValue = transaction.amount;
          break;
        case "type":
          fieldValue = transaction.type;
          break;
        case "currency":
          fieldValue = transaction.currency;
          break;
        case "fromAddress":
          fieldValue = transaction.fromAddress;
          break;
        case "toAddress":
          fieldValue = transaction.toAddress;
          break;
        case "riskScore":
          fieldValue = transaction.riskScore;
          break;
        case "timestamp":
          fieldValue = new Date(transaction.timestamp);
          break;
        default:
          // Для дополнительных данных
          fieldValue = transaction.additionalData?.[condition.field];
      }

      // Сравниваем значение с условием
      switch (condition.operator) {
        case "EQUALS":
          return fieldValue === condition.value;
        case "GREATER_THAN":
          return fieldValue > condition.value;
        case "LESS_THAN":
          return fieldValue < condition.value;
        case "BETWEEN":
          if (Array.isArray(condition.value) && condition.value.length === 2) {
            return (
              fieldValue >= condition.value[0] &&
              fieldValue <= condition.value[1]
            );
          }
          return false;
        case "CONTAINS":
          return fieldValue && fieldValue.toString().includes(condition.value);
        case "IN_LIST":
          if (Array.isArray(condition.value)) {
            return condition.value.includes(fieldValue);
          }
          return false;
        default:
          return false;
      }
    } catch (error) {
      SecureLogger.error("Error evaluating rule condition:", error);
      return false;
    }
  }

  /**
   * Выполнение действия правила
   */
  private async executeRuleAction(
    action: AMLRuleAction,
    transaction: MonitoredTransaction,
    rule: AMLRule
  ): Promise<void> {
    switch (action.type) {
      case "FLAG":
        transaction.monitoringStatus = "FLAGGED";
        if (!transaction.flaggedReasons) {
          transaction.flaggedReasons = [];
        }
        transaction.flaggedReasons.push(`Rule triggered: ${rule.name}`);
        break;
      case "BLOCK":
        transaction.monitoringStatus = "SUSPICIOUS";
        if (!transaction.flaggedReasons) {
          transaction.flaggedReasons = [];
        }
        transaction.flaggedReasons.push(
          `Transaction blocked by rule: ${rule.name}`
        );
        break;
      case "REQUIRE_MANUAL_REVIEW":
        transaction.monitoringStatus = "UNDER_REVIEW";
        if (!transaction.flaggedReasons) {
          transaction.flaggedReasons = [];
        }
        transaction.flaggedReasons.push(
          `Manual review required by rule: ${rule.name}`
        );
        break;
      case "SEND_NOTIFICATION":
        // В реальной системе отправляем уведомление
        SecureLogger.log(
          `Notification sent for rule: ${rule.name}, transaction: ${transaction.id}`
        );
        break;
      case "CREATE_REPORT":
        // Создаем отчет
        await this.createComplianceReportForRule(transaction, rule);
        break;
    }
  }

  /**
   * Создание отчета для сработавшего правила
   */
  private async createComplianceReportForRule(
    transaction: MonitoredTransaction,
    rule: AMLRule
  ): Promise<void> {
    const reportData = {
      transactionId: transaction.id,
      ruleTriggered: rule.name,
      ruleDescription: rule.description,
      transactionDetails: {
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
      },
    };

    const reportRequest = {
      type: "STR" as const,
      title: `Rule Triggered Report - ${rule.name}`,
      description: `Transaction ${transaction.id} triggered AML rule: ${rule.name}`,
      reportingPeriod: {
        startDate: transaction.timestamp,
        endDate: transaction.timestamp,
      },
      data: {
        ...reportData,
        submittedBy: "AMLSystem",
      },
    };

    await this.complianceService.createReport(reportRequest);
  }

  /**
   * Расчет риска на основе суммы транзакции
   */
  private calculateAmountRisk(amount: number, currency: string): number {
    // Пороговые значения в USD
    const thresholds = {
      low: 1000,
      medium: 10000,
      high: 50000,
      critical: 100000,
    };

    // Конвертация в USD (упрощенная)
    const amountInUSD = currency === "USD" ? amount : amount * 0.9; // Пример конвертации

    if (amountInUSD >= thresholds.critical) {
      return 90;
    } else if (amountInUSD >= thresholds.high) {
      return 70;
    } else if (amountInUSD >= thresholds.medium) {
      return 40;
    } else if (amountInUSD >= thresholds.low) {
      return 20;
    } else {
      return 5;
    }
  }

  /**
   * Расчет риска на основе типа транзакции
   */
  private calculateTransactionTypeRisk(type: TransactionType): number {
    const riskMap: Record<TransactionType, number> = {
      DEPOSIT: 10,
      WITHDRAWAL: 20,
      TRANSFER: 30,
      SWAP: 40,
      NFT_PURCHASE: 50,
      NFT_SALE: 50,
      ROYALTY_PAYMENT: 15,
      STAKING: 25,
      UNSTAKING: 25,
    };

    return riskMap[type] || 20; // по умолчанию средний риск
  }

  /**
   * Расчет риска частоты транзакций пользователя
   */
  private async calculateUserTransactionFrequencyRisk(
    userId: string,
    currentTimestamp: string
  ): Promise<number> {
    try {
      const now = new Date(currentTimestamp);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // за последний час

      const recentTransactions = await prisma.monitoredTransaction.count({
        where: {
          userId,
          timestamp: {
            gte: oneHourAgo,
            lte: now,
          },
        },
      });

      // Если больше 10 транзакций за час - высокий риск
      if (recentTransactions > 10) {
        return 80;
      } else if (recentTransactions > 5) {
        return 50;
      } else if (recentTransactions > 2) {
        return 30;
      } else {
        return 10;
      }
    } catch (error) {
      SecureLogger.error(
        "Error calculating user transaction frequency risk:",
        error
      );
      return 20; // по умолчанию средний риск
    }
  }

  /**
   * Расчет географического риска
   */
  private async calculateGeographicRisk(
    fromAddress: string,
    toAddress: string
  ): Promise<number> {
    // В реальной системе здесь будет проверка адресов на принадлежность к высокорисковым юрисдикциям
    // через внешние API или внутренние списки

    // Пока возвращаем низкий риск
    return 10;
  }

  /**
   * Получение уровня риска на основе оценки
   */
  private getRiskLevelFromScore(score: number): AMLRiskLevel {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }

  /**
   * Расчет статуса мониторинга
   */
  private calculateMonitoringStatus(
    riskLevel: AMLRiskLevel,
    flaggedReasonsCount: number
  ): MonitoringStatus {
    if (flaggedReasonsCount > 0) {
      if (riskLevel === "CRITICAL") {
        return "REPORTED";
      } else if (riskLevel === "HIGH") {
        return "SUSPICIOUS";
      } else {
        return "FLAGGED";
      }
    }

    return "CLEARED";
  }

  /**
   * Определение уровня важности события
   */
  private getEventSeverity(
    riskLevel: AMLRiskLevel
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    return riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }

  /**
   * Создание SAR для подозрительной транзакции
   */
  private async createSARForTransaction(
    transaction: MonitoredTransaction
  ): Promise<void> {
    const sarData = {
      userId: transaction.userId,
      walletAddress: transaction.walletAddress,
      suspiciousTransactions: [transaction.id],
      reasons: transaction.flaggedReasons || [
        `High risk score: ${transaction.riskScore}`,
      ],
      riskLevel: transaction.riskLevel,
      reportedBy: "AMLSystem",
    };

    await this.complianceService.createSuspiciousActivityReport(sarData);
  }

  /**
   * Загрузка санкционных списков
   */
  private async loadSanctionsLists(): Promise<void> {
    try {
      // Загружаем санкционные списки из базы данных
      const dbSanctionsLists = await prisma.sanctionsList.findMany();

      for (const dbList of dbSanctionsLists) {
        const sanctionsList: SanctionsList = {
          id: dbList.id,
          name: dbList.name,
          source: dbList.source,
          version: dbList.version,
          lastUpdated: dbList.lastUpdated.toISOString(),
          entries: dbList.entries as SanctionsEntry[],
        };

        this.sanctionsLists.set(sanctionsList.id, sanctionsList);
      }
    } catch (error) {
      SecureLogger.error("Error loading sanctions lists:", error);
    }
  }

  /**
   * Обновление санкционных списков
   */
  async updateSanctionsLists(lists: SanctionsList[]): Promise<void> {
    try {
      for (const list of lists) {
        // Обновляем список в базе данных
        await prisma.sanctionsList.upsert({
          where: { id: list.id },
          update: {
            name: list.name,
            source: list.source,
            version: list.version,
            lastUpdated: new Date(list.lastUpdated),
            entries: list.entries as any,
          },
          create: {
            id: list.id,
            name: list.name,
            source: list.source,
            version: list.version,
            lastUpdated: new Date(list.lastUpdated),
            entries: list.entries as any,
          },
        });

        // Обновляем внутренний кэш
        this.sanctionsLists.set(list.id, list);
      }
    } catch (error) {
      SecureLogger.error("Error updating sanctions lists:", error);
      throw error;
    }
  }

  /**
   * Получение транзакций для мониторинга
   */
  async getTransactionsForMonitoring(
    params: TransactionMonitoringParams = {}
  ): Promise<MonitoredTransaction[]> {
    try {
      const whereClause: any = {};

      if (params.userId) {
        whereClause.userId = params.userId;
      }

      if (params.walletAddress) {
        whereClause.walletAddress = params.walletAddress;
      }

      if (params.transactionType) {
        whereClause.type = params.transactionType;
      }

      if (params.riskLevel) {
        whereClause.riskLevel = params.riskLevel;
      }

      if (params.status) {
        whereClause.monitoringStatus = params.status;
      }

      if (params.startDate || params.endDate) {
        whereClause.timestamp = {};
        if (params.startDate) {
          whereClause.timestamp.gte = new Date(params.startDate);
        }
        if (params.endDate) {
          whereClause.timestamp.lte = new Date(params.endDate);
        }
      }

      if (params.minAmount !== undefined || params.maxAmount !== undefined) {
        whereClause.amount = {};
        if (params.minAmount !== undefined) {
          whereClause.amount.gte = params.minAmount;
        }
        if (params.maxAmount !== undefined) {
          whereClause.amount.lte = params.maxAmount;
        }
      }

      const transactions = await prisma.monitoredTransaction.findMany({
        where: whereClause,
        take: params.limit || 50,
        skip: params.offset || 0,
        orderBy: { timestamp: "desc" },
      });

      return transactions.map((tx) => this.mapDbToMonitoredTransaction(tx));
    } catch (error) {
      SecureLogger.error("Error fetching transactions for monitoring:", error);
      return [];
    }
  }

  /**
   * Получение статистики мониторинга
   */
  async getMonitoringStats(): Promise<{
    totalTransactions: number;
    flaggedTransactions: number;
    suspiciousTransactions: number;
    highRiskTransactions: number;
    averageRiskScore: number;
  }> {
    try {
      const totalTransactions = await prisma.monitoredTransaction.count();

      const flaggedTransactions = await prisma.monitoredTransaction.count({
        where: {
          monitoringStatus: {
            in: ["FLAGGED", "UNDER_REVIEW", "SUSPICIOUS", "REPORTED"],
          },
        },
      });

      const suspiciousTransactions = await prisma.monitoredTransaction.count({
        where: { monitoringStatus: { in: ["SUSPICIOUS", "REPORTED"] } },
      });

      const highRiskTransactions = await prisma.monitoredTransaction.count({
        where: { riskLevel: { in: ["HIGH", "CRITICAL"] } },
      });

      const avgRiskScoreResult = await prisma.monitoredTransaction.aggregate({
        _avg: { riskScore: true },
      });

      const averageRiskScore = avgRiskScoreResult._avg.riskScore || 0;

      return {
        totalTransactions,
        flaggedTransactions,
        suspiciousTransactions,
        highRiskTransactions,
        averageRiskScore: Number(averageRiskScore),
      };
    } catch (error) {
      SecureLogger.error("Error fetching monitoring stats:", error);
      return {
        totalTransactions: 0,
        flaggedTransactions: 0,
        suspiciousTransactions: 0,
        highRiskTransactions: 0,
        averageRiskScore: 0,
      };
    }
  }

  /**
   * Ручной запуск оценки риска для пользователя
   */
  async runUserRiskAssessment(
    userId: string,
    assessedBy: string
  ): Promise<UserRiskAssessment | null> {
    try {
      // Получаем все транзакции пользователя
      const userTransactions = await prisma.monitoredTransaction.findMany({
        where: { userId },
      });

      // Рассчитываем факторы риска
      const riskFactors = await this.calculateUserRiskFactors(
        userId,
        userTransactions
      );

      // Рассчитываем общий риск
      let totalWeight = 0;
      let weightedScore = 0;

      for (const factor of riskFactors) {
        totalWeight += factor.weight;
        weightedScore += factor.score * factor.weight;
      }

      const overallRiskScore = Math.round(weightedScore / totalWeight);
      const riskLevel = this.getRiskLevelFromScore(overallRiskScore);

      // Создаем оценку риска
      const assessment: UserRiskAssessment = {
        id: generateId("assessment"),
        userId,
        walletAddress: userTransactions[0]?.walletAddress || "", // Берем первый известный адрес
        overallRiskScore,
        riskLevel,
        factors: riskFactors as any,
        lastAssessed: new Date().toISOString(),
        nextReviewDate: new Date(
          Date.now() + 90 * 24 * 60 * 1000
        ).toISOString(), // 90 дней
        assessedBy,
      };

      // Сохраняем оценку
      await this.complianceService.createUserRiskAssessment({
        userId: assessment.userId,
        walletAddress: assessment.walletAddress,
        factors: assessment.factors,
        assessedBy: assessment.assessedBy,
      });

      return assessment;
    } catch (error) {
      SecureLogger.error("Error running user risk assessment:", error);
      return null;
    }
  }

  /**
   * Расчет факторов риска пользователя
   */
  private async calculateUserRiskFactors(
    userId: string,
    transactions: any[]
  ): Promise<
    Array<{
      category: string;
      name: string;
      description: string;
      score: number;
      weight: number;
    }>
  > {
    const factors: Array<{
      category: string;
      name: string;
      description: string;
      score: number;
      weight: number;
    }> = [];

    // Рассчитываем среднюю оценку риска транзакций
    const avgTransactionRisk =
      transactions.length > 0
        ? transactions.reduce((sum, tx) => sum + tx.riskScore, 0) /
          transactions.length
        : 0;

    factors.push({
      category: "TRANSACTIONAL",
      name: "Average Transaction Risk",
      description: "Average risk score of user transactions",
      score: Math.round(avgTransactionRisk),
      weight: 30,
    });

    // Рассчитываем частоту транзакций
    const totalTransactions = transactions.length;
    const highRiskTransactions = transactions.filter(
      (tx: any) => tx.riskLevel === "HIGH" || tx.riskLevel === "CRITICAL"
    ).length;
    const highRiskPercentage =
      totalTransactions > 0
        ? (highRiskTransactions / totalTransactions) * 100
        : 0;

    factors.push({
      category: "BEHAVIORAL",
      name: "High Risk Transaction Percentage",
      description: "Percentage of high risk transactions",
      score: Math.min(100, Math.round(highRiskPercentage * 2)), // Удваиваем для усиления влияния
      weight: 25,
    });

    // Рассчитываем объем транзакций
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    let volumeRisk = 0;
    if (totalVolume > 100000) volumeRisk = 80;
    else if (totalVolume > 50000) volumeRisk = 60;
    else if (totalVolume > 10000) volumeRisk = 40;
    else if (totalVolume > 1000) volumeRisk = 20;

    factors.push({
      category: "TRANSACTIONAL",
      name: "Transaction Volume Risk",
      description: "Risk based on total transaction volume",
      score: volumeRisk,
      weight: 25,
    });

    // Проверяем наличие в санкционных списках
    const sanctionsMatch = await this.checkUserAgainstSanctions(userId);
    factors.push({
      category: "SANCTIONS",
      name: "Sanctions List Match",
      description: "User presence in sanctions lists",
      score: sanctionsMatch ? 100 : 0,
      weight: 20,
    });

    return factors;
  }

  /**
   * Проверка пользователя на наличие в санкционных списках
   */
  private async checkUserAgainstSanctions(userId: string): Promise<boolean> {
    // В реальной системе здесь будет проверка пользователя по санкционным спискам
    // через его персональные данные, адреса и т.д.

    // Пока возвращаем false
    return false;
  }

  // Приватные методы

  /**
   * Сохранение мониторинговой транзакции в базу данных
   */
  private async saveMonitoredTransaction(
    transaction: MonitoredTransaction
  ): Promise<void> {
    await prisma.monitoredTransaction.upsert({
      where: { id: transaction.id },
      update: {
        transactionHash: transaction.transactionHash,
        userId: transaction.userId,
        walletAddress: transaction.walletAddress,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        timestamp: new Date(transaction.timestamp),
        blockNumber: transaction.blockNumber || null,
        riskScore: transaction.riskScore,
        riskLevel: transaction.riskLevel,
        monitoringStatus: transaction.monitoringStatus,
        flaggedReasons: transaction.flaggedReasons || [],
        reviewedAt: transaction.reviewedAt
          ? new Date(transaction.reviewedAt)
          : null,
        reviewedBy: transaction.reviewedBy || null,
        additionalData: transaction.additionalData || {},
      },
      create: {
        id: transaction.id,
        transactionHash: transaction.transactionHash,
        userId: transaction.userId,
        walletAddress: transaction.walletAddress,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        fromAddress: transaction.fromAddress,
        toAddress: transaction.toAddress,
        timestamp: new Date(transaction.timestamp),
        blockNumber: transaction.blockNumber || null,
        riskScore: transaction.riskScore,
        riskLevel: transaction.riskLevel,
        monitoringStatus: transaction.monitoringStatus,
        flaggedReasons: transaction.flaggedReasons || [],
        reviewedAt: transaction.reviewedAt
          ? new Date(transaction.reviewedAt)
          : null,
        reviewedBy: transaction.reviewedBy || null,
        additionalData: transaction.additionalData || {},
      },
    });
  }

  /**
   * Преобразование данных из базы в MonitoredTransaction
   */
  private mapDbToMonitoredTransaction(
    dbTransaction: any
  ): MonitoredTransaction {
    return {
      id: dbTransaction.id,
      transactionHash: dbTransaction.transactionHash,
      userId: dbTransaction.userId,
      walletAddress: dbTransaction.walletAddress,
      type: dbTransaction.type as TransactionType,
      amount: dbTransaction.amount,
      currency: dbTransaction.currency,
      fromAddress: dbTransaction.fromAddress,
      toAddress: dbTransaction.toAddress,
      timestamp: dbTransaction.timestamp.toISOString(),
      blockNumber: dbTransaction.blockNumber || undefined,
      riskScore: dbTransaction.riskScore,
      riskLevel: dbTransaction.riskLevel as AMLRiskLevel,
      monitoringStatus: dbTransaction.monitoringStatus as MonitoringStatus,
      flaggedReasons: dbTransaction.flaggedReasons || undefined,
      reviewedAt: dbTransaction.reviewedAt
        ? dbTransaction.reviewedAt.toISOString()
        : undefined,
      reviewedBy: dbTransaction.reviewedBy || undefined,
      additionalData: dbTransaction.additionalData || undefined,
    };
  }

  /**
   * Преобразование данных из базы в AMLRule
   */
  private mapDbToAMLRule(dbRule: any): AMLRule {
    return {
      id: dbRule.id,
      name: dbRule.name,
      description: dbRule.description,
      category: dbRule.category,
      isActive: dbRule.isActive,
      priority: dbRule.priority,
      conditions: dbRule.conditions,
      actions: dbRule.actions,
      createdAt: dbRule.createdAt.toISOString(),
      updatedAt: dbRule.updatedAt.toISOString(),
    };
  }

  /**
   * Создание события AML/KYC
   */
  private async createEvent(event: AMLKYCEvent): Promise<void> {
    await this.complianceService.createComplianceEvent({
      type: event.type,
      userId: event.userId,
      walletAddress: event.walletAddress,
      data: event.data,
      severity: event.severity,
    });
  }
}

// Экспорт сервиса
// Удаляем дублирующий экспорт
