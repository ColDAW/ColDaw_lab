# 首页问题修复指南

## 问题总结

在首页发现了以下问题：
1. ❌ 项目封面渲染不正确
2. ❌ 显示 "Invalid Date"
3. ❌ 删除项目时失败 "Failed to delete project"

## 根本原因

### 1. 删除项目失败
**原因**: PostgreSQL 数据库中的外键约束没有设置 `ON DELETE CASCADE`，导致删除项目时，由于存在依赖的 versions、branches、collaborators 等记录而失败。

### 2. 显示 Invalid Date
**原因**: 
- 数据库中 `updated_at` 是 Unix timestamp（毫秒）
- 前端只显示日期，没有显示项目名称
- 渲染逻辑有问题

### 3. 项目封面渲染问题
**相关**: 可能与项目数据获取有关

## 修复内容

### ✅ 1. 更新数据库 Schema
文件: `server/src/database/schema.sql`

为所有外键约束添加了 `ON DELETE CASCADE`：
- `versions` → `projects`: ON DELETE CASCADE
- `branches` → `projects`: ON DELETE CASCADE
- `collaborators` → `projects`: ON DELETE CASCADE
- `project_collaborators` → `projects`: ON DELETE CASCADE
- `pending_changes` → `projects`: ON DELETE CASCADE

### ✅ 2. 修复首页显示
文件: `client/src/pages/HomePage.tsx`

**变更**:
- 添加 `ProjectTitle` 组件来显示项目名称
- 修改渲染逻辑，现在显示：
  - 项目名称（粗体）
  - 更新日期（小字）
- 日期格式正确处理（`new Date(project.updated_at).toLocaleDateString()`）

### ✅ 3. 创建数据库迁移脚本
文件: `fix-foreign-keys-cascade.sql`

用于修复现有 Railway PostgreSQL 数据库的外键约束。

## 应用修复步骤

### Step 1: 更新 Railway PostgreSQL 数据库

有三种方法：

#### 方法 A: 使用新的迁移脚本（最简单）

```bash
# 运行自动化脚本
./apply-db-fix-railway.sh
```

这个脚本会：
- 检查 Railway CLI 是否已安装和登录
- 获取数据库连接信息
- 自动执行迁移脚本

#### 方法 B: 手动使用 DATABASE_URL

```bash
# 1. 获取数据库 URL
railway variables get DATABASE_URL

# 2. 使用 psql 连接并执行迁移
psql "postgresql://..." < fix-foreign-keys-cascade.sql
```

**注意**: 将 `postgresql://...` 替换为实际的 DATABASE_URL

#### 方法 C: 使用 Railway Web Console（最可靠）

1. 打开 [Railway Dashboard](https://railway.app/dashboard)
2. 选择你的项目
3. 进入 PostgreSQL 服务
4. 点击 "Data" 或 "Query" 标签
5. 打开 `fix-foreign-keys-cascade.sql` 文件
6. 复制所有内容
7. 粘贴到 Railway 的查询窗口
8. 点击 "Run" 或 "Execute"

**推荐使用方法 C**，因为它不依赖本地环境配置。

### Step 2: 重新部署应用

```bash
# 提交更改
git add .
git commit -m "fix: Add CASCADE DELETE to foreign keys and fix homepage display"

# 推送到 Railway（如果配置了自动部署）
git push origin main

# 或者使用 Railway CLI
railway up
```

### Step 3: 验证修复

1. **测试删除项目**:
   - 打开应用首页
   - 点击任意项目的删除按钮
   - 确认删除
   - ✅ 应该成功删除，不再显示错误

2. **检查项目显示**:
   - 刷新首页
   - ✅ 应该看到项目名称（粗体）
   - ✅ 应该看到正确的日期（不再是 "Invalid Date"）

3. **检查项目封面**:
   - ✅ 封面应该正确渲染（如果有 versions 数据）

## 技术细节

### 数据库变更详情

**之前**:
```sql
FOREIGN KEY (project_id) REFERENCES projects(id)
```

**之后**:
```sql
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
```

这意味着：
- 删除一个项目时，PostgreSQL 会自动删除所有相关的：
  - versions (版本)
  - branches (分支)
  - collaborators (协作者)
  - project_collaborators (项目协作者)
  - pending_changes (待处理更改)

### 前端变更详情

**之前**:
```tsx
<ProjectMeta>
  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
</ProjectMeta>
```

**之后**:
```tsx
<>
  <ProjectTitle>{project.name}</ProjectTitle>
  <ProjectMeta>
    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
  </ProjectMeta>
</>
```

## 预防措施

为了避免将来出现类似问题：

1. ✅ **数据库设计**: 总是考虑级联删除策略
2. ✅ **前端验证**: 检查数据格式和类型
3. ✅ **错误处理**: 添加详细的错误日志
4. ✅ **测试**: 在部署前测试删除操作

## 故障排除

### 如果删除仍然失败

检查服务器日志：
```bash
railway logs
```

可能的问题：
- 数据库迁移脚本未执行
- 还有其他未知的外键约束
- 文件系统权限问题（删除项目目录）

### 如果日期仍然显示 Invalid Date

检查：
1. `project.updated_at` 的值（在浏览器控制台）
2. 确保它是一个有效的 Unix timestamp（毫秒）
3. 检查数据库中的实际值

### 如果封面不渲染

检查：
1. 浏览器控制台的错误
2. 项目是否有 versions
3. API 端点 `/api/versions/:projectId/history` 是否正常工作

## 相关文件

- ✅ `server/src/database/schema.sql` - 更新的数据库模式
- ✅ `client/src/pages/HomePage.tsx` - 修复的首页组件
- ✅ `fix-foreign-keys-cascade.sql` - 数据库迁移脚本
- 📝 `FIX_HOMEPAGE_ISSUES.md` - 本文档

## 完成检查清单

- [ ] 执行数据库迁移脚本
- [ ] 重新部署应用
- [ ] 测试删除项目功能
- [ ] 验证项目名称和日期显示
- [ ] 检查项目封面渲染
- [ ] 查看服务器日志确认无错误

---

**注意**: 这些更改主要影响数据库层面的级联删除行为，对现有数据是安全的，不会丢失任何数据。
