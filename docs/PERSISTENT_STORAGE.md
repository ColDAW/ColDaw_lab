# Persistent Storage Solution for Railway Deployment

## Problem

Your projects and uploads are currently stored in the container's local filesystem (`/app/projects` and `/app/uploads`). Railway containers are **ephemeral** - they get completely recreated on every deployment, causing all user data to be lost.

## Solution Options

### Option 1: Railway Volumes (Recommended for Railway)

Railway supports persistent volumes that survive deployments.

**Setup:**

1. **In Railway Dashboard:**
   - Go to your service → Settings → Volumes
   - Add a new volume:
     - Mount Path: `/app/data`
     - Size: Start with 10GB (can scale up)

2. **Update Code to Use Volume:**

```typescript
// server/src/index.ts
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const uploadDir = path.join(DATA_DIR, 'uploads');
const projectsDir = path.join(DATA_DIR, 'projects');
```

3. **Set Environment Variable:**
```env
DATA_DIR=/app/data
```

**Pros:**
- Simple setup
- Good performance (fast local disk)
- Automatic backups available

**Cons:**
- Volume is tied to single instance (no multi-region)
- Need to manually backup/migrate volumes

---

### Option 2: AWS S3 / Cloud Storage (Recommended for Production)

Store files in cloud object storage (AWS S3, Google Cloud Storage, Cloudflare R2).

**Benefits:**
- Unlimited scalability
- Multi-region support
- Built-in redundancy
- Never lose data on deployments
- Can use CDN for fast downloads

**Implementation:**

1. **Install AWS SDK:**
```bash
cd server
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage multer-s3
```

2. **Create S3 Service:**

```typescript
// server/src/services/s3.ts
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multerS3 from 'multer-s3';
import multer from 'multer';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'coldaw-storage';

// Multer S3 storage
export const uploadMiddleware = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, `uploads/${uniqueName}`);
    },
  }),
});

// Upload file to S3
export async function uploadToS3(
  fileBuffer: Buffer,
  key: string,
  contentType?: string
): Promise<string> {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    },
  });

  await upload.done();
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

// Get signed URL for download
export async function getSignedUrl(key: string): Promise<string> {
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export { s3Client, BUCKET_NAME };
```

3. **Environment Variables:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=coldaw-storage
```

4. **Update Upload Routes:**

```typescript
// server/src/routes/project.ts
import { uploadToS3, getSignedUrl } from '../services/s3';

// Save project file to S3
const projectKey = `projects/${projectId}/${versionId}.als`;
await uploadToS3(fileBuffer, projectKey, 'application/octet-stream');

// When downloading
const downloadUrl = await getSignedUrl(projectKey);
res.redirect(downloadUrl);
```

---

### Option 3: Database Storage (For Small Files)

Store files as BLOBs in PostgreSQL (not recommended for large .als files).

**Only suitable for:**
- Small files (< 1MB)
- Metadata/thumbnails
- Quick prototyping

**Not recommended for:**
- Full project files (can be 50-500MB)
- Scalability concerns

---

## Recommended Implementation Path

### Phase 1: Immediate Fix (Railway Volumes)
1. Add Railway volume
2. Update paths to use volume
3. Test deployment

### Phase 2: Production Ready (S3)
1. Set up AWS S3 bucket
2. Implement S3 service
3. Migrate existing files
4. Update all upload/download logic

## Migration Steps

### For Railway Volumes:

1. **Backup Current Data** (if any exists):
```bash
railway run tar -czf backup.tar.gz projects uploads
railway run cat backup.tar.gz > local-backup.tar.gz
```

2. **Create Volume** in Railway Dashboard

3. **Update Environment Variables:**
```env
DATA_DIR=/app/data
```

4. **Deploy New Version** - volume will persist across deployments

### For S3 Migration:

1. **Create S3 Bucket:**
```bash
aws s3 mb s3://coldaw-storage
aws s3api put-bucket-versioning --bucket coldaw-storage --versioning-configuration Status=Enabled
```

2. **Upload Existing Files:**
```bash
aws s3 sync ./server/projects s3://coldaw-storage/projects/
aws s3 sync ./server/uploads s3://coldaw-storage/uploads/
```

3. **Update Code** to use S3 service

4. **Deploy** - files now in cloud storage

## Cost Comparison

### Railway Volumes
- **Cost**: ~$0.25/GB/month
- **10GB**: $2.50/month
- **100GB**: $25/month

### AWS S3
- **Storage**: $0.023/GB/month
- **Requests**: $0.005 per 1,000 PUT, $0.0004 per 1,000 GET
- **10GB**: ~$0.25/month + requests
- **100GB**: ~$2.30/month + requests

**S3 is more cost-effective at scale!**

## Testing

```bash
# Test volume persistence
railway run touch /app/data/test.txt
railway run ls /app/data  # Should show test.txt
# Deploy new version
railway run ls /app/data  # Should still show test.txt

# Test S3
railway run node -e "require('./dist/services/s3').uploadToS3(Buffer.from('test'), 'test.txt')"
```

## Backup Strategy

### Railway Volumes:
```bash
# Scheduled backup (use Railway cron or external service)
railway run tar -czf backup-$(date +%Y%m%d).tar.gz /app/data
```

### S3:
```bash
# S3 has built-in versioning and cross-region replication
aws s3api put-bucket-versioning --bucket coldaw-storage --versioning-configuration Status=Enabled
```

## Next Steps

1. **Immediate**: Implement Railway Volumes (10-15 minutes)
2. **This week**: Set up S3 bucket and test
3. **Next sprint**: Full S3 migration for production scalability
