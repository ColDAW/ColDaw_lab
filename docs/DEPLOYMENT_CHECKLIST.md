# 🚀 Railway Deployment Checklist - Fix Data Loss Issue

## Problem Fixed
✅ **User projects and uploads no longer lost on deployments**

The code now uses a configurable `DATA_DIR` environment variable that can point to persistent storage instead of the ephemeral container filesystem.

---

## Immediate Action Required

### Step 1: Create Railway Volume (5 minutes)

1. Go to Railway Dashboard → Your Service
2. Click **Settings** → **Volumes**
3. Click **New Volume**
4. Configure:
   - **Mount Path**: `/app/data`
   - **Size**: 10GB (start small, can increase later)
5. Click **Create**

### Step 2: Add Environment Variable

1. In Railway Dashboard → **Variables** tab
2. Add new variable:
   ```
   DATA_DIR=/app/data
   ```
3. Click **Add**

### Step 3: Deploy

1. Commit and push your code changes:
   ```bash
   git add .
   git commit -m "Add persistent storage support for user data"
   git push origin main
   ```

2. Railway will auto-deploy

3. Verify in logs:
   ```
   📁 Data directory: /app/data
   📤 Upload directory: /app/data/uploads
   📦 Projects directory: /app/data/projects
   ✅ Created uploads directory
   ✅ Created projects directory
   ```

---

## Verification

After deployment, test that data persists:

```bash
# Deploy current version
railway deploy

# Create a test file
railway run touch /app/data/test-persistence.txt

# Deploy a new version (e.g., change package.json version)
railway deploy

# Check if file still exists
railway run ls /app/data
# Should show: test-persistence.txt
```

If `test-persistence.txt` still exists after the second deployment, **persistence is working!**

---

## Cost

**Railway Volumes**: ~$0.25/GB/month
- 10GB volume = **$2.50/month**
- 50GB volume = **$12.50/month**

This is in addition to your normal Railway usage.

---

## Migration (If You Have Existing Data)

If you already have projects on the current deployment:

### Option A: Manual Backup Before Next Deploy

```bash
# SSH into current container
railway run bash

# Create backup
tar -czf /tmp/backup.tar.gz /app/projects /app/uploads

# Download to local
railway run cat /tmp/backup.tar.gz > local-backup.tar.gz
```

Then after setting up volume and deploying:

```bash
# Upload backup
cat local-backup.tar.gz | railway run 'cat > /tmp/backup.tar.gz'

# Extract to volume
railway run 'cd /app/data && tar -xzf /tmp/backup.tar.gz --strip-components=2'
```

### Option B: Accept Data Loss (If Testing/Development)

If you don't have important user data yet, you can skip migration and start fresh with persistent storage.

---

## What Was Changed

### Code Updates

1. **server/src/index.ts**
   - Added `DATA_DIR` environment variable support
   - Enhanced logging to show data directory paths
   - Defaults to local directories in development

2. **server/src/routes/project.ts**
   - Updated all file paths to use `DATA_DIR`
   - Maintains backward compatibility for local development

3. **server/src/routes/version.ts**
   - Updated all file paths to use `DATA_DIR`
   - Consistent with project routes

### Documentation

1. **docs/PERSISTENT_STORAGE.md** (NEW)
   - Complete guide for Railway Volumes setup
   - S3 migration path for production scaling
   - Cost comparison and backup strategies

2. **docs/RAILWAY.md** (UPDATED)
   - Added warning about ephemeral storage
   - Quick setup instructions
   - Environment variable documentation

---

## Next Steps (Optional)

### For Production Scale:

See [PERSISTENT_STORAGE.md](./PERSISTENT_STORAGE.md) for migrating to AWS S3 or other cloud storage:

**Benefits of S3:**
- Unlimited scalability
- Better cost ($0.023/GB vs $0.25/GB)
- Multi-region support
- Built-in redundancy
- CDN integration

**When to migrate:**
- Storage needs > 100GB
- Multiple regions needed
- Budget optimization
- High availability requirements

---

## Troubleshooting

### Volume not mounting?
```bash
railway run ls -la /app
# Should show 'data' directory
```

### Environment variable not working?
```bash
railway run env | grep DATA_DIR
# Should show: DATA_DIR=/app/data
```

### Old data still being used?
```bash
railway run ls -la /app/projects
# Should be empty or symlink to /app/data/projects
```

### Need to increase volume size?
- Railway Dashboard → Volumes → Click volume → Change size
- No downtime required

---

## Support

If issues persist:
1. Check Railway logs: `railway logs --follow`
2. Verify volume is mounted: `railway run df -h`
3. Check permissions: `railway run ls -la /app/data`

---

**✅ Once completed, your user projects will persist across all future deployments!**
