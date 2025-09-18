@echo off
echo 🚀 NORMALDANCE Quick Setup

echo 📦 Installing dependencies...
npm install @upstash/redis @upstash/ratelimit helmet sharp

echo 🗄️ Setting up database...
npx prisma generate
npx prisma db push

echo 🔧 Creating uploads directories...
if not exist "uploads" mkdir uploads
if not exist "uploads\audio" mkdir uploads\audio
if not exist "uploads\images" mkdir uploads\images

echo 🏗️ Building project...
npm run build

echo ✅ Setup complete!
echo 🌐 Start with: npm run dev
pause