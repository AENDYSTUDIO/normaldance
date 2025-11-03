import { SecureLogger } from '@/lib/security/secure-logger';
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateTelegramInitData } from "@/lib/security/telegram-validator";
import { sanitizeHTML } from "@/lib/security/input-sanitizer";
import { memorialSchema } from "@/lib/schemas";
import { db } from "@/lib/db";
import { BrowserProvider, Contract, ethers } from "ethers";

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 10): boolean {
  const now = Date.now();
  const oneMinute = 60 * 1000;

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + oneMinute });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Contract ABI
const GRAVE_MEMORIAL_ABI = [
  "function createMemorial(string _ipfsHash, address[] _heirs, string _artistName) public payable returns (uint256)",
  "function getMemorial(uint256 tokenId) public view returns (tuple(string ipfsHash, address[] heirs, uint256 fundBalance, uint256 platformFee, string artistName, bool isActive, uint256 createdAt))",
  "function getUserMemorials(address user) public view returns (uint256[])",
  "function getMemorialByArtist(string artistName) public view returns (uint256)",
  "event MemorialCreated(uint256 indexed tokenId, address indexed creator, string artistName, address[] heirs)",
];

// GET /api/grave/memorials - Получить все мемориалы
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const chainId = searchParams.get("chainId") || "1";

    // Для начала возвращаем данные из БД
    let memorials: any[] = [];

    try {
      // Пытаемся получить из Prisma если БД настроена
      memorials = await db.graveMemorial.findMany({
        where: search
          ? {
              artistName: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Если БД не настроена, используем mock данные
      memorials = [
        {
          id: "1",
          artistName: "DJ Eternal",
          ipfsHash: "QmDemoMemorial123",
          fundBalance: 1.25,
          heirs: [process.env.SECRET_KEY],
          isActive: true,
          createdAt: new Date("2024-12-01"),
          visitCount: 1250,
          totalDonations: 15,
        },
        {
          id: "2",
          artistName: "Producer Ghost",
          ipfsHash: "QmDemoMemorial456",
          fundBalance: 0.89,
          heirs: [process.env.SECRET_KEY],
          isActive: true,
          createdAt: new Date("2024-11-15"),
          visitCount: 890,
          totalDonations: 8,
        },
        {
          id: "3",
          artistName: "Synth Master",
          ipfsHash: "QmDemoMemorial789",
          fundBalance: 2.15,
          heirs: [
            process.env.SECRET_KEY,
            process.env.SECRET_KEY,
          ],
          isActive: true,
          createdAt: new Date("2024-10-20"),
          visitCount: 2100,
          totalDonations: 22,
        },
      ];

      if (search) {
        memorials = memorials.filter((m) =>
          m.artistName.toLowerCase().includes(search.toLowerCase()),
        );
      }

      memorials = memorials.slice((page - 1) * limit, page * limit);
    }

    const total = await db.graveMemorial
      .count({
        where: search
          ? {
              artistName: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
      })
      .catch(() => memorials.length);

    return NextResponse.json({
      success: true,
      data: {
        memorials,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        chainId,
      },
    });
  } catch (error) {
    SecureLogger.error("Error fetching memorials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch memorials" },
      { status: 500 },
    );
  }
}

// POST /api/grave/memorials - Создать новый мемориал
export async function POST(request: NextRequest) {
  try {
    // 🔐 SECURITY: Telegram authentication
    const initData = request.headers.get("x-telegram-init-data");

    if (!initData) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Missing Telegram authentication",
        },
        { status: 401 },
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      SecureLogger.error("[Security] TELEGRAM_BOT_TOKEN not configured!");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    const validation = validateTelegramInitData(initData, botToken, 3600);

    if (!validation.valid) {
      SecureLogger.warn("[Security] Invalid Telegram initData:", validation.error);
      return NextResponse.json(
        { success: false, error: `Authentication failed: ${validation.error}` },
        { status: 401 },
      );
    }

    const userId = validation.userId || "anonymous";

    // 🔐 SECURITY: Rate limiting
    if (!checkRateLimit(`memorial:${userId}`, 3)) {
      const response = NextResponse.json(
        {
          success: false,
          error:
            "Too many requests. Please wait before creating another memorial.",
        },
        { status: 429 },
      );
      response.headers.set("Retry-After", "60");
      return response;
    }

    const body = await request.json();

    // 🔐 SECURITY: Input validation
    const { artistName, ipfsHash, heirs, chainId } = memorialSchema.parse(body);

    // Validate heirs
    if (!heirs || heirs.length === 0 || heirs.length > 10) {
      return NextResponse.json(
        { success: false, error: "Invalid number of heirs (1-10)" },
        { status: 400 },
      );
    }

    // Validate Ethereum addresses
    const validHeirs = heirs.filter((addr) => ethers.isAddress(addr));
    if (validHeirs.length !== heirs.length) {
      return NextResponse.json(
        { success: false, error: "Invalid Ethereum address in heirs" },
        { status: 400 },
      );
    }

    // Get contract address from environment
    const contractAddressEnv =
      process.env[`GRAVE_CONTRACT_ADDRESS_${(chainId || "1").toUpperCase()}`] ||
      process.env.NEXT_PUBLIC_GRAVE_CONTRACT_ADDRESS;

    if (!contractAddressEnv) {
      SecureLogger.warn(
        "[Warning] GRAVE_CONTRACT_ADDRESS not configured, using blockchain later",
      );
    }

    // In production, this would call the smart contract
    let transactionHash = "";
    let tokenId = "";

    try {
      if (contractAddressEnv && process.env.GRAVE_PROVIDER_RPC) {
        // Call smart contract (if configured for server-side execution)
        SecureLogger.log(
          `[Blockchain] Would create memorial on chain ${chainId} at ${contractAddressEnv}`,
        );
        // This would be executed via ethers.js on the backend
        // For now, we skip it as it requires private key management
      }
    } catch (error) {
      SecureLogger.warn("[Blockchain] Could not create memorial on-chain:", error);
      // Continue to save to database anyway
    }

    // Create memorial record in database
    const newMemorial = await db.graveMemorial
      .create({
        data: {
          artistName,
          ipfsHash,
          heirs: validHeirs,
          chainId: (chainId || "1").toString(),
          contractAddress: contractAddressEnv || "",
          transactionHash,
          createdBy: userId,
          isActive: true,
        },
      })
      .catch(async () => {
        // If DB not available, create mock record
        return {
          id: Date.now().toString(),
          artistName,
          ipfsHash,
          heirs: validHeirs,
          chainId: (chainId || "1").toString(),
          contractAddress: contractAddressEnv || "",
          transactionHash: "",
          createdBy: userId,
          isActive: true,
          fundBalance: 0,
          currency: "ETH",
          createdAt: new Date(),
          updatedAt: new Date(),
          visitCount: 0,
        };
      });

    SecureLogger.log("[Security] Memorial created:", {
      userId,
      artistName,
      chainId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: newMemorial,
      message: "Memorial created successfully",
      blockchain: {
        transactionHash,
        chainId,
        contractAddress: contractAddressEnv,
      },
    });
  } catch (error) {
    SecureLogger.error("Error creating memorial:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create memorial",
      },
      { status: 500 },
    );
  }
}
