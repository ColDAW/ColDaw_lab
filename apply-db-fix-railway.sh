#!/bin/bash

# Apply Database Fix to Railway PostgreSQL
# This script uses Railway's DATABASE_URL to connect and apply the migration

set -e

echo "🔧 Applying Database Fix to Railway PostgreSQL"
echo "=============================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g @railway/cli"
    echo ""
    exit 1
fi

echo "✅ Railway CLI detected"
echo ""

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Logging in to Railway..."
    railway login
fi

echo "✅ Logged in to Railway"
echo ""

# Check if project is linked
if ! railway status &> /dev/null; then
    echo "🔗 Linking to Railway project..."
    railway link
fi

echo "✅ Project linked"
echo ""

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
echo "🔍 Getting database connection info..."
echo ""

# Get the DATABASE_URL from Railway
DB_URL=$(railway variables get DATABASE_URL 2>/dev/null)

if [ -z "$DB_URL" ]; then
    echo "❌ Could not get DATABASE_URL from Railway"
    echo ""
    echo "Please try one of these alternatives:"
    echo ""
    echo "1. Use Railway Web Console:"
    echo "   - Go to your Railway dashboard"
    echo "   - Open your PostgreSQL service"
    echo "   - Click 'Data' or 'Query' tab"
    echo "   - Copy and paste the contents of fix-foreign-keys-cascade.sql"
    echo ""
    echo "2. Get DATABASE_URL manually:"
    echo "   railway variables"
    echo "   Then run:"
    echo "   psql \"\$DATABASE_URL\" < fix-foreign-keys-cascade.sql"
    echo ""
    exit 1
fi

echo "✅ Database URL retrieved"
echo ""
echo "🚀 Applying migration script..."
echo ""

# Apply the migration using psql with the DATABASE_URL
if psql "$DB_URL" < fix-foreign-keys-cascade.sql; then
    echo ""
    echo "✅ Database migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. The foreign key constraints have been updated"
    echo "2. Restart your Railway services if needed:"
    echo "   railway restart"
    echo ""
    echo "3. Test the fixes:"
    echo "   - Open your application"
    echo "   - Delete a project (should work now)"
    echo "   - Check project names and dates display correctly"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Alternative method - Use Railway Web Console:"
    echo "1. Go to https://railway.app/dashboard"
    echo "2. Select your project and PostgreSQL service"
    echo "3. Click 'Data' or 'Query' tab"
    echo "4. Copy the contents of fix-foreign-keys-cascade.sql"
    echo "5. Paste and execute in the web console"
    echo ""
    exit 1
fi
