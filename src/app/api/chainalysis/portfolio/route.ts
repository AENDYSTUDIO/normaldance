import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔗 Chainalysis Portfolio Analysis API
 *
 * API эндпоинт для анализа портфеля адресов через Chainalysis
 */

import { NextRequest, NextResponse } from "next/server";
import { ChainalysisService } from "@/lib/aml-kyc/chainalysis-service";
import { ChainalysisPortfolioAnalysisRequest } from "@/lib/aml-kyc/chainalysis-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const { addresses, asset, includeTransactions, transactionLimit, includeExposure, includeIdentifications } = body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ADDRESSES", message: "Addresses array is required" } },
        { status: 400 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ASSET", message: "Asset is required" } },
        { status: 400 }
      );
    }

    if (addresses.length > 100) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_ADDRESSES", message: "Maximum 100 addresses allowed per request" } },
        { status: 400 }
      );
    }

    // Создаем запрос на анализ
    const analysisRequest: ChainalysisPortfolioAnalysisRequest = {
      addresses,
      asset,
      includeTransactions: includeTransactions || false,
      transactionLimit: transactionLimit || 50,
      includeExposure: includeExposure !== false,
      includeIdentifications: includeIdentifications !== false,
    };

    // Выполняем анализ через Chainalysis
    const chainalysisService = new ChainalysisService();
    const result = await chainalysisService.analyzePortfolio(analysisRequest);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    SecureLogger.error("Error in Chainalysis portfolio analysis API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during portfolio analysis",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressesParam = searchParams.get("addresses");
    const asset = searchParams.get("asset") as any;

    if (!addressesParam) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ADDRESSES", message: "Addresses parameter is required" } },
        { status: 400 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ASSET", message: "Asset parameter is required" } },
        { status: 400 }
      );
    }

    // Парсим адреса из параметра
    const addresses = addressesParam.split(",").map(addr => addr.trim()).filter(addr => addr.length > 0);

    if (addresses.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ADDRESSES", message: "No valid addresses provided" } },
        { status: 400 }
      );
    }

    if (addresses.length > 100) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_ADDRESSES", message: "Maximum 100 addresses allowed per request" } },
        { status: 400 }
      );
    }

    // Создаем запрос на анализ
    const analysisRequest: ChainalysisPortfolioAnalysisRequest = {
      addresses,
      asset,
      includeTransactions: false, // Для GET запроса не включаем транзакции по умолчанию
      includeExposure: true,
      includeIdentifications: true,
    };

    // Выполняем анализ через Chainalysis
    const chainalysisService = new ChainalysisService();
    const result = await chainalysisService.analyzePortfolio(analysisRequest);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    SecureLogger.error("Error in Chainalysis portfolio GET API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during portfolio analysis",
        },
      },
      { status: 500 }
    );
  }
}