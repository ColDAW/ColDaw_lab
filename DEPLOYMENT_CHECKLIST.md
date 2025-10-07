# ✅ 部署检查清单 - 数据库外键约束修复

## 📋 修复内容概述

- ✅ 创建了 SQL 修复脚本 (`fix-database-constraints.sql`)
- ✅ 创建了自动化脚本 (`fix-database.sh`)
- ✅ 更新了所有代码中的系统用户引用
- ✅ 准备了详细文档

## 🎯 执行步骤

### 第 1 步: 应用数据库修复 ⚠️

在应用这个修复之前,**必须先执行数据库修复**:

```bash
# 使用 Railway CLI (推荐)
railway run bash fix-database.sh
```

**为什么先修复数据库?**
- 需要先创建系统用户 (`vst-plugin-system`, `anonymous-system`)
- 需要清理现有的无效数据
- 这样新代码部署后就可以立即使用这些系统用户

### 第 2 步: 提交代码更改

```bash
git status
git add server/src/routes/project.ts
git add server/src/routes/version.ts
git add fix-database-constraints.sql
git add fix-database.sh
git add DATABASE_FOREIGN_KEY_FIX.md
git add QUICK_FIX_DATABASE.md
git add DEPLOYMENT_CHECKLIST.md

git commit -m "fix: Resolve database foreign key constraints

- Create system users (vst-plugin-system, anonymous-system)
- Update all user ID references to use system user IDs
- Add SQL script to fix existing data
- Add automation script for easy deployment
- Update documentation"

git push origin main
```

### 第 3 步: 验证 Railway 自动部署

1. 打开 Railway Dashboard
2. 进入你的项目
3. 点击应用服务
4. 查看 "Deployments" 标签
5. 等待新部署完成

### 第 4 步: 监控日志

```bash
railway logs
```

**期望看到的成功日志:**
```
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🚀 ColDaw server running on port 8080
```

**不应该再看到:**
```
❌ ERROR: insert or update on table "branches" violates foreign key constraint
❌ ERROR: null value in column "created_by" violates not-null constraint
```

## 🔍 验证修复

### 测试 1: 创建新项目

使用 VST 插件或 Web 界面创建新项目,应该成功。

### 测试 2: 创建新分支

```bash
curl -X POST https://your-app.railway.app/api/projects/YOUR_PROJECT_ID/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "test-branch"}'
```

应该返回成功响应。

### 测试 3: 检查数据库

```bash
railway run psql $DATABASE_URL -c "SELECT id, username FROM users WHERE id IN ('vst-plugin-system', 'anonymous-system');"
```

应该显示两个系统用户。

## 📊 修改文件清单

### 数据库脚本
- ✅ `fix-database-constraints.sql` - SQL 修复脚本
- ✅ `fix-database.sh` - 自动化执行脚本

### 代码更改
- ✅ `server/src/routes/project.ts` - 2 处更新
  - Line ~157: `'VST Plugin'` → `'vst-plugin-system'`
  - Line ~405: `'Anonymous'` → `'anonymous-system'`
- ✅ `server/src/routes/version.ts` - 5 处更新
  - Line ~65: `'VST Plugin'` → `'vst-plugin-system'`
  - Line ~110: `'Anonymous'` → `'anonymous-system'`
  - Line ~209: `'Anonymous'` → `'anonymous-system'`
  - Line ~316: `'Anonymous'` → `'anonymous-system'`
  - Line ~65 (另一处): `'VST Plugin'` → `'vst-plugin-system'`

### 文档
- ✅ `DATABASE_FOREIGN_KEY_FIX.md` - 详细修复指南
- ✅ `QUICK_FIX_DATABASE.md` - 快速参考
- ✅ `DEPLOYMENT_CHECKLIST.md` - 本检查清单

## 🚨 故障排除

### 如果部署后仍有错误

1. **确认数据库修复已应用:**
   ```bash
   railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM users WHERE id IN ('vst-plugin-system', 'anonymous-system');"
   ```
   应该返回 2。

2. **确认代码已更新:**
   检查 Railway 部署日志,确认最新的 commit 已部署。

3. **检查是否有缓存问题:**
   ```bash
   # 重启服务
   railway restart
   ```

4. **查看完整错误:**
   ```bash
   railway logs --tail 100
   ```

### 如果数据库脚本执行失败

**常见错误 1: psql 未安装**
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql-client
```

**常见错误 2: 连接被拒绝**
- 确认 DATABASE_URL 正确
- 检查 PostgreSQL 服务是否运行
- 验证网络/防火墙设置

**常见错误 3: SSL 错误**
```bash
export DATABASE_URL="${DATABASE_URL}?sslmode=require"
./fix-database.sh
```

## 📈 预期结果

### 数据库状态
- ✅ 2 个新系统用户
- ✅ 所有 branches 有有效的 `created_by`
- ✅ 所有 versions 有有效的 `user_id`
- ✅ 无外键约束违反

### 应用状态
- ✅ 服务正常运行
- ✅ 可以创建项目
- ✅ 可以创建分支
- ✅ 可以提交版本
- ✅ VST 插件正常工作

### 日志清洁
- ✅ 无数据库错误
- ✅ 无外键约束错误
- ✅ 无 NULL 值错误

## 🎉 完成标志

当你看到以下所有条件满足时,修复就成功了:

- [ ] 数据库修复脚本成功执行
- [ ] 代码成功部署到 Railway
- [ ] 日志中没有外键约束错误
- [ ] 可以成功创建新项目
- [ ] 可以成功创建新分支
- [ ] 可以成功提交新版本
- [ ] VST 插件导入正常工作

## 📞 需要帮助?

如果遇到问题:

1. 查看 `DATABASE_FOREIGN_KEY_FIX.md` 获取详细信息
2. 运行验证查询检查数据库状态
3. 检查 Railway 日志获取错误详情
4. 确认所有步骤都已正确执行

---

**准备开始?** 从第 1 步开始执行! 🚀
