#!/bin/bash

# ColDaw VST Plugin - 快速重新编译脚本
# 用于修复登录问题后重新编译插件

set -e  # 遇到错误立即退出

echo "🔧 ColDaw VST Plugin - 重新编译"
echo "================================"
echo ""

# 检查 JUCE 是否存在
JUCE_PATH="../JUCE"
if [ ! -d "$JUCE_PATH" ]; then
    echo "❌ 错误: JUCE 框架未找到"
    echo "   预期位置: $JUCE_PATH"
    echo ""
    echo "请先安装 JUCE:"
    echo "  cd /Users/yifan/Documents/WebD/ColDaw"
    echo "  git clone https://github.com/juce-framework/JUCE.git"
    exit 1
fi

echo "✅ JUCE 框架找到"
echo ""

# 进入构建目录
cd "$(dirname "$0")"

if [ ! -d "build" ]; then
    echo "📁 创建 build 目录..."
    mkdir build
fi

cd build

# 配置 CMake（如果需要）
if [ ! -f "CMakeCache.txt" ]; then
    echo "⚙️  配置 CMake..."
    cmake .. -DJUCE_PATH=../../JUCE
    echo ""
fi

# 编译
echo "🔨 编译插件..."
cmake --build . --config Release

echo ""
echo "================================"
echo "✅ 编译完成！"
echo ""
echo "插件已安装到:"
echo "  VST3: ~/Library/Audio/Plug-Ins/VST3/ColDaw Export.vst3"
echo "  AU:   ~/Library/Audio/Plug-Ins/Components/ColDaw Export.component"
echo ""
echo "📝 下一步:"
echo "  1. 重启你的 DAW 或重新扫描插件"
echo "  2. 确保 ColDaw 服务器正在运行:"
echo "     cd /Users/yifan/Documents/WebD/ColDaw && ./start-services.sh"
echo "  3. 在 DAW 中加载 'ColDaw Export' 插件"
echo "  4. 使用测试账号登录:"
echo "     Email: demo@coldaw.com"
echo "     Password: demo123"
echo ""
echo "🎉 准备好测试了！"
