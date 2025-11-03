import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔗 Chainalysis AML Integration - Blockchain Analytics Integration
 *
 * Сервис для интеграции Chainalysis с существующей AML системой
 * для комплексного анализа рисков и комплаенса
 */

import { AMLService } from "./aml-service";
import { ChainalysisService } from "./chainalysis-service";
import { ComplianceService } from "./compliance-service";

import {
  ChainalysisAddressAnalysisRequest,
  ChainalysisTransactionAnalysisRequest,
  ChainalysisAsset,
  ChainalysisAMLIntegration,
  ChainalysisRiskFactor,
} from "./chainalysis-types";

import {
  MonitoredTransaction,
  AMLRiskLevel,
  TransactionType,
  UserRiskAssessment,
} from "./types";

import { db } from "../../lib/db";

export class ChainalysisAMLIntegration {
  private amlService: AMLService;
  private chainalysisService: ChainalysisService;
  private complianceService: ComplianceService;

  constructor() {
    this.amlService = new AMLService();
    this.chainalysisService = new ChainalysisService();
    this.complianceService = new ComplianceService();
  }

  /**
   * Комплексный анализ транзакции с использованием Chainalysis
   */
  async analyzeTransactionWithChainalysis(
    transaction: Omit<
      MonitoredTransaction,
      "id" | "riskScore" | "riskLevel" | "monitoringStatus"
    >
  ): Promise<MonitoredTransaction> {
    try {
      // Сначала выполняем стандартный AML анализ
      const amlTransaction = await this.amlService.monitorTransaction(transaction);

      // Затем выполняем анализ через Chainalysis
      const chainalysisIntegration = await this.chainalysisService.integrateWithAML(
        transaction.fromAddress,
        transaction.transactionHash,
        this.mapCurrencyToAsset(transaction.currency)
      );

      // Объединяем результаты анализа
      const combinedTransaction = this.combineAnalysisResults(
        amlTransaction,
        chainalysisIntegration
      );

      // Сохраняем результаты Chainalysis анализа
      await this.saveChainalysisResults(
        transaction.transactionHash,
        chainalysisIntegration
      );

      // Если Chainalysis обнаружил высокий риск, обновляем статус
      if (chainalysisIntegration.shouldBlock) {
        combinedTransaction.monitoringStatus = "SUSPICIOUS";
        combinedTransaction.flaggedReasons = [
          ...(combinedTransaction.flaggedReasons || []),
          "Chainalysis: High risk - transaction blocked",
        ];
      } else if (chainalysisIntegration.requiresManualReview) {
        combinedTransaction.monitoringStatus = "UNDER_REVIEW";
        combinedTransaction.flaggedReasons = [
          ...(combinedTransaction.flaggedReasons || []),
          "Chainalysis: Manual review required",
        ];
      }

      // Создаем событие комплаенса если необходимо
      if (chainalysisIntegration.shouldReport) {
        await this.complianceService.createSuspiciousActivityReport({
          userId: transaction.userId,
          walletAddress: transaction.walletAddress,
          suspiciousTransactions: [combinedTransaction.id],
          reasons: [
            ...(combinedTransaction.flaggedReasons || []),
            ...chainalysisIntegration.recommendations,
          ],
          riskLevel: combinedTransaction.riskLevel,
          reportedBy: "ChainalysisAMLIntegration",
        });
      }

      return combinedTransaction;
    } catch (error) {
      SecureLogger.error("Error in transaction analysis with Chainalysis:", error);
      // В случае ошибки возвращаем только AML анализ
      return this.amlService.monitorTransaction(transaction);
    }
  }

  /**
   * Комплексная оценка риска пользователя с использованием Chainalysis
   */
  async assessUserRiskWithChainalysis(
    userId: string,
    assessedBy: string
  ): Promise<UserRiskAssessment | null> {
    try {
      // Сначала выполняем стандартную оценку риска
      const amlAssessment = await this.amlService.runUserRiskAssessment(
        userId,
        assessedBy
      );

      if (!amlAssessment) {
        return null;
      }

      // Получаем все адреса пользователя для анализа Chainalysis
      const userTransactions = await db.monitoredTransaction.findMany({
        where: { userId },
        distinct: ["fromAddress", "toAddress"],
      });

      const uniqueAddresses = Array.from(
        new Set(
          userTransactions.flatMap((tx) => [tx.fromAddress, tx.toAddress])
        )
      );

      // Анализируем каждый адрес через Chainalysis
      const chainalysisResults = [];
      for (const address of uniqueAddresses) {
        const integration = await this.chainalysisService.integrateWithAML(
          address,
          undefined,
          "SOL"
        );
        chainalysisResults.push({ address, ...integration });
      }

      // Объединяем результаты оценки риска
      const combinedAssessment = this.combineRiskAssessments(
        amlAssessment,
        chainalysisResults
      );

      // Сохраняем результаты Chainalysis анализа
      await this.saveUserChainalysisResults(userId, chainalysisResults);

      // Обновляем оценку риска в базе данных
      await this.complianceService.createUserRiskAssessment({
        userId: combinedAssessment.userId,
        walletAddress: combinedAssessment.walletAddress,
        factors: combinedAssessment.factors,
        assessedBy,
      });

      return combinedAssessment;
    } catch (error) {
      SecureLogger.error("Error in user risk assessment with Chainalysis:", error);
      // В случае ошибки возвращаем только AML оценку
      return this.amlService.runUserRiskAssessment(userId, assessedBy);
    }
  }

  /**
   * Мониторинг адреса в реальном времени
   */
  async monitorAddress(
    address: string,
    asset: ChainalysisAsset = "SOL"
  ): Promise<{
    success: boolean;
    riskLevel: AMLRiskLevel;
    recommendations: string[];
    requiresAction: boolean;
  }> {
    try {
      // Анализируем адрес через Chainalysis
      const integration = await this.chainalysisService.integrateWithAML(
        address,
        undefined,
        asset
      );

      // Проверяем, есть ли уже мониторинг для этого адреса
      const existingMonitoring = await db.chainalysisMonitoringEvent.findFirst({
        where: {
          address,
          processed: false,
        },
      });

      if (existingMonitoring) {
        return {
          success: true,
          riskLevel: integration.riskLevel,
          recommendations: integration.recommendations,
          requiresAction: integration.requiresManualReview || integration.shouldBlock,
        };
      }

      // Создаем событие мониторинга если высокий риск
      if (integration.requiresManualReview || integration.shouldBlock) {
        await this.chainalysisService.createMonitoringRule({
          name: `Address Monitoring: ${address}`,
          description: `Мониторинг адреса ${address} с высоким риском`,
          isActive: true,
          conditions: [
            {
              field: "risk",
              operator: "GREATER_THAN",
              value: 60,
              weight: 100,
            },
          ],
          actions: [
            {
              type: "ALERT",
              parameters: { priority: "HIGH" },
            },
            ...(integration.shouldBlock
              ? [{ type: "BLOCK" as const }]
              : [{ type: "FLAG" as const }]),
          ],
        });
      }

      return {
        success: true,
        riskLevel: integration.riskLevel,
        recommendations: integration.recommendations,
        requiresAction: integration.requiresManualReview || integration.shouldBlock,
      };
    } catch (error) {
      SecureLogger.error("Error monitoring address:", error);
      return {
        success: false,
        riskLevel: "MEDIUM",
        recommendations: ["Ошибка при мониторинге адреса"],
        requiresAction: true,
      };
    }
  }

  /**
   * Получение отчета о рисках портфеля
   */
  async getPortfolioRiskReport(
    addresses: string[],
    asset: ChainalysisAsset = "SOL"
  ): Promise<{
    success: boolean;
    reportId?: string;
    overallRisk: AMLRiskLevel;
    riskScore: number;
    highRiskAddresses: string[];
    recommendations: string[];
  }> {
    try {
      // Анализируем портфель через Chainalysis
      const portfolioResponse = await this.chainalysisService.analyzePortfolio({
        addresses,
        asset,
        includeTransactions: true,
        includeExposure: true,
        includeIdentifications: true,
      });

      if (!portfolioResponse.success || !portfolioResponse.data) {
        return {
          success: false,
          overallRisk: "MEDIUM",
          riskScore: 50,
          highRiskAddresses: [],
          recommendations: ["Ошибка при анализе портфеля"],
        };
      }

      // Анализируем риски по адресам
      const addressRisks = [];
      const highRiskAddresses = [];

      for (const addressAnalysis of portfolioResponse.data.addresses) {
        const integration = await this.chainalysisService.integrateWithAML(
          addressAnalysis.address,
          undefined,
          asset
        );

        addressRisks.push({
          address: addressAnalysis.address,
          risk: integration.riskScore,
          level: integration.riskLevel,
        });

        if (integration.riskScore >= 70) {
          highRiskAddresses.push(addressAnalysis.address);
        }
      }

      // Рассчитываем общий риск портфеля
      const overallRiskScore =
        addressRisks.reduce((sum, addr) => sum + addr.risk, 0) /
        addressRisks.length;

      const overallRiskLevel = this.getRiskLevelFromScore(overallRiskScore);

      // Создаем отчет
      const reportResponse = await this.chainalysisService.createReport(
        "PORTFOLIO_RISK",
        `Portfolio Risk Report - ${addresses.length} addresses`,
        `Комплексный анализ рисков портфеля из ${addresses.length} адресов`,
        {
          addresses: portfolioResponse.data.addresses,
          addressRisks,
          overallRiskScore,
          overallRiskLevel,
          highRiskAddresses,
        }
      );

      return {
        success: true,
        reportId: reportResponse.reportId,
        overallRisk: overallRiskLevel,
        riskScore: Math.round(overallRiskScore),
        highRiskAddresses,
        recommendations: this.generatePortfolioRecommendations(
          overallRiskLevel,
          highRiskAddresses.length
        ),
      };
    } catch (error) {
      SecureLogger.error("Error generating portfolio risk report:", error);
      return {
        success: false,
        overallRisk: "MEDIUM",
        riskScore: 50,
        highRiskAddresses: [],
        recommendations: ["Ошибка при генерации отчета"],
      };
    }
  }

  // Приватные методы

  /**
   * Объединение результатов AML и Chainalysis анализа
   */
  private combineAnalysisResults(
    amlTransaction: MonitoredTransaction,
    chainalysisIntegration: ChainalysisAMLIntegration
  ): MonitoredTransaction {
    // Взвешиваем риски из обоих источников
    const amlWeight = 0.6; // 60% веса для AML
    const chainalysisWeight = 0.4; // 40% веса для Chainalysis

    const combinedRiskScore = Math.round(
      amlTransaction.riskScore * amlWeight +
        chainalysisIntegration.riskScore * chainalysisWeight
    );

    const combinedRiskLevel = this.getRiskLevelFromScore(combinedRiskScore);

    // Объединяем факторы риска
    const combinedFactors = [
      ...this.convertAMLFactorsToChainalysis(amlTransaction),
      ...chainalysisIntegration.factors,
    ];

    return {
      ...amlTransaction,
      riskScore: combinedRiskScore,
      riskLevel: combinedRiskLevel,
      flaggedReasons: [
        ...(amlTransaction.flaggedReasons || []),
        ...chainalysisIntegration.recommendations,
      ],
      additionalData: {
        ...amlTransaction.additionalData,
        chainalysisIntegration: {
          riskScore: chainalysisIntegration.riskScore,
          riskLevel: chainalysisIntegration.riskLevel,
          factors: chainalysisIntegration.factors,
          recommendations: chainalysisIntegration.recommendations,
        },
      },
    };
  }

  /**
   * Объединение оценок риска пользователя
   */
  private combineRiskAssessments(
    amlAssessment: UserRiskAssessment,
    chainalysisResults: Array<{
      address: string;
      riskScore: number;
      riskLevel: AMLRiskLevel;
      factors: ChainalysisRiskFactor[];
      recommendations: string[];
    }>
  ): UserRiskAssessment {
    // Рассчитываем средний риск от Chainalysis
    const avgChainalysisRisk =
      chainalysisResults.reduce((sum, result) => sum + result.riskScore, 0) /
      chainalysisResults.length;

    // Взвешиваем риски
    const amlWeight = 0.7; // 70% веса для AML
    const chainalysisWeight = 0.3; // 30% веса для Chainalysis

    const combinedRiskScore = Math.round(
      amlAssessment.overallRiskScore * amlWeight +
        avgChainalysisRisk * chainalysisWeight
    );

    const combinedRiskLevel = this.getRiskLevelFromScore(combinedRiskScore);

    // Объединяем факторы риска
    const combinedFactors = [
      ...amlAssessment.factors,
      ...chainalysisResults.flatMap((result) => result.factors),
    ];

    return {
      ...amlAssessment,
      overallRiskScore: combinedRiskScore,
      riskLevel: combinedRiskLevel,
      factors: combinedFactors,
      additionalData: {
        ...amlAssessment.additionalData,
        chainalysisResults: chainalysisResults.map((result) => ({
          address: result.address,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
        })),
      },
    };
  }

  /**
   * Преобразование AML факторов в формат Chainalysis
   */
  private convertAMLFactorsToChainalysis(
    transaction: MonitoredTransaction
  ): ChainalysisRiskFactor[] {
    const factors: ChainalysisRiskFactor[] = [];

    // Фактор на основе суммы транзакции
    if (transaction.amount > 0) {
      let amountRisk = 0;
      if (transaction.amount > 100000) amountRisk = 80;
      else if (transaction.amount > 10000) amountRisk = 60;
      else if (transaction.amount > 1000) amountRisk = 40;
      else amountRisk = 20;

      factors.push({
        category: "VOLUME",
        name: "Transaction Amount",
        description: `Риск на основе суммы транзакции: ${transaction.amount}`,
        score: amountRisk,
        weight: 25,
        details: { amount: transaction.amount, currency: transaction.currency },
      });
    }

    // Фактор на основе типа транзакции
    const typeRiskMap: Record<TransactionType, number> = {
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

    factors.push({
      category: "BEHAVIOR",
      name: "Transaction Type",
      description: `Риск на основе типа транзакции: ${transaction.type}`,
      score: typeRiskMap[transaction.type] || 20,
      weight: 20,
      details: { type: transaction.type },
    });

    return factors;
  }

  /**
   * Сохранение результатов Chainalysis анализа
   */
  private async saveChainalysisResults(
    transactionHash: string,
    integration: ChainalysisAMLIntegration
  ): Promise<void> {
    try {
      await db.chainalysisResult.create({
        data: {
          transactionHash,
          riskScore: integration.riskScore,
          riskLevel: integration.riskLevel,
          factors: integration.factors as any,
          recommendations: integration.recommendations,
          requiresManualReview: integration.requiresManualReview,
          shouldBlock: integration.shouldBlock,
          shouldReport: integration.shouldReport,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      SecureLogger.error("Error saving Chainalysis results:", error);
    }
  }

  /**
   * Сохранение результатов Chainalysis анализа для пользователя
   */
  private async saveUserChainalysisResults(
    userId: string,
    results: Array<{
      address: string;
      riskScore: number;
      riskLevel: AMLRiskLevel;
      factors: ChainalysisRiskFactor[];
      recommendations: string[];
    }>
  ): Promise<void> {
    try {
      for (const result of results) {
        await db.userChainalysisResult.create({
          data: {
            userId,
            address: result.address,
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            factors: result.factors as any,
            recommendations: result.recommendations,
            createdAt: new Date(),
          },
        });
      }
    } catch (error) {
      SecureLogger.error("Error saving user Chainalysis results:", error);
    }
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
   * Преобразование валюты в актив Chainalysis
   */
  private mapCurrencyToAsset(currency: string): ChainalysisAsset {
    const currencyMap: Record<string, ChainalysisAsset> = {
      SOL: "SOL",
      BTC: "BTC",
      ETH: "ETH",
      USDC: "USDC",
      USDT: "USDT",
      DAI: "DAI",
    };

    return currencyMap[currency] || "OTHER";
  }

  /**
   * Генерация рекомендаций для портфеля
   */
  private generatePortfolioRecommendations(
    overallRisk: AMLRiskLevel,
    highRiskCount: number
  ): string[] {
    const recommendations: string[] = [];

    switch (overallRisk) {
      case "CRITICAL":
        recommendations.push("НЕМЕДЛЕННЫЕ ДЕЙСТВИЯ: Критический уровень риска портфеля");
        recommendations.push("БЛОКИРОВКА: Рассмотрите блокировку высокорисковых адресов");
        recommendations.push("ОТЧЕТНОСТЬ: Создайте SAR отчет для регулятора");
        break;
      case "HIGH":
        recommendations.push("СРОЧНАЯ ПРОВЕРКА: Высокий уровень риска портфеля");
        recommendations.push("МОНИТОРИНГ: Усиленный мониторинг всех транзакций");
        recommendations.push("РЕВИЗИЯ: Пересмотрите распределение активов");
        break;
      case "MEDIUM":
        recommendations.push("ВНИМАНИЕ: Средний уровень риска портфеля");
        recommendations.push("АНАЛИЗ: Проанализируйте источники средств");
        break;
      case "LOW":
        recommendations.push("НОРМА: Риск портфеля в пределах допустимых значений");
        break;
    }

    if (highRiskCount > 0) {
      recommendations.push(
        `ВЫСОКИЙ РИСК: Обнаружено ${highRiskCount} высокорисковых адресов`
      );
    }

    return recommendations;
  }
}

// Экспорт сервиса
export { ChainalysisAMLIntegration };