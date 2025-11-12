import { SecureLogger } from '@/lib/security/secure-logger';
import { db } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// GET /api/telegram/web3 - Returns Web3 integration info for Telegram Mini App
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const web3Info = {
      walletConnected: !!user.wallet,
      walletAddress: user.wallet || null,
      balance: user.balance || 0,
      tonBalance: user.tonBalance || 0,
      supportedChains: ["solana", "ton"],
      features: {
        walletConnection: true,
        tokenTransfers: true,
        nftManagement: true,
        staking: true,
      },
    };

    return NextResponse.json(web3Info);
  } catch (error) {
    SecureLogger.error("Error in Telegram Web3 API:", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/telegram/web3 - Handle Web3 actions
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "connect-wallet":
        return handleConnectWallet(user.id, body);
      case "get-balance":
        return handleGetBalance(user.id);
      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    SecureLogger.error("Error in Telegram Web3 POST:", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleConnectWallet(userId: string, body: { walletAddress: string }) {
  const { walletAddress } = body;

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { id: userId },
    data: { wallet: walletAddress },
  });

  return NextResponse.json({ success: true, walletAddress });
}

async function handleGetBalance(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { balance: true, tonBalance: true },
  });

  return NextResponse.json({
    balance: user?.balance || 0,
    tonBalance: user?.tonBalance || 0,
  });
}
