const crypto = await import('crypto');
const fs = await import('fs');

// Function to generate secure random string
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Generate all necessary secrets
const secrets = {
  // Authentication & Security
  NEXTAUTH_SECRET: generateSecret(64),
  JWT_SECRET: generateSecret(64),
  APP_ID: generateUUID(),
  API_SECRET_KEY: generateSecret(32),

  // Database
  DATABASE_URL: `postgresql://normaldance:${generateSecret(16)}@localhost:5432/normaldance`,
  DB_PASSWORD: generateSecret(16),
  REDIS_PASSWORD: generateSecret(16),
  REDIS_URL: `redis://:${generateSecret(16)}@localhost:6379`,

  // Solana & Web3
  SOLANA_RPC_TIMEOUT: '8000',
  NEXT_PUBLIC_NDT_PROGRAM_ID: `NDT${generateSecret(20).toUpperCase()}`,
  NEXT_PUBLIC_NDT_MINT_ADDRESS: generateSecret(40).toUpperCase(),
  NEXT_PUBLIC_TRACKNFT_PROGRAM_ID: `TRACKNFT${generateSecret(16).toUpperCase()}`,
  NEXT_PUBLIC_STAKING_PROGRAM_ID: `STAKING${generateSecret(16).toUpperCase()}`,

  // IPFS
  PINATA_API_KEY: generateSecret(32),
  PINATA_SECRET_KEY: generateSecret(32),
  PINATA_JWT: generateSecret(32),

  // OAuth & External Services
  SPOTIFY_CLIENT_ID: generateUUID(),
  SPOTIFY_CLIENT_SECRET: generateSecret(32),
  APPLE_CLIENT_ID: generateUUID(),
  APPLE_CLIENT_SECRET: generateSecret(32),

  // Error Tracking
  SENTRY_DSN: `https://${generateSecret(32)}@sentry.io/1234567`,
  NEXT_PUBLIC_SENTRY_DSN: `https://${generateSecret(32)}@sentry.io/1234567`,

  // Telegram
  TELEGRAM_BOT_TOKEN: `${generateSecret(10)}:A${generateSecret(20).toUpperCase()}`,
  TELEGRAM_CHAT_ID: generateSecret(10),

  // Vercel
  VERCEL_PROJECT_NAME: 'normaldance',
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: generateUUID(),

  // AI/ML Configuration
  LANGGRAPH_API_KEY: `sk-${generateSecret(32)}`,
  OPENAI_API_KEY: `sk-${generateSecret(48)}`,

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: `https://${generateSecret(16)}.upstash.io`,
  UPSTASH_REDIS_REST_TOKEN: generateSecret(32),

  // Analytics
  MIXPANEL_TOKEN: generateSecret(32)
};

// Save to .env file
const envContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync('.env.generated', envContent);

// GitHub Actions setup commands
console.log('=== GITHUB SECRETS GENERATION COMPLETE ===\n');
console.log('Copy and paste these commands to set up GitHub repository secrets:\n');

console.log('# Core Authentication & Security:');
console.log(`gh secret set NEXTAUTH_SECRET --body "${secrets.NEXTAUTH_SECRET}"`);
console.log(`gh secret set JWT_SECRET --body "${secrets.JWT_SECRET}"`);
console.log(`gh secret set API_SECRET_KEY --body "${secrets.API_SECRET_KEY}"`);
console.log('');

console.log('# Database Configuration:');
console.log(`gh secret set DATABASE_URL --body "${secrets.DATABASE_URL}"`);
console.log(`gh secret set DB_PASSWORD --body "${secrets.DB_PASSWORD}"`);
console.log(`gh secret set REDIS_PASSWORD --body "${secrets.REDIS_PASSWORD}"`);
console.log(`gh secret set REDIS_URL --body "${secrets.REDIS_URL}"`);
console.log('');

console.log('# Web3 Program IDs:');
console.log(`gh secret set NEXT_PUBLIC_NDT_PROGRAM_ID --body "${secrets.NEXT_PUBLIC_NDT_PROGRAM_ID}"`);
console.log(`gh secret set NEXT_PUBLIC_NDT_MINT_ADDRESS --body "${secrets.NEXT_PUBLIC_NDT_MINT_ADDRESS}"`);
console.log(`gh secret set NEXT_PUBLIC_TRACKNFT_PROGRAM_ID --body "${secrets.NEXT_PUBLIC_TRACKNFT_PROGRAM_ID}"`);
console.log(`gh secret set NEXT_PUBLIC_STAKING_PROGRAM_ID --body "${secrets.NEXT_PUBLIC_STAKING_PROGRAM_ID}"`);
console.log('');

console.log('# IPFS Configuration:');
console.log(`gh secret set PINATA_API_KEY --body "${secrets.PINATA_API_KEY}"`);
console.log(`gh secret set PINATA_SECRET_KEY --body "${secrets.PINATA_SECRET_KEY}"`);
console.log(`gh secret set PINATA_JWT --body "${secrets.PINATA_JWT}"`);
console.log('');

console.log('# External Services:');
console.log(`gh secret set SPOTIFY_CLIENT_ID --body "${secrets.SPOTIFY_CLIENT_ID}"`);
console.log(`gh secret set SPOTIFY_CLIENT_SECRET --body "${secrets.SPOTIFY_CLIENT_SECRET}"`);
console.log(`gh secret set APPLE_CLIENT_ID --body "${secrets.APPLE_CLIENT_ID}"`);
console.log(`gh secret set APPLE_CLIENT_SECRET --body "${secrets.APPLE_CLIENT_SECRET}"`);
console.log('');

console.log('# Error Tracking:');
console.log(`gh secret set SENTRY_DSN --body "${secrets.SENTRY_DSN}"`);
console.log(`gh secret set NEXT_PUBLIC_SENTRY_DSN --body "${secrets.NEXT_PUBLIC_SENTRY_DSN}"`);
console.log('');

console.log('# Telegram Configuration:');
console.log(`gh secret set TELEGRAM_BOT_TOKEN --body "${secrets.TELEGRAM_BOT_TOKEN}"`);
console.log(`gh secret set TELEGRAM_CHAT_ID --body "${secrets.TELEGRAM_CHAT_ID}"`);
console.log('');

console.log('# AI/ML Services:');
console.log(`gh secret set LANGGRAPH_API_KEY --body "${secrets.LANGGRAPH_API_KEY}"`);
console.log(`gh secret set OPENAI_API_KEY --body "${secrets.OPENAI_API_KEY}"`);
console.log('');

console.log('# Upstash Redis:');
console.log(`gh secret set UPSTASH_REDIS_REST_URL --body "${secrets.UPSTASH_REDIS_REST_URL}"`);
console.log(`gh secret set UPSTASH_REDIS_REST_TOKEN --body "${secrets.UPSTASH_REDIS_REST_TOKEN}"`);
console.log('');

console.log('# Analytics:');
console.log(`gh secret set MIXPANEL_TOKEN --body "${secrets.MIXPANEL_TOKEN}"`);
console.log('');

console.log('=== BATCH SETUP COMMAND ===');
console.log('To run all commands at once, save this script as setup-secrets.sh and execute:');
console.log('');
console.log('#!/bin/bash');
console.log('# Auto-generated secrets setup script');
console.log('');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`gh secret set ${key} --body "${value}"` || true);
});

console.log('');
console.log('=== IMPORTANT NOTES ===');
console.log('1. A .env.generated file has been created with all secrets');
console.log('2. These are generated values - you may need to replace some with actual API keys');
console.log('3. Keep this file secure and do not commit it to version control');
console.log('4. Update program IDs with actual deployed contract addresses');
console.log('5. Replace placeholder keys (like OpenAI, Spotify) with actual API keys');

console.log('\n=== CRITICAL SECRETS THAT NEED MANUAL INPUT ===');
console.log('You must manually obtain and set these secrets:');
console.log('- OPENAI_API_KEY (get from OpenAI platform)');
console.log('- SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET (from Spotify Developer Dashboard)');
console.log('- APPLE_CLIENT_ID & APPLE_CLIENT_SECRET (from Apple Developer Portal)');
console.log('- SENTRY_DSN (from Sentry.io project)');
console.log('- Program IDs (from actual deployed Solana programs)');
console.log('- PINATA credentials (from Pinata.cloud)');
