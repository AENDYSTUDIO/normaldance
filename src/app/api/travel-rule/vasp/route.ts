import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🏛️ Travel Rule VASP Registry API
 *
 * API эндпоинт для управления реестром VASP (Virtual Asset Service Providers)
 * в соответствии с требованиями FATF
 */

import { NextRequest, NextResponse } from "next/server";
import { VASPRegistryService } from "@/lib/travel-rule/vasp-registry-service";
import { VASPInfo } from "@/lib/travel-rule/types";

// Создание сервиса реестра VASP
const vaspRegistryService = new VASPRegistryService();

// GET /api/travel-rule/vasp - Получение информации о VASP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaspId = searchParams.get("id");
    const name = searchParams.get("name");
    const jurisdiction = searchParams.get("jurisdiction");
    const type = searchParams.get("type");

    let result;

    if (vaspId) {
      // Получение VASP по ID
      result = await vaspRegistryService.getVASPInfo(vaspId);
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: { code: "VASP_NOT_FOUND", message: "VASP not found" } },
          { status: 404 }
        );
      }
    } else if (name) {
      // Поиск VASP по имени
      result = await vaspRegistryService.searchVASPByName(name);
    } else if (jurisdiction) {
      // Поиск VASP по юрисдикции
      result = await vaspRegistryService.searchVASPByJurisdiction(jurisdiction);
    } else if (type) {
      // Поиск VASP по типу
      result = await vaspRegistryService.searchVASPByType(type);
    } else {
      // Получение всех активных VASP
      result = await vaspRegistryService.getAllActiveVASPs();
    }

    return NextResponse.json({
      success: true,
      data: {
        vasps: result,
        count: Array.isArray(result) ? result.length : 1,
        filters: {
          id: vaspId,
          name,
          jurisdiction,
          type,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    SecureLogger.error("Error in VASP registry GET API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during VASP registry retrieval",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/travel-rule/vasp - Добавление нового VASP в реестр
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const vaspInfo: VASPInfo = body;
    
    if (!vaspInfo) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_VASP_INFO", message: "VASP information is required" } },
        { status: 400 }
      );
    }

    // Валидация VASP информации
    const validationErrors = vaspRegistryService.validateVASPInfo(vaspInfo);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: "VALIDATION_ERROR", 
            message: "VASP information validation failed",
            details: validationErrors
          } 
        },
        { status: 400 }
      );
    }

    // Добавление VASP в реестр
    const result = await vaspRegistryService.addVASP(vaspInfo);

    return NextResponse.json({
      success: true,
      data: {
        vasp: result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    SecureLogger.error("Error in VASP registry POST API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during VASP registration",
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/travel-rule/vasp/[id] - Обновление информации о VASP
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vaspId = params.id;
    const body = await request.json();
    
    if (!vaspId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_VASP_ID", message: "VASP ID is required" } },
        { status: 400 }
      );
    }

    // Проверка существования VASP
    const existingVasp = await vaspRegistryService.getVASPInfo(vaspId);
    if (!existingVasp) {
      return NextResponse.json(
        { success: false, error: { code: "VASP_NOT_FOUND", message: "VASP not found" } },
        { status: 404 }
      );
    }

    // Обновление VASP
    const result = await vaspRegistryService.updateVASP(vaspId, body);

    if (!result) {
      return NextResponse.json(
        { success: false, error: { code: "UPDATE_FAILED", message: "Failed to update VASP" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        vasp: result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    SecureLogger.error("Error in VASP registry PUT API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during VASP update",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/travel-rule/vasp/[id]/reputation - Обновление репутации VASP
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vaspId = params.id;
    const body = await request.json();
    
    if (!vaspId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_VASP_ID", message: "VASP ID is required" } },
        { status: 400 }
      );
    }

    const { reviewScore, reviewComment } = body;
    
    if (typeof reviewScore !== 'number' || reviewScore < 0 || reviewScore > 100) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REVIEW_SCORE", message: "Review score must be between 0 and 100" } },
        { status: 400 }
      );
    }

    // Обновление репутации VASP
    const result = await vaspRegistryService.updateVASPReputation(
      vaspId,
      reviewScore,
      reviewComment
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: { code: "REPUTATION_UPDATE_FAILED", message: "Failed to update VASP reputation" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        vasp: result,
        reviewScore,
        reviewComment,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    SecureLogger.error("Error in VASP reputation POST API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during VASP reputation update",
        },
      },
      { status: 500 }
    );
  }
}

// GET /api/travel-rule/vasp/statistics - Получение статистики реестра
export async function GET(request: NextRequest) {
  try {
    // Получение статистики реестра
    const stats = await vaspRegistryService.getRegistryStatistics();

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    SecureLogger.error("Error in VASP registry statistics API:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during VASP statistics retrieval",
        },
      },
      { status: 500 }
    );
  }
}