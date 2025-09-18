@echo off
echo 🚀 NORMALDANCE Quick Deploy Script
echo ================================

echo 1. Installing dependencies...
npm install

echo 2. Generating Prisma client...
npx prisma generate

echo 3. Running database migrations...
npx prisma migrate deploy

echo 4. Building project...
npm run build

echo 5. Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo Check your deployment at: https://normaldance.vercel.app
pause