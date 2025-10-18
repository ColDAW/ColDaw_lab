// 测试SMTP配置的脚本
const nodemailer = require('nodemailer');

console.log('🔍 当前SMTP配置检查：');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 'NOT SET');

async function testSMTPConnection() {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    console.log('\n🔗 尝试连接SMTP服务器...');
    
    // 设置更长的超时时间进行验证
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('验证超时 (30秒)')), 30000);
    });

    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✅ SMTP连接成功！');
    
    // 尝试发送测试邮件
    console.log('\n📧 发送测试邮件...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // 发送给自己
      subject: 'Railway SMTP 测试',
      text: '这是一封来自Railway部署的测试邮件，如果您收到这封邮件，说明SMTP配置成功！',
      html: '<h1>SMTP测试成功</h1><p>Railway部署的邮件服务工作正常！</p>'
    });
    
    console.log('✅ 测试邮件发送成功！');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ SMTP测试失败:', error.message);
    console.error('错误代码:', error.code);
    
    // 提供具体的错误解决建议
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 解决建议: 连接超时');
      console.log('1. 检查网络连接');
      console.log('2. 尝试使用不同的端口 (465 with SSL)');
      console.log('3. 检查防火墙设置');
    } else if (error.code === 'EAUTH') {
      console.log('\n🔧 解决建议: 认证失败');
      console.log('1. 检查用户名和密码是否正确');
      console.log('2. 如果启用了2FA，使用应用专用密码');
      console.log('3. 检查Zoho账户状态');
    } else if (error.message.includes('验证超时')) {
      console.log('\n🔧 解决建议: 验证超时');
      console.log('1. Railway服务器可能无法访问Zoho SMTP');
      console.log('2. 尝试使用不同的SMTP服务提供商');
      console.log('3. 联系Railway支持检查网络限制');
    }
  }
}

testSMTPConnection();