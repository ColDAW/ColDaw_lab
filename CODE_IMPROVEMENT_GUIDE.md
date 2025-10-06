# 代码优化指南

## 日志系统改进

为了更好地控制日志输出和提高代码质量，我们创建了统一的日志工具。

### 使用新的日志工具

#### 服务器端
```typescript
import logger from './utils/logger';

// 替换原有的 console.log
// 旧代码: console.log('Server started');
// 新代码:
logger.info('Server started');

// 调试信息（仅在开发环境显示）
logger.debug('Debug info', { data: someData });

// 警告信息
logger.warn('Warning message');

// 错误信息
logger.error('Error occurred', error);

// 成功信息
logger.success('Operation completed successfully');
```

#### 客户端
```typescript
import logger from '../utils/logger';

// 调试信息（仅在开发环境显示）
logger.debug('Component mounted', props);

// 信息日志
logger.info('User action', action);

// 警告
logger.warn('Deprecated feature used');

// 错误
logger.error('API call failed', error);
```

### 迁移步骤

1. **逐步替换 console.log**
   - 开发调试用的 → `logger.debug()`
   - 重要信息 → `logger.info()`
   - 警告信息 → `logger.warn()`
   - 错误信息 → `logger.error()`

2. **需要迁移的文件**

**服务器端** (约20+处):
- `server/src/socket/handlers.ts`
- `server/src/index.ts`
- `server/src/routes/project.ts`
- `server/src/database/init.ts`
- `server/src/utils/alsParser.ts`

**客户端** (约20+处):
- `client/src/components/ArrangementView.tsx`
- `client/src/components/ProjectThumbnail.tsx`
- `client/src/pages/ProjectPage.tsx`
- `client/src/components/MenuBar.tsx`

### 优点

1. ✅ **环境感知**: 开发环境显示详细日志，生产环境只显示必要信息
2. ✅ **统一格式**: 所有日志都有时间戳和级别标识
3. ✅ **易于控制**: 可以轻松添加日志过滤、持久化等功能
4. ✅ **类型安全**: TypeScript 支持

### 示例迁移

#### 迁移前
```typescript
console.log('Project details loaded:', projectDetails);
console.log('Loading version:', latestVersion.id);
```

#### 迁移后
```typescript
logger.debug('Project details loaded', { projectDetails });
logger.debug('Loading version', { versionId: latestVersion.id });
```

---

## TODO 项目跟踪

当前代码中发现的 TODO 项：

### 客户端
1. **AccountPage.tsx:269** - 实现保存到后端
   ```typescript
   // TODO: Implement save to backend
   ```

2. **ProjectPage.tsx:223** - 实现从特定版本创建分支
   ```typescript
   // TODO: Implement branch creation from specific version
   ```

### 建议
为这些 TODO 创建 GitHub Issues，便于跟踪和管理。

---

## 脚本使用指南

### 开发启动脚本

#### `setup.sh` - 初始化项目
首次克隆项目后运行：
```bash
./setup.sh
```
功能：
- 检查 Node.js 版本
- 安装服务器依赖
- 安装客户端依赖

#### `start.sh` - 启动服务
启动开发环境：
```bash
./start.sh
```
功能：
- 启动后端服务器 (端口 3001)
- 启动前端开发服务器 (端口 5173)
- 在浏览器中自动打开应用

#### `check-status.sh` - 检查服务状态
检查服务是否正常运行：
```bash
./check-status.sh
```
显示：
- 后端服务状态和 PID
- 前端服务状态和 PID
- 访问地址

#### `test-auth.sh` - 测试认证系统
验证认证功能：
```bash
./test-auth.sh
```
测试：
- 服务器健康检查
- 有效登录
- 无效登录（401 错误）
- 注册功能
- Token 验证

#### `test-system.sh` - 系统集成测试
完整系统测试：
```bash
./test-system.sh
```
测试：
- 健康检查
- 用户注册
- 用户登录
- 项目操作

---

## 最佳实践

### 1. 代码提交前
- [ ] 移除或替换 console.log 为 logger
- [ ] 检查是否有新的 TODO 需要创建 Issue
- [ ] 运行 `check-status.sh` 确保服务正常

### 2. 新功能开发
- [ ] 使用 logger 而不是 console.log
- [ ] 重要的 TODO 创建 GitHub Issue
- [ ] 更新相关文档

### 3. 调试时
- [ ] 使用 `logger.debug()` 而不是 `console.log()`
- [ ] 调试完成后检查是否移除临时日志

---

## 文件组织建议

### VST Plugin 文档整合建议
当前 `vst-plugin/` 目录有 10+ 个文档文件，建议整合为：

```
vst-plugin/
├── README.md              # 项目介绍和快速开始
├── ARCHITECTURE.md        # 架构设计文档
├── DEVELOPMENT.md         # 开发指南
└── CHANGELOG.md           # 变更历史（合并所有 FIX 文档）
```

可以删除或合并：
- BUGFIX_401.md → CHANGELOG.md
- FIX_SUMMARY.md → CHANGELOG.md
- VST_LOGIN_FIX.md → CHANGELOG.md
- TEST_LOGIN.md → DEVELOPMENT.md
- QUICKSTART.md → README.md
- USAGE_GUIDE.md → README.md

---

这些优化建议可以逐步实施，不需要一次性完成。优先级：
1. 🔥 高优先级：使用新的日志工具（逐步迁移）
2. 📋 中优先级：为 TODO 创建 GitHub Issues
3. 📚 低优先级：文档整合（可选）
