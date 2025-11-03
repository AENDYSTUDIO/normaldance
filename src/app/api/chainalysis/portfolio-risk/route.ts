import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔗 Chainalysis Portfolio Risk API
 *
 * API эндпоинт для анализа рисков портфеля через Chainalysis
 */

import { NextRequest, NextResponse } from "next/server";
import { ChainalysisAMLIntegration } from "@/lib/aml-kyc/chainalysis-aml-integration";
import { ChainalysisAsset } from "@/lib/aml-kyc/chainalysis-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const { addresses, asset } = body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ADDRESSES", message: "Addresses array is required" } },
        { status: 400 }
      );
    }

    if (addresses.length > 100) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_ADDRESSES", message: "Maximum 100 addresses allowed per request" } },
        { status: 400 }
      );
    }

    // Создаем интеграцию для анализа портфеля
    const chainalysisIntegration = new ChainalysisAMLIntegration();
    const result = await chainalysisIntegration.getPortfolioRiskReport(
      addresses,
      asset || "SOL"
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    SecureLogger.error("Error in Chainalysis portfolio risk API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during portfolio risk analysis",
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
    const asset = searchParams.get("asset") as ChainalysisAsset;

    if (!addressesParam) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ADDRESSES", message: "Addresses parameter is required" } },
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

    // Создаем интеграцию для анализа портфеля
    const chainalysisIntegration = new ChainalysisAMLIntegration();
    const result = await chainalysisIntegration.getPortfolioRiskReport(
      addresses,
      asset || "SOL"
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    SecureLogger.error("Error in Chainalysis portfolio risk GET API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during portfolio risk analysis",
        },
      },
      { status: 500 }
    );
  }
}