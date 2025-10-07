# 🔧 数据库外键约束错误修复

## 🚨 错误信息

```
Failed to initialize project: insert or update on table "branches" 
violates foreign key constraint "branches_created_by_fkey"
```

## 🔍 问题原因

`branches` 表的 `created_by` 字段有外键约束,必须引用 `users` 表中存在的用户 ID。

代码中使用了:
```typescript
created_by: userId || 'anonymous'
```

当 `userId` 为空时,使用 `'anonymous'` 字符串,但这个用户在数据库中不存在,导致外键约束违规。

## ✅ 已修复

修改了以下文件:
- `server/src/routes/project.ts` (3处)
- `server/src/routes/version.ts` (1处)

**修复前:**
```typescript
created_by: userId || 'anonymous'
```

**修复后:**
```typescript
created_by: userId  // Must be a valid user ID
```

## 📋 相关数据库约束

```sql
CREATE TABLE branches (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)  ← 外键约束
);
```

## 🎯 确保问题不再发生

### 必要条件

创建项目/分支时,必须:
1. **用户已登录** - 有效的 JWT token
2. **用户存在于数据库** - `userId` 在 `users` 表中存在
3. **认证中间件工作** - `req.user_id` 被正确设置

### 认证流程

1. 用户注册/登录 → 获得 JWT token
2. 前端请求时携带 token → `Authorization: Bearer <token>`
3. 后端认证中间件验证 token → 设置 `req.user_id`
4. 路由处理器使用 `req.user_id` → 创建数据库记录

## 🐛 如果还是出现此错误

### 检查 1: 用户是否已登录

```javascript
// 前端检查
const token = localStorage.getItem('coldaw_token');
console.log('Token:', token);
```

### 检查 2: Token 是否有效

在浏览器 Console:
```javascript
// 解码 JWT token (不验证签名)
const token = localStorage.getItem('coldaw_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', payload.userId);
```

### 检查 3: 用户是否在数据库中

在 Railway → PostgreSQL → Data 或使用 psql:
```sql
SELECT id, email, username FROM users;
```

确认 token 中的 `userId` 存在于查询结果中。

### 检查 4: 认证中间件是否工作

查看服务器日志,应该看到:
```
POST /api/projects
Headers: { Authorization: 'Bearer xxx...' }
Authenticated user: <user-id>
```

## 🔄 如果用户数据丢失

如果数据库中没有用户记录:

1. **重新注册**
   ```bash
   curl -X POST https://your-app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'
   ```

2. **清除本地 token 并重新登录**
   ```javascript
   localStorage.removeItem('coldaw_token');
   // 然后在前端重新登录
   ```

## 📊 数据库状态检查

### 查看用户数

```sql
SELECT COUNT(*) FROM users;
```

### 查看最近创建的用户

```sql
SELECT id, email, username, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### 查看孤立的 branches (不应该有)

```sql
SELECT b.* 
FROM branches b
LEFT JOIN users u ON b.created_by = u.id
WHERE u.id IS NULL;
```

如果有结果,说明有数据不一致。

## 🚀 部署后验证

1. **清除浏览器缓存**
2. **重新注册新用户**
3. **尝试创建项目**
4. **应该成功**

---

**修复时间:** 2025-10-06  
**状态:** ✅ 已修复并部署
