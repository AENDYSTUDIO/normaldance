@echo off
echo 🎵 Starting NORMALDANCE Development Server

echo 📊 Checking system...
node --version
npm --version

echo 🗄️ Database status...
if exist "prisma\db\custom.db" (
    echo ✅ Database found
) else (
    echo 🔧 Creating database...
    npx prisma db push
)

echo 🚀 Starting development server...
echo 📱 Open: http://localhost:3000
echo 📊 Analytics: http://localhost:3000/api/analytics
echo 🏥 Health: http://localhost:3000/api/health

npm run dev