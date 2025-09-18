@echo off
echo Setting up Vercel environment variables...

REM Production Database
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

REM IPFS/Pinata
vercel env add PINATA_API_KEY production
vercel env add PINATA_SECRET_API_KEY production

REM Solana
vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
vercel env add HELIUS_API_KEY production
vercel env add NEXT_PUBLIC_PLATFORM_WALLET production

echo Environment setup complete!
pause