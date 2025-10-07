#!/bin/bash

# ============================================
# Fix Database Constraints Script
# ============================================
# This script applies SQL fixes to Railway PostgreSQL database

set -e  # Exit on error

echo "🔧 Fixing Database Constraints..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it using one of these methods:"
    echo ""
    echo "1. For Railway (recommended):"
    echo "   railway run bash fix-database.sh"
    echo ""
    echo "2. Manually export:"
    echo "   export DATABASE_URL='your-connection-string'"
    echo "   ./fix-database.sh"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo ""
    echo "Install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    exit 1
fi

echo "✅ psql found"
echo ""

# Apply the SQL fix script
echo "📝 Applying database fixes..."
echo ""

psql "$DATABASE_URL" -f fix-database-constraints.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database constraints fixed successfully!"
    echo ""
    echo "📌 Next steps:"
    echo "  1. Redeploy your Railway app to use the updated code"
    echo "  2. Monitor logs for any remaining errors"
    echo ""
else
    echo ""
    echo "❌ Failed to apply database fixes"
    echo ""
    echo "Common issues:"
    echo "  - Check if DATABASE_URL is correct"
    echo "  - Verify SSL/TLS connection settings"
    echo "  - Ensure database is accessible"
    echo ""
    exit 1
fi
