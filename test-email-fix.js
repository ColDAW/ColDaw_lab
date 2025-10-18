// Railway邮件服务测试脚本
// 使用方法: node test-email-fix.js

require('dotenv').config();

// 测试Mailgun API配置
async function testMailgunAPI() {
  console.log('🧪 Testing Mailgun API configuration...');
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  
  if (!apiKey || !domain) {
    console.log('❌ Mailgun API配置缺失:');
    console.log('MAILGUN_API_KEY:', apiKey ? '✅ SET' : '❌ NOT SET');
    console.log('MAILGUN_DOMAIN:', domain ? '✅ SET' : '❌ NOT SET');
    return false;
  }
  
  console.log('✅ Mailgun API配置完整');
  console.log('Domain:', domain);
  console.log('API Key:', `${apiKey.substring(0, 8)}...`);
  
  // 测试API连接
  try {
    const baseUrl = 'https://api.mailgun.net/v3';
    const url = `${baseUrl}/${domain}/messages`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`
      }
    });
    
    if (response.status === 401) {
      console.log('❌ Mailgun API密钥无效');
      return false;
    }
    
    console.log('✅ Mailgun API连接测试成功');
    return true;
  } catch (error) {
    console.log('❌ Mailgun API连接失败:', error.message);
    return false;
  }
}

// 测试SMTP配置
function testSMTPConfig() {
  console.log('🧪 Testing SMTP configuration...');
  
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const config = {};
  let allSet = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    config[varName] = value;
    console.log(`${varName}:`, value ? '✅ SET' : '❌ NOT SET');
    if (!value) allSet = false;
  });
  
  if (allSet) {
    console.log('✅ SMTP配置完整');
    console.log('推荐端口: 2525 (当前:', config.SMTP_PORT, ')');
    if (config.SMTP_PORT !== '2525') {
      console.log('💡 建议修改SMTP_PORT为2525以提高Railway兼容性');
    }
  } else {
    console.log('❌ SMTP配置不完整');
  }
  
  return allSet;
}

// 主测试函数
async function runTests() {
  console.log('🚀 Railway邮件服务配置测试\n');
  
  // 检查环境
  console.log('📍 环境信息:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('Platform: Railway\n');
  
  // 测试Mailgun API
  const mailgunOK = await testMailgunAPI();
  console.log('');
  
  // 测试SMTP
  const smtpOK = testSMTPConfig();
  console.log('');
  
  // 推荐方案
  console.log('💡 推荐配置:');
  if (mailgunOK) {
    console.log('✅ Mailgun API已配置 - 推荐使用此方案（最稳定）');
  } else {
    console.log('❌ Mailgun API未配置 - 建议配置以获得最佳兼容性');
  }
  
  if (smtpOK) {
    console.log('✅ SMTP已配置 - 可作为后备方案');
  } else {
    console.log('❌ SMTP未配置 - 需要配置作为后备');
  }
  
  console.log('\n📋 下一步操作:');
  if (!mailgunOK) {
    console.log('1. 获取Mailgun API密钥');
    console.log('2. 在Railway中设置MAILGUN_API_KEY和MAILGUN_DOMAIN');
  }
  if (smtpOK && process.env.SMTP_PORT !== '2525') {
    console.log('3. 将SMTP_PORT修改为2525');
  }
  console.log('4. 重新部署应用');
  console.log('5. 测试邮件发送功能');
}

// 运行测试
runTests().catch(console.error);