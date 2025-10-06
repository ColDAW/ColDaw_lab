# Authentication Guide

## Overview

The ColDaw Export plugin now includes a complete authentication system that requires users to log in before uploading projects. This ensures that all uploaded projects are properly associated with user accounts.

## Features

### 🔐 User Authentication
- Login with email and password
- Secure token-based authentication
- Persistent login state (saved in plugin state)
- Logout functionality

### 🎨 User Interface
The plugin interface now includes:
- **Login Section** (top area, 240px)
  - Username/email input field
  - Password input field (masked)
  - Login button
  - Logout button
  - Login status label
  
- **Project Export Section** (middle area)
  - File selection and export controls
  - Only enabled when logged in
  
- **Settings Section** (bottom area)
  - Server URL configuration
  - Auto-export toggle

## Demo Accounts

The server comes with pre-configured demo accounts for testing:

| Email | Password | User ID |
|-------|----------|---------|
| `demo@coldaw.com` | `demo123` | `user-1` |
| `test@coldaw.com` | `test123` | `user-2` |

## Server Configuration

### Default Settings
- **Server URL**: `http://localhost:3001`
- **Port**: `3001`

### Starting the Server

```bash
# Navigate to server directory
cd /Users/yifan/Documents/WebD/ColDaw/server

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The server will start on port 3001 with the following output:
```
🚀 ColDaw server running on port 3001
📁 Upload directory: /path/to/uploads
💾 Projects directory: /path/to/projects
✅ Database initialized
```

## API Endpoints

### POST /api/auth/login
Authenticate a user and receive an access token.

**Request:**
```json
{
  "email": "demo@coldaw.com",
  "password": "demo123"
}
```

**Response (200 OK):**
```json
{
  "token": "3eead42d...aeb101-user-1",
  "userId": "user-1",
  "email": "demo@coldaw.com",
  "name": "Demo User"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

### POST /api/auth/logout
Invalidate the current authentication token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/verify
Verify if the current token is valid.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "userId": "user-1",
  "email": "demo@coldaw.com",
  "name": "Demo User"
}
```

## Using the Plugin

### 1. Start the Server
Before using the plugin, ensure the ColDaw server is running on port 3001.

### 2. Open the Plugin
Load the "ColDaw Export" plugin in Ableton Live:
- Add it to any track as an audio effect
- The plugin window will open showing the login interface

### 3. Log In
1. Enter your email in the username field
2. Enter your password
3. Click the "Login" button
4. Wait for the status to show "Logged in as: {your-email}"

### 4. Export Projects
Once logged in:
1. Save your Ableton project (Cmd+S)
2. Click the "Export to ColDaw" button
3. The plugin will automatically detect and upload your project
4. A browser window will open with your project

### 5. Log Out (Optional)
Click the "Logout" button to end your session.

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        Plugin GUI                           │
│                                                             │
│  1. User enters email/password                             │
│  2. Click "Login" button                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PluginProcessor::login()                       │
│                                                             │
│  1. Create JSON body with credentials                      │
│  2. POST to /api/auth/login                                │
│  3. Parse response token                                   │
│  4. Store token, userId, username                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Server /api/auth/login                     │
│                                                             │
│  1. Validate credentials                                   │
│  2. Generate secure token                                  │
│  3. Return token + user info                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            PluginProcessor::exportToColDaw()                │
│                                                             │
│  1. Check isLoggedIn()                                     │
│  2. Detect/select .als file                                │
│  3. Call uploadProjectFile()                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          PluginProcessor::uploadProjectFile()               │
│                                                             │
│  1. Read file data                                         │
│  2. Create multipart form data                             │
│  3. Add Authorization: Bearer {token} header               │
│  4. POST to /api/projects/init                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Server /api/projects/init                      │
│                                                             │
│  1. Verify Bearer token                                    │
│  2. Extract user ID from token                             │
│  3. Save project with owner = userId                       │
│  4. Return project ID                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Project saved to user!                    │
│         Project now appears in user's history               │
└─────────────────────────────────────────────────────────────┘
```

## Security Notes

⚠️ **Important**: The current implementation is for **development/demo purposes only**.

### Current Implementation
- Passwords stored in plain text in memory
- Simple token generation (not JWT)
- Tokens stored in Map (not persisted)
- No password hashing

### For Production
You should implement:
- ✅ Password hashing with bcrypt
- ✅ JWT tokens with expiration
- ✅ Secure token storage (Redis/database)
- ✅ HTTPS for all communications
- ✅ Rate limiting on login endpoint
- ✅ Proper user database with migrations
- ✅ Password reset functionality
- ✅ Email verification
- ✅ Two-factor authentication (optional)

## Troubleshooting

### "Login failed: Could not connect to server"
- **Cause**: Server is not running or wrong URL
- **Solution**: 
  1. Check if server is running: `lsof -i :3001`
  2. Start server: `cd server && npm run dev`
  3. Verify URL in plugin settings is `http://localhost:3001`

### "Login failed: Invalid email or password"
- **Cause**: Wrong credentials
- **Solution**: Use demo accounts:
  - Email: `demo@coldaw.com`
  - Password: `demo123`

### "Error: Please login first"
- **Cause**: Not logged in or token expired
- **Solution**: Click the Login button and enter credentials

### Export button is disabled
- **Cause**: Not logged in
- **Solution**: Log in first using the login form at the top

### Plugin doesn't remember login after restart
- **Cause**: Plugin state not saved properly
- **Solution**: 
  1. Log in again
  2. Save your DAW project to save plugin state
  3. Token is saved with project file

## Files Modified/Created

### Backend
- ✅ `server/src/routes/auth.ts` - New authentication routes
- ✅ `server/src/index.ts` - Added auth routes registration

### Plugin
- ✅ `vst-plugin/Source/PluginProcessor.h` - Added auth methods and state
- ✅ `vst-plugin/Source/PluginProcessor.cpp` - Implemented login/logout/upload with auth
- ✅ `vst-plugin/Source/PluginEditor.h` - Added login UI components
- ✅ `vst-plugin/Source/PluginEditor.cpp` - Implemented login interface and handlers

## Testing

### Test Login API
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coldaw.com","password":"demo123"}'
```

### Test with Token
```bash
# Save the token from login response
TOKEN="your-token-here"

# Verify token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/verify

# Logout
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/logout
```

## Next Steps

Future enhancements could include:
- [ ] User registration endpoint
- [ ] Password reset functionality
- [ ] Token expiration and refresh
- [ ] Remember me option
- [ ] Multiple login sessions management
- [ ] User profile management
- [ ] OAuth integration (Google, GitHub, etc.)
