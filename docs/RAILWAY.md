# Railway Deployment

## ⚠️ IMPORTANT: Persistent Storage Required

Railway containers are **ephemeral** - they reset on every deployment. To prevent losing user projects and uploads, you **MUST** configure persistent storage.

### Quick Setup (Railway Volumes)

1. **In Railway Dashboard:**
   - Go to your service → Settings → Volumes
   - Click "New Volume"
   - Mount Path: `/app/data`
   - Size: 10GB (adjust as needed)

2. **Add Environment Variable:**
   ```env
   DATA_DIR=/app/data
   ```

3. **Deploy** - your data will now persist across deployments!

**See [PERSISTENT_STORAGE.md](./PERSISTENT_STORAGE.md) for detailed setup and S3 migration guide.**

---

## Setup

1. **Create Account**: https://railway.app
2. **New Project**: Deploy from GitHub repo
3. Railway auto-detects monorepo (client + server)

## Services Configuration

### Server Service

**Environment Variables**:
```env
DATABASE_URL=postgresql://...    # Auto-provided by Railway
REDIS_URL=redis://...            # Auto-provided by Railway
DATA_DIR=/app/data               # Required for persistent storage!
JWT_SECRET=your_secret_key
ZOHO_API_KEY=Zoho-enczapikey_token
ZOHO_FROM_EMAIL=noreply@yourdomain.com
PORT=3001
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

**Build**: Auto-detected from `server/package.json`
```bash
cd server && npm install && npm run build
```

**Start**: 
```bash
cd server && npm start
```

### Client Service

**Environment Variables**:
```env
VITE_API_URL=https://your-server.railway.app
VITE_WS_URL=wss://your-server.railway.app
```

**Build**:
```bash
cd client && npm install && npm run build
```

**Start**:
```bash
cd client && npx serve -s dist -p $PORT
```

### Database Services

Railway auto-provisions:
- **PostgreSQL**: `DATABASE_URL` provided automatically
- **Redis**: `REDIS_URL` provided automatically

## Deployment

**Automatic** (recommended):
```bash
git push origin main
# Railway auto-deploys
```

**Manual** (using Railway CLI):
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## Custom Domain

1. Railway Dashboard → Settings → Domains
2. Add domain: `coldaw.com`
3. Add DNS record:
   ```
   CNAME: www → your-service.railway.app
   ```
4. SSL auto-provisioned (5-10 minutes)

## Monitoring

**View Logs**:
```bash
railway logs --follow
railway logs --service server --follow
```

**Metrics**: Available in Railway dashboard
- CPU usage
- Memory usage
- Network bandwidth
- Build times

## Database Migrations

```bash
# Connect to Railway project
railway link

# Run migrations
railway run npm run db:migrate

# Or connect directly
railway connect postgres
\dt  # List tables
```

## Troubleshooting

**Build fails**:
- Check `package.json` scripts
- Verify Node version: Add `"engines": {"node": "18.x"}`
- Clear cache: Redeploy

**Database connection fails**:
- Check `DATABASE_URL` format
- Verify PostgreSQL service is running
- Test connection: `railway connect postgres`

**Environment variables not working**:
- Verify variables set in Railway dashboard
- Check variable names match code
- Redeploy after adding variables

**CORS errors**:
- Set `CLIENT_URL` in server env
- Add CORS middleware in Express

## Scaling

**Vertical scaling**: Settings → Resources
- Memory: 512MB - 8GB
- CPU: Shared or dedicated

**Horizontal scaling**:
```bash
railway scale --replicas 3
```

## Cost Optimization

- **Free tier**: $5 credit/month
- **Tips**:
  - Use staging branches to reduce builds
  - Enable auto-sleep for unused services
  - Monitor usage in dashboard

## Backup

**Database**:
```bash
# Export
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

**Environment variables**:
```bash
railway variables > .env.backup
```
