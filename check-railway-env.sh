#!/bin/bash

echo "🔍 检查 Railway 环境变量设置"
echo "=================================="

echo ""
echo "请确认在 Railway 项目中设置了以下环境变量："
echo ""
echo "必需的环境变量："
echo "SMTP_HOST=smtp.zoho.com"
echo "SMTP_PORT=465"
echo "SMTP_SECURE=true"
echo "SMTP_USER=joe.deng@coldaw.app"
echo "SMTP_PASS=YKRuZF1TCbkR"
echo ""

echo "可选的环境变量："
echo "FROM_EMAIL=\"ColDAW <joe.deng@coldaw.app>\""
echo "NODE_ENV=production"
echo ""

echo "📋 Railway 设置步骤："
echo "1. 访问 Railway 控制台: https://railway.app"
echo "2. 选择您的 ColDAW 项目"
echo "3. 点击 'Variables' 标签"
echo "4. 添加上述环境变量"
echo "5. 保存后 Railway 会自动重新部署"
echo ""

echo "🔬 验证步骤："
echo "1. 部署完成后查看日志"
echo "2. 查找 '🔍 Email service initialization' 日志"
echo "3. 确认所有环境变量都显示为 'SET'"
echo ""

echo "🚨 注意事项："
echo "- SMTP_SECURE=true (因为使用 465 端口)"
echo "- 确保没有多余的空格或引号"
echo "- Railway 环境变量区分大小写"