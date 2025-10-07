# 🚀 Railway CLI 安装和使用指南

## ✅ 步骤 1: Railway CLI 已安装!

Railway CLI 已经安装完成!

## 📝 步骤 2: 登录 Railway

运行以下命令登录:

```bash
railway login
```

这会打开浏览器让您授权。登录后返回终端。

## 🔗 步骤 3: 链接项目

在您的项目目录中:

```bash
railway link
```

选择您的 ColDaw 项目。

## 🔧 步骤 4: 运行数据库修复

```bash
railway run bash fix-database.sh
```

## ✅ 步骤 5: 验证修复

```bash
railway run bash verify-fix.sh
```

---

## 🆘 如果您不想使用 Railway CLI

### 替代方案 1: 使用 Railway Web Dashboard

1. **获取 DATABASE_URL**:
   - 打开 https://railway.app
   - 进入您的项目
   - 点击 PostgreSQL 服务
   - 进入 "Variables" 标签
   - 复制 `DATABASE_URL` 的值

2. **在本地运行修复**:
   ```bash
   export DATABASE_URL='粘贴您的数据库URL'
   ./fix-database.sh
   ```

3. **验证修复**:
   ```bash
   ./verify-fix.sh
   ```

### 替代方案 2: 在 Railway 上直接运行

您也可以通过 Railway 的 Web 界面直接执行 SQL:

1. 打开 Railway Dashboard
2. 点击 PostgreSQL 服务
3. 点击 "Query" 标签
4. 复制 `fix-database-constraints.sql` 的内容
5. 粘贴并执行

---

## 🎯 现在开始!

运行:
```bash
railway login
```

然后按照提示操作! 🚀
