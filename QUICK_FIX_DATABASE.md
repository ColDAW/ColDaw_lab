# ⚡ 快速修复指南 - 数据库外键约束

## 🚨 症状

Railway 日志显示:
```
ERROR: insert or update on table "branches" violates foreign key constraint
ERROR: null value in column "created_by" violates not-null constraint
```

## ✅ 一键修复

### 使用 Railway CLI (最简单)

```bash
railway run bash fix-database.sh
```

### 或者手动执行

```bash
# 1. 获取 Railway 的 DATABASE_URL
# 2. 运行:
export DATABASE_URL='你的数据库URL'
./fix-database.sh
```

## 📝 然后重新部署

```bash
git add .
git commit -m "fix: Update system user IDs"
git push
```

## ✅ 验证

查看 Railway 日志,应该不再有外键错误。

---

**详细信息**: 查看 `DATABASE_FOREIGN_KEY_FIX.md`
