# 快速修复指南 - Railway PostgreSQL

## 问题
执行 `railway run psql` 时出现错误：
```
psql: 错误: could not translate host name "postgres.railway.internal"
```

## 原因
`railway run psql` 只能在 Railway 的容器环境中使用，本地无法访问 `postgres.railway.internal` 这个内部地址。

## 解决方案

### ✅ 方案 1: Railway Web Console（推荐，最简单）

1. 打开浏览器，访问 https://railway.app/dashboard
2. 选择你的项目
3. 点击 PostgreSQL 服务
4. 点击 "Query" 或 "Data" 标签
5. 复制 `fix-foreign-keys-cascade.sql` 的全部内容
6. 粘贴到查询窗口
7. 点击 "Execute" 或 "Run"

**优点**: 
- 不需要本地配置
- 直接在 Railway 界面操作
- 最可靠

### ✅ 方案 2: 使用 DATABASE_URL

```bash
# 步骤 1: 获取数据库连接字符串
railway variables get DATABASE_URL

# 步骤 2: 复制输出的 URL（类似 postgresql://postgres:password@...）

# 步骤 3: 使用 psql 连接
psql "postgresql://[复制的URL]" < fix-foreign-keys-cascade.sql
```

**前提条件**: 
- 需要安装 PostgreSQL 客户端（`psql` 命令）
- macOS 上可以用: `brew install postgresql`

### ✅ 方案 3: 使用自动化脚本

```bash
./apply-db-fix-railway.sh
```

这个脚本会自动获取 DATABASE_URL 并执行迁移。

## 验证迁移是否成功

执行以下命令检查外键约束：

```bash
# 使用 Railway CLI
railway run --service postgresql psql -c "\
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    rc.delete_rule 
FROM information_schema.table_constraints tc 
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name 
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('versions', 'branches', 'collaborators', 'project_collaborators', 'pending_changes')
ORDER BY tc.table_name;"
```

期望输出应该显示所有 `delete_rule` 都是 `CASCADE`。

## 完整迁移内容预览

如果你想先看看会执行什么：

```bash
cat fix-foreign-keys-cascade.sql
```

主要操作：
1. 删除现有的外键约束
2. 重新创建带 `ON DELETE CASCADE` 的外键约束
3. 最后有一个验证查询

## 迁移后的下一步

1. ✅ 确认迁移成功
2. 重新部署应用（如果有代码更改）
   ```bash
   git add .
   git commit -m "fix: Add CASCADE DELETE to foreign keys and fix homepage display"
   git push origin main
   ```
3. 测试功能：
   - 删除项目 ✓
   - 查看项目名称和日期 ✓
   - 检查项目封面 ✓

## 需要帮助？

如果遇到问题：

1. 查看 Railway 日志：
   ```bash
   railway logs
   ```

2. 检查数据库服务状态：
   ```bash
   railway status
   ```

3. 重启服务：
   ```bash
   railway restart
   ```

## 相关文件

- `fix-foreign-keys-cascade.sql` - SQL 迁移脚本
- `apply-db-fix-railway.sh` - 自动化执行脚本
- `FIX_HOMEPAGE_ISSUES.md` - 详细修复指南
- `client/src/pages/HomePage.tsx` - 已修复的前端代码
- `server/src/database/schema.sql` - 已更新的数据库模式
