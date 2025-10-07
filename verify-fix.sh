#!/bin/bash

# ============================================
# Verify Database Fix Script
# ============================================
# This script verifies that the database fixes have been applied correctly

set -e

echo "🔍 Verifying Database Fixes..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  railway run bash verify-fix.sh"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    exit 1
fi

echo "✅ psql found"
echo ""

# Run verification queries
echo "📊 Running verification queries..."
echo ""

# Check 1: System users exist
echo "1️⃣ Checking system users..."
SYSTEM_USERS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE id IN ('vst-plugin-system', 'anonymous-system');")
SYSTEM_USERS=$(echo $SYSTEM_USERS | xargs)

if [ "$SYSTEM_USERS" -eq 2 ]; then
    echo "✅ System users exist (vst-plugin-system, anonymous-system)"
else
    echo "❌ System users missing! Found: $SYSTEM_USERS, Expected: 2"
    exit 1
fi

# Check 2: No NULL created_by in branches
echo ""
echo "2️⃣ Checking branches for NULL created_by..."
NULL_BRANCHES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM branches WHERE created_by IS NULL;")
NULL_BRANCHES=$(echo $NULL_BRANCHES | xargs)

if [ "$NULL_BRANCHES" -eq 0 ]; then
    echo "✅ No NULL created_by values in branches"
else
    echo "⚠️  Warning: Found $NULL_BRANCHES branches with NULL created_by"
fi

# Check 3: No invalid foreign keys in branches
echo ""
echo "3️⃣ Checking branches for invalid foreign keys..."
INVALID_BRANCHES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM branches b LEFT JOIN users u ON b.created_by = u.id WHERE u.id IS NULL;")
INVALID_BRANCHES=$(echo $INVALID_BRANCHES | xargs)

if [ "$INVALID_BRANCHES" -eq 0 ]; then
    echo "✅ All branches have valid created_by references"
else
    echo "❌ Found $INVALID_BRANCHES branches with invalid created_by"
    exit 1
fi

# Check 4: No invalid foreign keys in versions
echo ""
echo "4️⃣ Checking versions for invalid foreign keys..."
INVALID_VERSIONS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM versions v LEFT JOIN users u ON v.user_id = u.id WHERE u.id IS NULL;")
INVALID_VERSIONS=$(echo $INVALID_VERSIONS | xargs)

if [ "$INVALID_VERSIONS" -eq 0 ]; then
    echo "✅ All versions have valid user_id references"
else
    echo "❌ Found $INVALID_VERSIONS versions with invalid user_id"
    exit 1
fi

# Check 5: Display system users
echo ""
echo "5️⃣ System users details:"
psql "$DATABASE_URL" -c "SELECT id, username, email FROM users WHERE id IN ('vst-plugin-system', 'anonymous-system');"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All verification checks passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  • System users: $SYSTEM_USERS/2"
echo "  • NULL branches: $NULL_BRANCHES"
echo "  • Invalid branch refs: $INVALID_BRANCHES"
echo "  • Invalid version refs: $INVALID_VERSIONS"
echo ""
echo "🎉 Database is ready for deployment!"
