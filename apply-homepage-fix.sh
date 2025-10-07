#!/bin/bash

# Fix Homepage Issues - Apply Database Migration
# This script helps you apply the foreign key constraints fix to Railway PostgreSQL

set -e

echo "🔧 Homepage Issues Fix - Database Migration"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g @railway/cli"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Railway CLI detected"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "✅ Logged in to Railway"
echo ""

# Check if project is linked
if ! railway status &> /dev/null; then
    echo "🔗 Please link to your Railway project..."
    railway link
fi

echo "✅ Project linked"
echo ""

# Show current project
echo "📦 Current Railway Project:"
railway status
echo ""

# Confirm before proceeding
echo "⚠️  This will modify your PostgreSQL database foreign key constraints."
echo "   It will add CASCADE DELETE to improve data consistency."
echo ""
read -p "Do you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted."
    exit 0
fi

echo ""
echo "🚀 Applying database migration..."
echo ""

# Apply the SQL migration script
if railway run psql < fix-foreign-keys-cascade.sql; then
    echo ""
    echo "✅ Database migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. The foreign key constraints have been updated"
    echo "2. Deploy the updated code to Railway:"
    echo "   git add ."
    echo "   git commit -m 'fix: Add CASCADE DELETE and fix homepage display'"
    echo "   git push origin main"
    echo ""
    echo "3. Test the fixes:"
    echo "   - Delete a project (should work now)"
    echo "   - Check project names and dates display correctly"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Please check:"
    echo "1. Your PostgreSQL service is running"
    echo "2. You have the correct permissions"
    echo "3. Check Railway logs: railway logs"
    echo ""
    exit 1
fi
