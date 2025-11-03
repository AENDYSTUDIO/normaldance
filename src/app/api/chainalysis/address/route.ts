import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔗 Chainalysis Address Analysis API
 *
 * API эндпоинт для анализа адресов через Chainalysis
 */

import { NextRequest, NextResponse } from "next/server";
import { ChainalysisService } from "@/lib/aml-kyc/chainalysis-service";
import { ChainalysisAddressAnalysisRequest } from "@/lib/aml-kyc/chainalysis-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const { address, asset, includeTransactions, transactionLimit, includeExposure, includeIdentifications } = body;
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ADDRESS", message: "Address is required" } },
        { status: 400 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ASSET", message: "Asset is required" } },
        { status: 400 }
      );
    }

    // Создаем запрос на анализ
    const analysisRequest: ChainalysisAddressAnalysisRequest = {
      address,
      asset,
      includeTransactions: includeTransactions || false,
      transactionLimit: transactionLimit || 100,
      includeExposure: includeExposure !== false,
      includeIdentifications: includeIdentifications !== false,
    };

    // Выполняем анализ через Chainalysis
    const chainalysisService = new ChainalysisService();
    const result = await chainalysisService.analyzeAddress(analysisRequest);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    SecureLogger.error("Error in Chainalysis address analysis API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during address analysis",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const asset = searchParams.get("asset") as any;

    if (!address) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ADDRESS", message: "Address is required" } },
        { status: 400 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ASSET", message: "Asset is required" } },
        { status: 400 }
      );
    }

    // Получаем оценку риска адреса
    const chainalysisService = new ChainalysisService();
    const riskResult = await chainalysisService.getAddressRisk(address, asset);

    return NextResponse.json(
      { success: true, data: riskResult },
      { status: 200 }
    );
  } catch (error) {
    SecureLogger.error("Error in Chainalysis address risk API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during risk assessment",
        },
      },
      { status: 500 }
    );
  }
}