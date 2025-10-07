# 🔧 数据库外键约束修复指南

## 📋 问题概述

从 Railway 日志中发现两个主要的数据库约束错误:

### 错误 1: `branches` 表约束违反
```sql
ERROR: null value in column "created_by" of relation "branches" violates not-null constraint
ERROR: insert or update on table "branches" violates foreign key constraint "branches_created_by_fkey"
DETAIL: Key (created_by)=(anonymous) is not present in table "users"
```

### 错误 2: `versions` 表约束违反
```sql
ERROR: insert or update on table "versions" violates foreign key constraint "versions_user_id_fkey"
DETAIL: Key (user_id)=(Joe2) is not present in table "users"
DETAIL: Key (user_id)=(Joe) is not present in table "users"
```

## 🎯 根本原因

1. **缺少系统用户**: 代码使用 `'VST Plugin'` 和 `'Anonymous'` 作为用户 ID,但这些用户不存在于 `users` 表中
2. **NULL 值**: 某些情况下 `created_by` 字段为 NULL
3. **不存在的用户**: 尝试用不存在的用户 ID 创建记录

## ✅ 已完成的修复

### 1. SQL 修复脚本 (`fix-database-constraints.sql`)

创建了完整的 SQL 脚本来:
- ✅ 创建系统用户 `vst-plugin-system` 和 `anonymous-system`
- ✅ 更新所有 NULL 的 `created_by` 字段
- ✅ 为所有引用的用户创建占位用户记录
- ✅ 更新所有 `'VST Plugin'` 和 `'Anonymous'` 引用到正确的系统用户 ID
- ✅ 验证修复结果

### 2. 代码更新

更新了以下文件中的用户 ID 引用:

#### `server/src/routes/project.ts`
```typescript
// 之前:
user_id: author || 'VST Plugin',

// 之后:
user_id: author || 'vst-plugin-system',
```

#### `server/src/routes/version.ts`
```typescript
// 之前:
user_id: author || 'Anonymous',

// 之后:
user_id: author || 'anonymous-system',
```

### 3. 自动化脚本 (`fix-database.sh`)

创建了 shell 脚本来自动应用 SQL 修复。

## 🚀 执行修复步骤

### 步骤 1: 应用数据库修复

有两种方式执行:

#### 方式 A: 使用 Railway CLI (推荐)

```bash
# 在本地项目目录
railway run bash fix-database.sh
```

这会自动:
- 使用 Railway 的 DATABASE_URL
- 连接到数据库
- 应用所有修复

#### 方式 B: 手动执行

```bash
# 1. 从 Railway 获取 DATABASE_URL
#    进入 Railway Dashboard → 你的项目 → PostgreSQL → Variables
#    复制 DATABASE_URL 的值

# 2. 设置环境变量
export DATABASE_URL='postgresql://postgres:password@host:5432/railway'

# 3. 运行脚本
./fix-database.sh
```

### 步骤 2: 重新部署应用

应用了数据库修复后,需要重新部署应用以使用更新的代码:

```bash
# 提交更改
git add .
git commit -m "fix: Update system user IDs to fix foreign key constraints"
git push

# Railway 会自动重新部署
```

或者在 Railway Dashboard 中手动触发重新部署:
1. 进入你的应用服务
2. 点击 "Deployments" 标签
3. 点击 "Deploy" 按钮

### 步骤 3: 验证修复

部署完成后,查看日志:

```bash
railway logs
```

**成功的标志:**
- ✅ 没有更多的外键约束错误
- ✅ 分支创建成功
- ✅ 版本创建成功

## 🔍 验证查询

如果需要手动验证修复,可以运行以下 SQL 查询:

```sql
-- 检查系统用户是否存在
SELECT id, username, email 
FROM users 
WHERE id IN ('vst-plugin-system', 'anonymous-system');

-- 检查是否还有 NULL 的 created_by
SELECT COUNT(*) as null_count
FROM branches
WHERE created_by IS NULL;

-- 检查是否还有无效的外键引用
SELECT COUNT(*) as invalid_count
FROM branches b
LEFT JOIN users u ON b.created_by = u.id
WHERE u.id IS NULL;

-- 检查 versions 表
SELECT COUNT(*) as invalid_count
FROM versions v
LEFT JOIN users u ON v.user_id = u.id
WHERE u.id IS NULL;
```

所有这些查询应该返回 0 或只显示系统用户。

## 📝 SQL 修复详情

### 创建的系统用户

| ID | Username | Email | 用途 |
|----|----------|-------|------|
| `vst-plugin-system` | VST Plugin | vst@system.local | VST 插件创建的项目和版本 |
| `anonymous-system` | Anonymous | anonymous@system.local | 匿名操作的默认用户 |

### 执行的操作

1. **插入系统用户** (如果不存在)
2. **更新 branches 表**:
   - 将 NULL `created_by` → `anonymous-system`
   - 将 `'anonymous'` → `anonymous-system`
3. **更新 versions 表**:
   - 将 `'VST Plugin'` → `vst-plugin-system`
   - 将 `'Anonymous'` → `anonymous-system`
4. **创建遗留用户**:
   - 为所有引用但不存在的用户 ID 创建占位记录
   - 例如: `'Joe2'`, `'Joe'` 等

## 🚨 故障排除

### 问题: psql 命令未找到

**解决方案:**
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### 问题: 连接被拒绝

**解决方案:**
1. 确认 DATABASE_URL 正确
2. 检查 Railway PostgreSQL 服务是否运行
3. 验证网络连接

### 问题: SSL 连接错误

**解决方案:**
```bash
# 添加 SSL 参数到 DATABASE_URL
DATABASE_URL="${DATABASE_URL}?sslmode=require"
./fix-database.sh
```

### 问题: 修复后仍有错误

**可能原因:**
1. 应用代码未重新部署
2. 缓存的连接池
3. 其他未发现的数据不一致

**解决步骤:**
1. 强制重新部署应用
2. 重启 Railway 服务
3. 查看完整的错误日志
4. 运行验证查询检查数据

## 📊 预期结果

修复后,你应该看到:

### 在数据库中:
- ✅ 2 个新的系统用户
- ✅ 所有 branches 都有有效的 `created_by`
- ✅ 所有 versions 都有有效的 `user_id`
- ✅ 所有引用的用户都存在于 `users` 表中

### 在应用日志中:
```
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🚀 ColDaw server running on port 8080
```

### 在功能测试中:
- ✅ 可以创建新项目
- ✅ 可以创建新分支
- ✅ 可以提交新版本
- ✅ VST 插件导入正常工作

## 🔄 未来预防

为了防止类似问题:

1. **使用常量定义系统用户 ID**:
   ```typescript
   // server/src/constants.ts
   export const SYSTEM_USERS = {
     VST_PLUGIN: 'vst-plugin-system',
     ANONYMOUS: 'anonymous-system',
   };
   ```

2. **在初始化时创建系统用户**:
   ```typescript
   // server/src/database/init.ts
   await ensureSystemUsers();
   ```

3. **添加数据验证**:
   ```typescript
   // 在插入前验证用户存在
   if (userId) {
     const userExists = await db.getUserById(userId);
     if (!userExists) throw new Error('User not found');
   }
   ```

4. **使用数据库触发器**:
   ```sql
   -- 自动使用默认系统用户
   CREATE OR REPLACE FUNCTION set_default_user()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.created_by IS NULL THEN
       NEW.created_by := 'anonymous-system';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

## 📞 需要帮助?

如果修复后仍有问题,请提供:

1. ✅ 执行 `fix-database.sh` 的完整输出
2. ✅ Railway 应用的最新部署日志
3. ✅ 验证查询的结果
4. ✅ 任何新的错误消息

---

**最后更新**: 2025-10-07  
**状态**: ✅ 修复已准备就绪,等待应用
