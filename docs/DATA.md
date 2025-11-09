# Data Documentation

## Data Flow

```
┌─────────┐  HTTP/WS   ┌────────┐
│ Client  │ ◄─────────► │ Server │
└─────────┘             └───┬────┘
                            ├──► PostgreSQL (persistent)
                            ├──► Redis (cache/sessions)
                            └──► File System (uploads)
```

## User Authentication

```typescript
// Registration
POST /api/auth/register { email, password, username }
→ Hash password with bcrypt
→ Store in PostgreSQL
→ Send verification email (6-digit code → Redis, TTL 10min)

// Login
POST /api/auth/login { email, password }
→ Verify password
→ Generate JWT token
→ Store session in Redis (TTL 7 days)
→ Return token to client

// Verification
POST /api/auth/verify-email { email, code }
→ Check code from Redis
→ Mark user.verified = true
→ Delete code from Redis
```

## Project Upload

```typescript
// Upload flow
1. Client: POST /api/projects/upload (FormData with .als file)
2. Server: Multer saves to ./uploads
3. Server: Parse XML → extract metadata (tempo, tracks, clips)
4. Server: Move to ./projects/{projectId}/
5. Server: Insert into PostgreSQL
6. Server: Return projectId

// Storage
PostgreSQL: { id, name, ownerId, filePath, metadata }
File System: ./projects/{id}/project.als
```

## Version Control

```typescript
// Commit
POST /api/projects/{id}/commit { message }
→ Snapshot current state → ./projects/{id}/snapshots/commit-{id}.json
→ Insert commit record → parent_commit_id links to previous
→ Update branch HEAD

// Branch
POST /api/projects/{id}/branch { name, sourceCommit }
→ Create branch pointing to sourceCommit
→ Can switch branches to load different snapshots

// Data structure
Commit: { id, projectId, message, authorId, parentCommitId, snapshotPath }
Branch: { id, name, projectId, headCommitId }
```

## Real-Time Collaboration

```typescript
// Join project
socket.emit('join-project', { projectId })
→ Server: socket.join(`project:${id}`)
→ Server: redis.sadd(`online:project:${id}`, userId)
→ Broadcast to room: 'user-joined'

// Send edit
socket.emit('project-update', { changes })
→ Server: Validate
→ Server: Broadcast to other users in room
→ Optional: Store in redis queue (pending edits)

// Cursor tracking (no storage)
socket.emit('cursor-move', { x, y })
→ Server: Broadcast to room (no DB/Redis)

// Leave
socket.disconnect
→ Server: redis.srem(`online:project:${id}`, userId)
→ Broadcast: 'user-left'
```

## Caching Strategy

```typescript
// Redis keys
session:{token}                  // JWT sessions (TTL: 7 days)
verification:{email}             // Email codes (TTL: 10 min)
online:project:{id}              // Set of user IDs (TTL: 1 hour)
ratelimit:{ip}:{endpoint}        // Request count (TTL: 1 min)
project:meta:{id}                // Project metadata (TTL: 1 hour)
```

## Database Queries

```sql
-- Get user projects
SELECT * FROM projects 
WHERE owner_id = $1 
ORDER BY updated_at DESC;

-- Get commit history
WITH RECURSIVE commit_tree AS (
  SELECT * FROM commits WHERE id = $1
  UNION ALL
  SELECT c.* FROM commits c
  JOIN commit_tree ct ON c.id = ct.parent_commit_id
)
SELECT * FROM commit_tree ORDER BY created_at DESC;

-- Get online users
SELECT u.* FROM users u
WHERE u.id IN (
  -- Redis query: SMEMBERS online:project:{id}
);
```

## Data Validation

```typescript
// Client-side
- Email format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Password: min 8 chars
- File type: .als only
- File size: max 500MB

// Server-side
- JWT signature verification
- bcrypt password comparison
- SQL injection prevention (parameterized queries)
- Input sanitization
```

## Backup & Recovery

```typescript
// Automated
- PostgreSQL: Daily dump to S3
- Project snapshots: Created on every commit
- Retention: 30 days (snapshots), 90 days (DB)

// Manual restore
1. Locate commit snapshot
2. Load ./projects/{id}/snapshots/commit-{id}.json
3. Apply to current project
```

## Performance Tips

```typescript
// Database
- Index: owner_id, project_id, created_at
- Use EXPLAIN ANALYZE for slow queries

// Redis
- Set TTLs on all keys
- Use pipeline for batch operations

// File uploads
- Stream large files (don't load into memory)
- Compress snapshots with gzip
```
