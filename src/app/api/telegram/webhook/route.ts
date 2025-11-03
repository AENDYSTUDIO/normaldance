import { SecureLogger } from '@/lib/security/secure-logger';
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { telegramBot } from "@/mcp/telegram-bot";

/**
 * POST /api/telegram/webhook
 * Telegram webhook handler for receiving bot updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Process update through Telegraf bot
    // The bot will handle all routing automatically
    await telegramBot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    SecureLogger.error("[Telegram Webhook] Error processing update:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/telegram/webhook
 * Health check and webhook info
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "active",
    service: "G.Rave Telegram Bot",
    features: [
      "mini_app",
      "memorials",
      "donations",
      "notifications",
      "payments",
    ],
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
