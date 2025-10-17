#!/bin/bash

# 环境变量检查脚本
# 用于诊断 Railway 部署中的配置问题

echo "🔍 ColDAW Railway 环境变量检查"
echo "=================================="

# 检查必要的环境变量
check_env_var() {
    local var_name=$1
    local var_description=$2
    local is_required=${3:-true}
    
    if [ -n "${!var_name}" ]; then
        if [[ "$var_name" == *"PASS"* ]] || [[ "$var_name" == *"SECRET"* ]]; then
            echo "✅ $var_name: [HIDDEN] - $var_description"
        else
            echo "✅ $var_name: ${!var_name} - $var_description"
        fi
    else
        if [ "$is_required" = true ]; then
            echo "❌ $var_name: NOT SET - $var_description"
        else
            echo "⚠️  $var_name: NOT SET (Optional) - $var_description"
        fi
    fi
}

echo ""
echo "📊 数据库配置:"
check_env_var "DATABASE_URL" "PostgreSQL 数据库连接"

echo ""
echo "🔴 Redis 配置:"
check_env_var "REDIS_URL" "Redis 连接 (主要)"
check_env_var "REDISCLOUD_URL" "Redis 连接 (备用)" false

echo ""
echo "📧 邮箱 SMTP 配置:"
check_env_var "SMTP_HOST" "SMTP 服务器地址"
check_env_var "SMTP_PORT" "SMTP 端口"
check_env_var "SMTP_SECURE" "是否使用 SSL/TLS" false
check_env_var "SMTP_USER" "SMTP 用户名"
check_env_var "SMTP_PASS" "SMTP 密码"

echo ""
echo "🔐 安全配置:"
check_env_var "JWT_SECRET" "JWT 密钥"
check_env_var "NODE_ENV" "运行环境" false

echo ""
echo "🌐 应用配置:"
check_env_var "PORT" "应用端口" false
check_env_var "CLIENT_URL" "客户端 URL" false

echo ""
echo "💡 建议:"
echo "1. 如果 SMTP 连接超时，尝试使用 SendGrid 或 Mailgun"
echo "2. 确保 Gmail 使用应用专用密码，不是普通密码"
echo "3. 检查 Railway 服务日志获取详细错误信息"
echo "4. 可以暂时禁用邮件功能进行测试（不设置 SMTP_USER 和 SMTP_PASS）"

echo ""
echo "🔗 有用的链接:"
echo "- Gmail 应用专用密码: https://support.google.com/accounts/answer/185833"
echo "- SendGrid 注册: https://sendgrid.com/"
echo "- Mailgun 注册: https://www.mailgun.com/"