#!/bin/bash

# NORMAL DANCE - Quick Deployment Script
# This script helps deploy the project to Vercel

set -e

echo "🚀 NORMAL DANCE - Vercel Deployment"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Deploy to Production"
echo "2. Deploy to Preview"
echo "3. Setup Project (first time)"
echo ""
read -p "Choose option (1-3): " option

case $option in
    1)
        echo "🚀 Deploying to Production..."
        vercel --prod
        ;;
    2)
        echo "🔍 Deploying to Preview..."
        vercel
        ;;
    3)
        echo "⚙️ Setting up project..."
        vercel link
        echo ""
        echo "✅ Project linked! Now you can deploy with:"
        echo "   ./deploy.sh"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check your deployment at Vercel Dashboard"
echo "2. Configure environment variables if needed"
echo "3. Set up custom domain (optional)"
echo ""
echo "🔗 Useful links:"
echo "   Dashboard: https://vercel.com/dashboard"
echo "   Docs: https://vercel.com/docs"
echo ""
