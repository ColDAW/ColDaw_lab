# ZeptoMail Documentation

## Setup

1. **Sign up**: https://www.zoho.com/zeptomail/
2. **Create Mail Agent**:
   - Go to "Mail Agents" → "Add Mail Agent"
   - Select "Send using REST API"
   - Name: "ColDaw Email Service"
3. **Get Token**:
   - Click on agent → "Send Mail Token"
   - Copy token (starts with `Zoho-enczapikey_`)

## Configuration

```env
# .env
ZOHO_API_KEY=Zoho-enczapikey_YOUR_TOKEN_HERE
ZOHO_FROM_EMAIL=noreply@yourdomain.com
```

## Implementation

```typescript
// services/email.ts
class EmailService {
  async sendVerificationEmail(to: string, code: string) {
    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ZOHO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: { address: process.env.ZOHO_FROM_EMAIL },
        to: [{ email_address: { address: to } }],
        subject: 'Verify Your Email - ColDaw',
        htmlbody: `<p>Your verification code: <strong>${code}</strong></p>`
      })
    });
    
    if (!response.ok) throw new Error('Email send failed');
  }
}
```

## Usage

```typescript
// Registration flow
const code = Math.floor(100000 + Math.random() * 900000).toString();

// Store in Redis (10 min expiration)
await redis.set(`verification:${email}`, code, 'EX', 600);

// Send email
await emailService.sendVerificationEmail(email, code);
```

## Domain Verification (Optional)

For production, verify your domain for better deliverability:

1. Go to "Domains" → "Add Domain"
2. Enter your domain
3. Add DNS records:
   ```
   TXT: zoho-verification=...
   SPF: v=spf1 include:zeptomail.com ~all
   DKIM: (provided by ZeptoMail)
   ```
4. Wait for verification (24-48 hours)

## Troubleshooting

**401 Unauthorized**: 
- Check token starts with `Zoho-enczapikey_`
- Regenerate token in console

**403 From address not verified**:
- Add domain in ZeptoMail
- Complete domain verification
- Use verified email in `ZOHO_FROM_EMAIL`

**Email not received**:
- Check spam folder
- Verify email address format
- Check ZeptoMail logs: Reports → Sent Log

**Rate limiting**:
- Implement cooldown between sends
- Free tier: 10,000 emails/month
- Upgrade plan if needed

## Testing

```bash
curl -X POST https://api.zeptomail.com/v1.1/email \
  -H "Authorization: Zoho-enczapikey_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": {"address": "noreply@yourdomain.com"},
    "to": [{"email_address": {"address": "test@example.com"}}],
    "subject": "Test",
    "htmlbody": "<p>Test email</p>"
  }'
```
