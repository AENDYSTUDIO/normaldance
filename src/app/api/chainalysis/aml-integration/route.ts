import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔗 Chainalysis AML Integration API
 *
 * API эндпоинт для интеграции Chainalysis с AML системой
 */

import { NextRequest, NextResponse } from "next/server";
import { ChainalysisAMLIntegration } from "@/lib/aml-kyc/chainalysis-aml-integration";
import { ChainalysisAsset } from "@/lib/aml-kyc/chainalysis-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const { address, transactionHash, asset } = body;
    
    if (!address && !transactionHash) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_INPUT", message: "Either address or transactionHash is required" } },
        { status: 400 }
      );
    }

    // Создаем интеграцию
    const chainalysisIntegration = new ChainalysisAMLIntegration();
    const result = await chainalysisIntegration.integrateWithAML(
      address,
      transactionHash,
      asset || "SOL"
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    SecureLogger.error("Error in Chainalysis AML integration API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during AML integration",
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
    const transactionHash = searchParams.get("transactionHash");
    const asset = searchParams.get("asset") as ChainalysisAsset;

    if (!address && !transactionHash) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_INPUT", message: "Either address or transactionHash parameter is required" } },
        { status: 400 }
      );
    }

    // Создаем интеграцию
    const chainalysisIntegration = new ChainalysisAMLIntegration();
    const result = await chainalysisIntegration.integrateWithAML(
      address || undefined,
      transactionHash || undefined,
      asset || "SOL"
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    SecureLogger.error("Error in Chainalysis AML integration GET API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during AML integration",
        },
      },
      { status: 500 }
    );
  }
}