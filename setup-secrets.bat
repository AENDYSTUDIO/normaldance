@echo off
echo 🔐 NORMALDANCE Secrets Setup
echo ===========================

echo Generating NEXTAUTH_SECRET...
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" > .env.secret

echo Setting up production environment...
echo DATABASE_URL=postgresql://neondb_owner:npg_Z8K9X7Y6@ep-rough-forest-a5m2n3p4.us-east-2.aws.neon.tech/neondb?sslmode=require >> .env.secret
echo NEXTAUTH_URL=https://normaldance.vercel.app >> .env.secret

echo ✅ Secrets generated! Check .env.secret file
echo Copy these values to Vercel environment variables
pause