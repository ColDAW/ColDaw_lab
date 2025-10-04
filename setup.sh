#!/bin/bash

echo "🎵 ColDaw Setup Script"
echo "======================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

echo "✓ Server dependencies installed"
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

echo "✓ Client dependencies installed"
echo ""

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend server (in one terminal):"
echo "   cd server && npm run dev"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd client && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "🎸 Happy collaborating!"
