#!/bin/bash

# ColDaw VST3 Plugin Build Script
# This script automates the build process for the ColDaw Export plugin

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   ColDaw Export Plugin Build Script   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
JUCE_PATH="${JUCE_PATH:-$PROJECT_ROOT/JUCE}"
BUILD_DIR="$SCRIPT_DIR/build"
BUILD_TYPE="${BUILD_TYPE:-Release}"

echo "📁 Project directory: $SCRIPT_DIR"
echo "📁 JUCE path: $JUCE_PATH"
echo "📁 Build directory: $BUILD_DIR"
echo "🔧 Build type: $BUILD_TYPE"
echo ""

# Check if JUCE exists
if [ ! -d "$JUCE_PATH" ]; then
    echo -e "${RED}✗ JUCE not found at: $JUCE_PATH${NC}"
    echo ""
    echo "Please install JUCE:"
    echo "  cd $PROJECT_ROOT"
    echo "  git clone https://github.com/juce-framework/JUCE.git"
    echo ""
    echo "Or set JUCE_PATH environment variable:"
    echo "  export JUCE_PATH=/path/to/JUCE"
    exit 1
fi

if [ ! -f "$JUCE_PATH/modules/juce_core/juce_core.h" ]; then
    echo -e "${RED}✗ Invalid JUCE installation at: $JUCE_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ JUCE found${NC}"

# Check for CMake
if ! command -v cmake &> /dev/null; then
    echo -e "${RED}✗ CMake not found${NC}"
    echo "Please install CMake: brew install cmake"
    exit 1
fi

echo -e "${GREEN}✓ CMake found${NC}"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Darwin*)
        echo -e "${GREEN}✓ Platform: macOS${NC}"
        ;;
    Linux*)
        echo -e "${GREEN}✓ Platform: Linux${NC}"
        # Check for required packages on Linux
        if ! dpkg -l | grep -q libasound2-dev; then
            echo -e "${YELLOW}⚠ Missing dependencies. Installing...${NC}"
            sudo apt-get update
            sudo apt-get install -y libasound2-dev libcurl4-openssl-dev \
                libfreetype6-dev libx11-dev libxcomposite-dev libxcursor-dev \
                libxinerama-dev libxrandr-dev libxrender-dev
        fi
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo -e "${GREEN}✓ Platform: Windows${NC}"
        ;;
    *)
        echo -e "${YELLOW}⚠ Unknown platform: $OS${NC}"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create build directory
echo "📦 Creating build directory..."
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Configure with CMake
echo "⚙️  Configuring CMake..."
cmake .. -DJUCE_PATH="$JUCE_PATH" -DCMAKE_BUILD_TYPE="$BUILD_TYPE"

echo ""
echo "🔨 Building plugin..."
cmake --build . --config "$BUILD_TYPE" -j$(sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 4)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo ""
    
    # Show plugin locations
    case "$OS" in
        Darwin*)
            VST3_PATH="$HOME/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3"
            AU_PATH="$HOME/Library/Audio/Plug-Ins/Components/ColDaw Export.component"
            
            if [ -d "$VST3_PATH" ]; then
                echo -e "${GREEN}✓ VST3 installed:${NC} $VST3_PATH"
            fi
            if [ -d "$AU_PATH" ]; then
                echo -e "${GREEN}✓ AU installed:${NC} $AU_PATH"
            fi
            ;;
        Linux*)
            VST3_PATH="$HOME/.vst3/ColDaw Export.vst3"
            if [ -d "$VST3_PATH" ]; then
                echo -e "${GREEN}✓ VST3 installed:${NC} $VST3_PATH"
            fi
            ;;
    esac
    
    echo ""
    echo "📝 Next steps:"
    echo "  1. Start ColDaw server:"
    echo "     cd $PROJECT_ROOT/server && npm run dev"
    echo ""
    echo "  2. Start ColDaw client:"
    echo "     cd $PROJECT_ROOT/client && npm run dev"
    echo ""
    echo "  3. Open Ableton Live and rescan plugins"
    echo "  4. Add 'ColDaw Export' to any track"
    echo ""
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
