# API Documentation

ColDaw provides a RESTful API for managing projects, versions, and user authentication. All API endpoints return JSON responses and require proper authentication for protected routes.

## 🔗 Base URL

**Development**: `http://localhost:3001/api`  
**Production**: `https://coldawlab-production.up.railway.app/api`

## 🔐 Authentication

### JWT Token Authentication
Most endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

### Authentication Flow
1. Login with credentials to receive JWT token
2. Include token in subsequent requests
3. Refresh token before expiration
4. Logout to invalidate token

## 📋 API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "verificationCode": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "createdAt": "ISO8601"
  },
  "token": "jwt_token"
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  },
  "token": "jwt_token"
}
```

#### POST /auth/logout
Invalidate the current JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /auth/send-verification
Send email verification code for registration.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to email"
}
```

### Project Endpoints

#### GET /projects
Get list of user's projects.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for project name

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "owner": {
        "id": "uuid",
        "username": "string"
      },
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "thumbnail": "base64_image_data",
      "collaborators": ["uuid"],
      "isPublic": false,
      "tags": ["string"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /projects/:id
Get specific project details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "project": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "owner": {
      "id": "uuid",
      "username": "string"
    },
    "data": {
      "tracks": [...],
      "clips": [...],
      "effects": [...],
      "automation": [...]
    },
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "collaborators": [
      {
        "id": "uuid",
        "username": "string",
        "role": "viewer|editor|admin"
      }
    ]
  }
}
```

#### POST /projects/init
Initialize new project by uploading Ableton Live file.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: Ableton Live (.als) file
- `name`: Project name
- `description` (optional): Project description
- `isPublic` (optional): Make project public (default: false)

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "data": {...},
    "createdAt": "ISO8601"
  }
}
```

#### PUT /projects/:id
Update project metadata.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "isPublic": false,
  "tags": ["string"]
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "updatedAt": "ISO8601"
  }
}
```

#### DELETE /projects/:id
Delete a project (owner only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Version Control Endpoints

#### GET /projects/:id/versions
Get project version history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `branch` (optional): Filter by branch name
- `limit` (optional): Number of versions to return

**Response:**
```json
{
  "versions": [
    {
      "id": "uuid",
      "commitMessage": "string",
      "author": {
        "id": "uuid",
        "username": "string"
      },
      "createdAt": "ISO8601",
      "branch": "string",
      "parentVersion": "uuid",
      "changes": {
        "added": [...],
        "modified": [...],
        "deleted": [...]
      }
    }
  ]
}
```

#### POST /projects/:id/commit
Create new project version (commit).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "string",
  "branch": "string",
  "changes": {
    "tracks": [...],
    "clips": [...],
    "effects": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "version": {
    "id": "uuid",
    "commitMessage": "string",
    "author": {...},
    "createdAt": "ISO8601",
    "branch": "string"
  }
}
```

#### GET /projects/:id/branches
Get list of project branches.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "branches": [
    {
      "name": "main",
      "latestCommit": {
        "id": "uuid",
        "message": "string",
        "author": "string",
        "createdAt": "ISO8601"
      },
      "isDefault": true
    }
  ]
}
```

#### POST /projects/:id/branches
Create new branch.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string",
  "fromVersion": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "branch": {
    "name": "string",
    "createdAt": "ISO8601",
    "latestCommit": {...}
  }
}
```

#### GET /versions/:id
Get specific version details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "version": {
    "id": "uuid",
    "commitMessage": "string",
    "author": {...},
    "projectData": {...},
    "createdAt": "ISO8601",
    "branch": "string",
    "parentVersion": "uuid"
  }
}
```

### Health Check Endpoints

#### GET /health
Basic server health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "ISO8601",
  "message": "Server is running",
  "services": {
    "redis": "healthy",
    "email": "healthy"
  }
}
```

#### GET /health/db
Database connectivity check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "ISO8601",
  "database": "connected",
  "dbQueryTime": "15ms"
}
```

## 🔄 Real-Time Events (Socket.io)

### Connection
```javascript
const socket = io('wss://coldawlab-production.up.railway.app');

// Authenticate socket connection
socket.emit('authenticate', { token: 'jwt_token' });
```

### Project Collaboration Events

#### Join Project Room
```javascript
socket.emit('project:join', { projectId: 'uuid' });
```

#### Real-time Edits
```javascript
// Send edit
socket.emit('project:edit', {
  projectId: 'uuid',
  type: 'clip:move',
  data: {
    clipId: 'uuid',
    newPosition: { x: 100, y: 50 }
  }
});

// Receive edit
socket.on('project:update', (edit) => {
  // Apply edit to local state
});
```

#### Cursor Updates
```javascript
// Send cursor position
socket.emit('cursor:update', {
  projectId: 'uuid',
  position: { x: 150, y: 200 },
  selection: 'clip-123'
});

// Receive cursor updates
socket.on('cursor:update', (cursorData) => {
  // Update collaborator cursor display
});
```

#### User Presence
```javascript
// User joined project
socket.on('user:joined', (user) => {
  // Show user in collaborators list
});

// User left project
socket.on('user:left', (userId) => {
  // Remove user from collaborators list
});
```

## 📊 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {...}
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for resource |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request data validation failed |
| `FILE_TOO_LARGE` | 413 | Uploaded file exceeds size limit |
| `RATE_LIMITED` | 429 | Too many requests from client |
| `SERVER_ERROR` | 500 | Internal server error |

### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    }
  }
}
```

## 🚦 Rate Limiting

### Limits
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per hour per user
- **API Calls**: 1000 requests per hour per user
- **Socket Events**: 100 events per minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## 📝 Request/Response Examples

### Complete Authentication Flow
```javascript
// 1. Send verification code
fetch('/api/auth/send-verification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// 2. Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'musicproducer',
    email: 'user@example.com',
    password: 'securepassword',
    verificationCode: '123456'
  })
});

const { token } = await registerResponse.json();

// 3. Use token for authenticated requests
const projectsResponse = await fetch('/api/projects', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Project Upload Example
```javascript
const formData = new FormData();
formData.append('file', alsFile);
formData.append('name', 'My Awesome Track');
formData.append('description', 'Latest house track');

const response = await fetch('/api/projects/init', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { project } = await response.json();
```

## 🔧 SDK and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @coldaw/api-client
```

```javascript
import { ColDawAPI } from '@coldaw/api-client';

const api = new ColDawAPI({
  baseURL: 'https://coldawlab-production.up.railway.app/api',
  token: 'your-jwt-token'
});

// Get projects
const projects = await api.projects.list();

// Upload project
const project = await api.projects.upload(file, {
  name: 'New Track',
  description: 'My latest composition'
});
```

### Python SDK
```bash
pip install coldaw-python-sdk
```

```python
from coldaw import ColDawAPI

api = ColDawAPI(
    base_url='https://coldawlab-production.up.railway.app/api',
    token='your-jwt-token'
)

# Get projects
projects = api.projects.list()

# Upload project
with open('project.als', 'rb') as f:
    project = api.projects.upload(f, name='New Track')
```

---

For more information or support, please visit our [GitHub repository](https://github.com/yifandeng2002/ColDaw_lab) or contact our API support team.