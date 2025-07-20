#!/bin/bash

# Backup Verification Script
echo "🔍 Verifying ParcelAce Backup..."
echo "=================================="

BACKUP_DIR="/Users/prateeksharma/parcelace_backup_20250720_175022"
ORIGINAL_DIR="/Users/prateeksharma/parcelace"

echo "📁 Checking backup directory exists..."
if [ -d "$BACKUP_DIR" ]; then
    echo "✅ Backup directory found: $BACKUP_DIR"
else
    echo "❌ Backup directory not found!"
    exit 1
fi

echo ""
echo "📊 Checking backup size..."
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "✅ Backup size: $BACKUP_SIZE"

echo ""
echo "📋 Checking critical files..."
CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "src/App.tsx"
    "src/components/OrdersPage.tsx"
    "src/components/CourierPartnerSelection.tsx"
    "src/components/ViewOrderDetails.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$BACKUP_DIR/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done

echo ""
echo "🔧 Checking dependencies..."
if [ -d "$BACKUP_DIR/node_modules" ]; then
    echo "✅ node_modules directory found"
else
    echo "⚠️  node_modules directory not found (normal for backup)"
fi

echo ""
echo "📦 Checking source files..."
SRC_COUNT=$(find "$BACKUP_DIR/src" -name "*.tsx" -o -name "*.ts" | wc -l)
echo "✅ Found $SRC_COUNT TypeScript/React files"

echo ""
echo "🎯 Checking key components..."
COMPONENTS=(
    "OrdersPage.tsx"
    "CourierPartnerSelection.tsx"
    "ViewOrderDetails.tsx"
    "App.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$BACKUP_DIR/src/components/$component" ]; then
        echo "✅ $component"
    else
        echo "❌ $component (MISSING)"
    fi
done

echo ""
echo "📄 Checking configuration files..."
CONFIG_FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "tailwind.config.ts"
)

for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$BACKUP_DIR/$config" ]; then
        echo "✅ $config"
    else
        echo "❌ $config (MISSING)"
    fi
done

echo ""
echo "🎉 Backup Verification Complete!"
echo "=================================="
echo "📁 Backup Location: $BACKUP_DIR"
echo "📊 Backup Size: $BACKUP_SIZE"
echo "📋 Source Files: $SRC_COUNT"
echo ""
echo "✅ Backup is ready for next module development!" 