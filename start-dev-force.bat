@echo off
echo 🚀 Starting NORMALDANCE (Force Mode)

echo 🔧 Setting environment...
set DATABASE_URL=file:./prisma/db/custom.db
set NEXT_TELEMETRY_DISABLED=1
set NODE_ENV=development

echo 🗄️ Database check...
npx prisma generate >nul 2>&1

echo 🌐 Starting server (ignoring TypeScript errors)...
echo 📱 Open: http://localhost:3000
echo 📊 Health: http://localhost:3000/api/health

npm run dev