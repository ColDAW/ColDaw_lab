#!/bin/bash

# ColDaw Server Startup Script
# This script starts both the backend server and frontend client

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
CLIENT_DIR="$SCRIPT_DIR/client"

echo "╔════════════════════════════════════════╗"
echo "║        ColDaw Server Launcher          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if server directory exists
if [ ! -d "$SERVER_DIR" ]; then
    echo "❌ Error: Server directory not found: $SERVER_DIR"
    exit 1
fi

# Check if client directory exists
if [ ! -d "$CLIENT_DIR" ]; then
    echo "❌ Error: Client directory not found: $CLIENT_DIR"
    exit 1
fi

# Function to start server
start_server() {
    echo "🚀 Starting backend server..."
    cd "$SERVER_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing server dependencies..."
        npm install
    fi
    
    # Start server in background
    npm run dev > /tmp/coldaw-server.log 2>&1 &
    SERVER_PID=$!
    echo "✅ Server started (PID: $SERVER_PID)"
    echo "📝 Server logs: tail -f /tmp/coldaw-server.log"
}

# Function to start client
start_client() {
    echo "🎨 Starting frontend client..."
    cd "$CLIENT_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing client dependencies..."
        npm install
    fi
    
    # Start client in background
    npm run dev > /tmp/coldaw-client.log 2>&1 &
    CLIENT_PID=$!
    echo "✅ Client started (PID: $CLIENT_PID)"
    echo "📝 Client logs: tail -f /tmp/coldaw-client.log"
}

# Parse command line arguments
MODE="${1:-both}"

case "$MODE" in
    server)
        start_server
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Backend server is running on http://localhost:3001"
        echo "📝 View logs: tail -f /tmp/coldaw-server.log"
        echo ""
        echo "To stop: kill $SERVER_PID"
        ;;
    client)
        start_client
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Frontend client is running on http://localhost:5173"
        echo "📝 View logs: tail -f /tmp/coldaw-client.log"
        echo ""
        echo "To stop: kill $CLIENT_PID"
        ;;
    both|*)
        start_server
        sleep 2
        start_client
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ ColDaw is now running!"
        echo ""
        echo "📍 Backend:  http://localhost:3001"
        echo "📍 Frontend: http://localhost:5173"
        echo ""
        echo "📝 Server logs: tail -f /tmp/coldaw-server.log"
        echo "📝 Client logs: tail -f /tmp/coldaw-client.log"
        echo ""
        echo "🔐 Demo Login Credentials:"
        echo "   Email: demo@coldaw.com"
        echo "   Password: demo123"
        echo ""
        echo "To stop:"
        echo "  Server: kill $SERVER_PID"
        echo "  Client: kill $CLIENT_PID"
        echo "  Both:   kill $SERVER_PID $CLIENT_PID"
        ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
