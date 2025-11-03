import { PublicKey } from "@solana/web3.js";

const isProd = process.env.NODE_ENV === "production";
function requireEnv(key: string): string | undefined {
  const v = process.env[key];
  if (isProd && !v) {
    throw new Error(`Missing required env var in production: ${key}`);
  }
  return v;
}

// Валидные Solana адреса (base58) - используйте переменные окружения для продакшена
export const NDT_PROGRAM_ID = new PublicKey(
  requireEnv("NEXT_PUBLIC_NDT_PROGRAM_ID") ||
    process.env.SECRET_KEY
);

export const NDT_MINT_ADDRESS = new PublicKey(
  requireEnv("NEXT_PUBLIC_NDT_MINT_ADDRESS") ||
    process.env.SECRET_KEY
);

export const TRACKNFT_PROGRAM_ID = new PublicKey(
  requireEnv("NEXT_PUBLIC_TRACKNFT_PROGRAM_ID") ||
    process.env.SECRET_KEY
);

export const STAKING_PROGRAM_ID = new PublicKey(
  requireEnv("NEXT_PUBLIC_STAKING_PROGRAM_ID") ||
    process.env.SECRET_KEY
);
