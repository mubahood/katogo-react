#!/bin/bash

# BlitXpress React App - Production Deployment Script
# This script helps you deploy your React application to production

echo "🚀 BlitXpress Production Deployment"
echo "================================="

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found. Please run 'npm run build:prod' first."
    exit 1
fi

echo "✅ Production build found in dist/ folder"

# Display build size
echo "📦 Build size:"
du -sh dist

echo ""
echo "📋 Pre-deployment checklist:"
echo "- [ ] API endpoints configured for production (https://blit.blitxpress.com)"
echo "- [ ] HTTPS certificate installed on server"
echo "- [ ] Server configured for SPA routing"
echo "- [ ] CORS headers configured on backend"
echo "- [ ] Domain name pointed to server"

echo ""
echo "🌐 Deployment ready!"
echo "Upload the contents of the 'dist' folder to your web server."
echo ""
echo "📄 For detailed deployment instructions, see:"
echo "   - deployment-guide.md"
echo ""
echo "🔗 Test your deployment:"
echo "   - Home page loads correctly"
echo "   - Products page displays items"
echo "   - API calls work properly"
echo "   - Mobile layout is responsive"
