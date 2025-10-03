#!/bin/bash

# Avatar Upload Testing Script
# This script helps test the avatar upload functionality

echo "🧪 Avatar Upload Test Helper"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project paths
BACKEND_PATH="/Applications/MAMP/htdocs/katogo"
FRONTEND_PATH="/Users/mac/Desktop/github/katogo-react"

echo "📁 Project Paths:"
echo "   Backend: $BACKEND_PATH"
echo "   Frontend: $FRONTEND_PATH"
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend directory found${NC}"

# Check storage directory permissions
echo ""
echo "🔐 Checking Storage Permissions..."
STORAGE_PATH="$BACKEND_PATH/storage"
if [ -d "$STORAGE_PATH" ]; then
    STORAGE_PERMS=$(stat -f "%OLp" "$STORAGE_PATH" 2>/dev/null || stat -c "%a" "$STORAGE_PATH" 2>/dev/null)
    echo "   Storage permissions: $STORAGE_PERMS"
    
    if [ "$STORAGE_PERMS" == "775" ] || [ "$STORAGE_PERMS" == "777" ]; then
        echo -e "${GREEN}✅ Storage permissions are correct${NC}"
    else
        echo -e "${YELLOW}⚠️  Storage permissions might need adjustment${NC}"
        echo "   Run: chmod -R 775 $STORAGE_PATH"
    fi
else
    echo -e "${RED}❌ Storage directory not found!${NC}"
fi

# Check if storage/images directory exists
echo ""
echo "📂 Checking Upload Directory..."
IMAGES_PATH="$BACKEND_PATH/public/storage/images"
if [ -d "$IMAGES_PATH" ]; then
    IMAGE_COUNT=$(ls -1 "$IMAGES_PATH" 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ Upload directory exists${NC}"
    echo "   Current images: $IMAGE_COUNT"
else
    echo -e "${YELLOW}⚠️  Upload directory not found${NC}"
    echo "   Creating: $IMAGES_PATH"
    mkdir -p "$IMAGES_PATH"
    chmod 775 "$IMAGES_PATH"
fi

# Check storage symlink
echo ""
echo "🔗 Checking Storage Symlink..."
SYMLINK_PATH="$BACKEND_PATH/public/storage"
if [ -L "$SYMLINK_PATH" ]; then
    echo -e "${GREEN}✅ Storage symlink exists${NC}"
    TARGET=$(readlink "$SYMLINK_PATH")
    echo "   Points to: $TARGET"
else
    echo -e "${YELLOW}⚠️  Storage symlink missing${NC}"
    echo "   Run: cd $BACKEND_PATH && php artisan storage:link"
fi

# Check Laravel log file
echo ""
echo "📝 Laravel Logs:"
LOG_FILE="$BACKEND_PATH/storage/logs/laravel.log"
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
    echo -e "${GREEN}✅ Log file exists (Size: $LOG_SIZE)${NC}"
    echo "   Path: $LOG_FILE"
    echo ""
    echo "   Recent avatar-related logs:"
    grep -i "photo\|avatar\|file.*received" "$LOG_FILE" 2>/dev/null | tail -5 || echo "   No recent logs found"
else
    echo -e "${YELLOW}⚠️  Log file not found${NC}"
fi

# Test Instructions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Manual Testing Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Start monitoring Laravel logs:"
echo -e "   ${YELLOW}tail -f $LOG_FILE${NC}"
echo ""
echo "2. Open browser DevTools (F12)"
echo "   - Go to Console tab"
echo "   - Go to Network tab"
echo ""
echo "3. Navigate to profile edit:"
echo "   - http://localhost:3000/account/profile"
echo "   - Click 'Edit Profile'"
echo ""
echo "4. Upload avatar:"
echo "   - Click avatar preview"
echo "   - Select image (< 5MB, JPEG/PNG/GIF)"
echo "   - Verify preview shows"
echo ""
echo "5. Submit form:"
echo "   - Click 'Save Profile'"
echo "   - Watch console logs"
echo "   - Watch Laravel logs"
echo ""
echo "6. Verify success:"
echo "   - Profile shows new avatar"
echo "   - Check uploaded file:"
echo -e "     ${YELLOW}ls -lh $IMAGES_PATH${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Quick log monitor option
echo ""
read -p "Would you like to monitor logs now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📡 Monitoring Laravel logs (Ctrl+C to stop)..."
    echo ""
    tail -f "$LOG_FILE"
fi
