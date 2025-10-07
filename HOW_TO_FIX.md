# 🎯 使用指南 - 数据库外键约束修复

## 📌 你需要做的事情

### 选项 A: 使用 Railway CLI (推荐)

```bash
# 0. 检查 Railway CLI 是否已安装
railway --version
# 如果显示 "command not found",运行:
# npm install -g @railway/cli

# 1. 登录 Railway
railway login
# 这会打开浏览器,授权后返回终端

# 2. 链接项目
railway link
# 选择您的 ColDaw 项目

# 3. 应用数据库修复
railway run bash fix-database.sh

# 4. 验证修复
railway run bash verify-fix.sh

# 5. 提交并部署代码
git add .
git commit -m "fix: Resolve database foreign key constraints"
git push
```

### 选项 B: 手动执行

```bash
# 1. 从 Railway Dashboard 获取 DATABASE_URL
#    项目 → PostgreSQL → Variables → DATABASE_URL

# 2. 设置环境变量
export DATABASE_URL='postgresql://...'

# 3. 安装 PostgreSQL 客户端 (如果需要)
brew install postgresql  # macOS
# 或
sudo apt-get install postgresql-client  # Ubuntu

# 4. 运行修复
./fix-database.sh

# 5. 验证修复
./verify-fix.sh

# 6. 部署代码
git add .
git commit -m "fix: Resolve database foreign key constraints"
git push
```

## ✅ 检查进度

完成每一步后,在这里打勾:

- [ ] **步骤 1**: 数据库修复脚本成功运行 (`fix-database.sh`)
- [ ] **步骤 2**: 验证脚本确认修复 (`verify-fix.sh`)
- [ ] **步骤 3**: 代码已提交到 Git
- [ ] **步骤 4**: 代码已推送到 Railway
- [ ] **步骤 5**: Railway 自动部署完成
- [ ] **步骤 6**: 日志中没有外键错误
- [ ] **步骤 7**: 应用功能正常

## 🔍 如何知道成功了?

### 数据库修复成功的标志:

```
✅ Database constraints fixed successfully!
```

### 验证成功的标志:

```
✅ All verification checks passed!
🎉 Database is ready for deployment!
```

### 部署成功的标志:

在 Railway 日志中看到:
```
✅ Connected to PostgreSQL
💾 PostgreSQL database initialized
🚀 ColDaw server running on port 8080
```

**并且不再看到:**
```
❌ ERROR: insert or update on table "branches" violates foreign key constraint
```

## 🚨 遇到问题?

### 问题 1: "psql: command not found"

**解决:**
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### 问题 2: "railway: command not found"

**解决:**
```bash
npm install -g @railway/cli
railway login
```

### 问题 3: 连接数据库失败

**检查:**
1. DATABASE_URL 是否正确
2. PostgreSQL 服务是否运行
3. 网络连接是否正常

**使用 Railway CLI:**
```bash
railway run bash fix-database.sh
```

### 问题 4: 验证失败

**运行详细查询:**
```bash
railway run bash verify-fix.sh
```

查看具体哪个检查失败,然后:
- 如果是系统用户缺失: 重新运行 `fix-database.sh`
- 如果是无效引用: 检查 SQL 脚本是否完整执行

## 📞 需要更多帮助?

查看详细文档:
- **快速参考**: `QUICK_FIX_DATABASE.md`
- **完整指南**: `DATABASE_FOREIGN_KEY_FIX.md`
- **部署清单**: `DEPLOYMENT_CHECKLIST.md`
- **修复总结**: `FIX_SUMMARY.md`

## 💡 提示

1. **始终先修复数据库,再部署代码**
2. **使用 Railway CLI 最简单**
3. **运行验证脚本确保修复成功**
4. **保留日志以便排查问题**

---

**准备好了?** 选择一个选项开始执行! 🚀
