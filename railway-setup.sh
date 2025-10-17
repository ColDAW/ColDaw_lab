#!/bin/bash

# Railway 部署快速设置脚本

echo "🚀 ColDAW Railway 部署设置"
echo "=============================="

echo "📋 检查清单："
echo "□ 1. Railway 项目已创建"
echo "□ 2. PostgreSQL 数据库服务已添加"  
echo "□ 3. Redis 服务已添加"
echo "□ 4. GitHub 仓库已连接"
echo "□ 5. 邮箱 SMTP 配置已准备"

echo ""
echo "🔧 必要的环境变量："
echo "DATABASE_URL - (Railway 自动提供)"
echo "REDIS_URL - (Railway 自动提供)"
echo "JWT_SECRET - 请设置强密码"
echo "SMTP_HOST - 邮箱服务器地址"
echo "SMTP_PORT - 邮箱服务器端口"
echo "SMTP_SECURE - true/false"
echo "SMTP_USER - 邮箱账户"
echo "SMTP_PASS - 邮箱密码或应用专用密码"
echo "NODE_ENV - production"

echo ""
echo "📧 常用邮箱 SMTP 配置："
echo "Gmail:"
echo "  SMTP_HOST=smtp.gmail.com"
echo "  SMTP_PORT=587"
echo "  SMTP_SECURE=false"

echo ""
echo "QQ邮箱:"  
echo "  SMTP_HOST=smtp.qq.com"
echo "  SMTP_PORT=587"
echo "  SMTP_SECURE=false"

echo ""
echo "163邮箱:"
echo "  SMTP_HOST=smtp.163.com"
echo "  SMTP_PORT=587" 
echo "  SMTP_SECURE=false"

echo ""
echo "✅ 部署完成后测试："
echo "1. 访问 https://your-app.railway.app/api/health"
echo "2. 检查服务状态是否为 healthy"
echo "3. 测试用户注册功能"
echo "4. 验证邮件接收"

echo ""
echo "📖 详细说明请查看 RAILWAY_DEPLOY_GUIDE.md"