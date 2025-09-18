@echo off
echo 🔍 NORMALDANCE Project Health Check
echo ==================================

echo 1. Checking Node.js version...
node --version

echo 2. Checking npm version...
npm --version

echo 3. Installing dependencies...
npm install

echo 4. Checking TypeScript...
npx tsc --noEmit

echo 5. Running linter...
npm run lint

echo 6. Generating Prisma client...
npx prisma generate

echo 7. Testing build...
npm run build

echo ✅ Project health check complete!
pause