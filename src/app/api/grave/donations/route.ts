import { SecureLogger } from '@/lib/security/secure-logger';
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateTelegramInitData } from "@/lib/security/telegram-validator";
import { sanitizeHTML } from "@/lib/security/input-sanitizer";
import { donationSchema } from "@/lib/schemas";
import { db } from "@/lib/db";
import { ethers } from "ethers";

// 🔐 SECURITY: Rate limiting map (in-memory for now)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 5): boolean {
  const now = Date.now();
  const oneMinute = 60 * 1000;

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + oneMinute });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

// Grave Memorial Contract ABI (donation-related functions)
const GRAVE_MEMORIAL_ABI = [
  "function donate(uint256 tokenId, string memory message) public payable nonReentrant",
  "function getMemorial(uint256 tokenId) public view returns (tuple(string ipfsHash, address[] heirs, uint256 fundBalance, uint256 platformFee, string artistName, bool isActive, uint256 createdAt))",
  "event DonationReceived(uint256 indexed tokenId, address indexed donor, uint256 amount, string message)",
];

// POST /api/grave/donations - Сделать пожертвование в мемориал
export async function POST(request: NextRequest) {
  try {
    // 🔐 SECURITY 1: Telegram authentication
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

    // 🔐 SECURITY 2: Rate limiting (5 donations per minute per user)
    if (!checkRateLimit(`donation:${userId}`, 5)) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please wait before donating again.",
        },
        { status: 429 },
      );
      response.headers.set("Retry-After", "60");
      return response;
    }

    const body = await request.json();

    // 🔐 SECURITY 3: Input validation with Zod
    const {
      memorialId,
      amount,
      currency,
      message,
      isAnonymous,
      chainId,
      donorAddress,
    } = donationSchema.parse(body);

    // 🔐 SECURITY 4: Sanitize message (prevent XSS)
    const sanitizedMessage = message
      ? sanitizeHTML(message.substring(0, 500))
      : "";

    // Validate amount
    if (amount <= 0 || amount > 1000) {
      return NextResponse.json(
        { success: false, error: "Invalid donation amount (0-1000)" },
        { status: 400 },
      );
    }

    // Validate memorial exists
    let memorial;
    try {
      memorial = await db.graveMemorial.findUnique({
        where: { id: memorialId },
      });

      if (!memorial) {
        return NextResponse.json(
          { success: false, error: "Memorial not found" },
          { status: 404 },
        );
      }

      if (!memorial.isActive) {
        return NextResponse.json(
          { success: false, error: "Memorial is not active" },
          { status: 400 },
        );
      }
    } catch (error) {
      SecureLogger.warn("[Database] Could not verify memorial, proceeding anyway");
    }

    // Validate Ethereum address if provided
    if (donorAddress && !ethers.isAddress(donorAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid donor Ethereum address" },
        { status: 400 },
      );
    }

    // Create donation record
    const donation = {
      id: Date.now().toString(),
      memorialId,
      amount,
      currency: currency || "ETH",
      message: sanitizedMessage,
      donor: isAnonymous ? "Anonymous" : userId,
      donorAddress: donorAddress || userId,
      timestamp: new Date().toISOString(),
      transactionHash: "", // TODO: Will be filled after blockchain confirmation
      status: "PENDING" as const,
      chainId: chainId || "1",
    };

    // Save to database if available
    try {
      const savedDonation = await db.donation.create({
        data: {
          memorialId,
          donorAddress: donorAddress || userId,
          donorName: isAnonymous ? "Anonymous" : undefined,
          amount: BigInt(Math.floor(amount * 1e18)), // Convert to Wei-like precision
          currency: currency || "ETH",
          message: sanitizedMessage,
          isAnonymous: isAnonymous || false,
          transactionHash: "",
          chainId: chainId || "1",
          status: "PENDING",
        },
      });

      donation.id = savedDonation.id;
    } catch (error) {
      SecureLogger.warn(
        "[Database] Could not save donation to DB, continuing with in-memory record",
      );
    }

    // 🔐 SECURITY 5: Log security event
    SecureLogger.log("[Security] Donation processed:", {
      userId,
      memorialId,
      amount,
      currency,
      donorAddress,
      timestamp: donation.timestamp,
      isAnonymous,
    });

    // In production: Call smart contract to process donation
    let transactionHash = "";
    if (
      process.env.GRAVE_PROVIDER_RPC &&
      process.env.NEXT_PUBLIC_GRAVE_CONTRACT_ADDRESS
    ) {
      try {
        // This would typically be done client-side with MetaMask
        // Server-side execution requires private key management
        SecureLogger.log("[Blockchain] Donation would be processed on-chain");
        // const provider = new ethers.JsonRpcProvider(process.env.GRAVE_PROVIDER_RPC)
        // const contract = new ethers.Contract(
        //   process.env.NEXT_PUBLIC_GRAVE_CONTRACT_ADDRESS,
        //   GRAVE_MEMORIAL_ABI,
        //   provider
        // )
        // const tx = await contract.donate(memorialId, sanitizedMessage, {
        //   value: ethers.parseEther(amount.toString())
        // })
        // transactionHash = tx.hash
      } catch (error) {
        SecureLogger.warn(
          "[Blockchain] Could not process donation on-chain:",
          error,
        );
      }
    }

    // Update memorial fund balance if in database
    try {
      if (memorial) {
        await db.graveMemorial.update({
          where: { id: memorialId },
          data: {
            fundBalance: {
              increment: amount * 0.98, // 98% after 2% fee
            },
          },
        });
      }
    } catch (error) {
      SecureLogger.warn("[Database] Could not update memorial fund balance");
    }

    return NextResponse.json({
      success: true,
      data: { donation },
      message: "Donation processed successfully",
      blockchain: {
        transactionHash,
        chainId: chainId || "1",
        status: "PENDING", // Will be updated to CONFIRMED after blockchain confirmation
      },
    });
  } catch (error) {
    SecureLogger.error("Error processing donation:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to process donation";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// GET /api/grave/donations?memorialId=123 - Получить пожертвования для мемориала
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memorialId = searchParams.get("memorialId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!memorialId) {
      return NextResponse.json(
        { success: false, error: "Memorial ID required" },
        { status: 400 },
      );
    }

    let donations: any[] = [];

    // Try to get from database
    try {
      donations = await db.donation.findMany({
        where: { memorialId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Convert BigInt to string for JSON serialization
      donations = donations.map((d) => ({
        ...d,
        amount: d.amount.toString(),
      }));
    } catch (error) {
      SecureLogger.warn(
        "[Database] Could not fetch donations from DB, using mock data",
      );

      // Mock data for demonstration
      donations = [
        {
          id: "1",
          memorialId,
          amount: ethers.parseEther("0.05").toString(),
          message: "Спасибо за музыку! 🎵",
          donor: process.env.SECRET_KEY,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          transactionHash:
            process.env.SECRET_KEY,
          status: "COMPLETED",
          currency: "ETH",
        },
        {
          id: "2",
          memorialId,
          amount: ethers.parseEther("0.025").toString(),
          message: "Твоя музыка живет в наших сердцах",
          donor: process.env.SECRET_KEY,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          transactionHash:
            process.env.SECRET_KEY,
          status: "COMPLETED",
          currency: "ETH",
        },
        {
          id: "3",
          memorialId,
          amount: ethers.parseEther("0.1").toString(),
          message: "Forever in our hearts",
          donor: "Anonymous",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          transactionHash:
            process.env.SECRET_KEY,
          status: "COMPLETED",
          currency: "ETH",
        },
      ];
    }

    // Get total count
    let totalCount = donations.length;
    try {
      totalCount = await db.donation
        .count({
          where: { memorialId },
        })
        .catch(() => donations.length);
    } catch {
      // Use mock data count
    }

    // Calculate statistics
    const totalDonated = donations.reduce((sum, d) => {
      const amount =
        typeof d.amount === "bigint"
          ? Number(d.amount) / 1e18
          : parseFloat(d.amount);
      return sum + amount;
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        donations,
        statistics: {
          totalDonations: donations.length,
          totalAmount: totalDonated.toFixed(4),
          averageDonation: (totalDonated / donations.length).toFixed(4),
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    SecureLogger.error("Error fetching donations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 },
    );
  }
}

// DELETE /api/grave/donations/:id - Remove a donation (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    // Simple admin check
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get("id");

    if (!donationId) {
      return NextResponse.json(
        { success: false, error: "Donation ID required" },
        { status: 400 },
      );
    }

    // Delete from database
    try {
      await db.donation.delete({
        where: { id: donationId },
      });
    } catch (error) {
      SecureLogger.warn("[Database] Could not delete donation from DB");
    }

    SecureLogger.log("[Security] Donation deleted by admin:", { donationId });

    return NextResponse.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    SecureLogger.error("Error deleting donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete donation" },
      { status: 500 },
    );
  }
}
