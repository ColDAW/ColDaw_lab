# 智能导入功能 - VST 到 Web 端版本管理

## 🎯 功能概述

VST 插件现在具有智能版本管理功能：
- **首次导出**：创建新项目
- **再次导出同名项目**：在现有项目上创建新版本（commit）
- 基于项目名称自动识别是否为同一项目
- 类似于 Web 端的 Import 功能，但从 VST 端触发

## 🔧 技术实现

### 1. 服务器端新增接口

**路径**：`/api/projects/smart-import`

**功能**：
```typescript
// 检查用户是否已有同名项目
const existingProject = allUserProjects.find(p => p.name === projectName);

if (existingProject) {
    // 项目存在 -> 创建新版本（commit）
    // 返回: { projectId, versionId, isNewProject: false }
} else {
    // 项目不存在 -> 初始化新项目
    // 返回: { projectId, versionId, isNewProject: true }
}
```

**优势**：
- ✅ 自动识别重复项目
- ✅ 保持版本历史连贯
- ✅ 避免创建重复项目
- ✅ 用户体验更流畅

### 2. VST 插件修改

**文件**：`vst-plugin/Source/PluginProcessor.cpp`

**关键改动**：

1. **更改 API 端点**：
```cpp
// 旧: /api/projects/init
// 新: /api/projects/smart-import
juce::URL uploadUrl(serverUrl + "/api/projects/smart-import");
```

2. **添加消息字段**：
```cpp
addFormField("message", "Update from VST plugin - " + timestamp);
```

3. **智能状态显示**：
```cpp
if (isNewProject) {
    statusMessage = "New project created! Project ID: " + projectId;
} else {
    statusMessage = "New version added to existing project! ID: " + projectId;
}
```

## 📋 使用流程

### 场景 1：首次导出项目

1. 在 Ableton Live 中创建项目 `My Song.als`
2. 在 VST 插件中登录
3. 点击 "Export to ColDaw"
4. **结果**：
   - ✅ 创建新项目 "My Song"
   - ✅ 初始化 main 分支
   - ✅ 创建初始 commit
   - 显示："New project created!"

### 场景 2：更新现有项目

1. 修改 `My Song.als` 并保存
2. 在 VST 插件中点击 "Export to ColDaw"
3. **结果**：
   - ✅ 识别到已存在 "My Song" 项目
   - ✅ 在现有项目上创建新版本
   - ✅ 添加到版本历史
   - 显示："New version added to existing project!"

### 场景 3：同一项目不同版本

```
工作流程：
1. 创建 My Song.als -> 导出 -> 创建项目（v1）
2. 修改并保存 -> 导出 -> 添加版本（v2）
3. 再次修改 -> 导出 -> 添加版本（v3）
4. ...

在 Web 端查看：
My Song
  ├─ v1: Initial commit from VST plugin
  ├─ v2: Update from VST plugin - 2025-10-06 10:30
  └─ v3: Update from VST plugin - 2025-10-06 11:45
```

## 🔑 关键特性

### 1. 基于项目名称识别
- 通过 `.als` 文件名自动提取项目名
- 在用户的所有项目中查找同名项目
- 确保每个用户的项目名唯一

### 2. 自动版本信息
- **作者**：使用登录的用户名
- **消息**：自动生成时间戳
  - 新项目：`"Initial commit from VST plugin"`
  - 更新版本：`"Update from VST plugin - 2025-10-06 10:30:45"`

### 3. 用户隔离
- 每个用户独立的项目命名空间
- 不同用户可以有同名项目
- 基于认证 token 确保安全

## 📊 API 对比

| 功能 | `/api/projects/init` | `/api/projects/smart-import` |
|------|---------------------|----------------------------|
| 检查重复项目 | ❌ 总是创建新项目 | ✅ 智能检查 |
| 版本管理 | ❌ 每次都是新项目 | ✅ 自动创建版本 |
| 返回信息 | `isNewProject` 字段不存在 | `isNewProject: true/false` |
| 使用场景 | Web 端手动初始化 | VST 自动导入 |

## 🧪 测试步骤

### 1. 准备环境

```bash
# 确保服务器运行
cd /Users/yifan/Documents/WebD/ColDaw
./start-services.sh

# 验证服务
curl http://localhost:3001/api/health
```

### 2. 测试流程

**第一次导出**：
1. 打开 DAW，加载 ColDaw Export 插件
2. 登录：`demo@coldaw.com` / `demo123`
3. 选择或检测 .als 文件（例如：`TestProject.als`）
4. 点击 Export
5. **预期结果**：
   - 显示："New project created!"
   - 浏览器打开项目页面
   - Web 端显示新项目 "TestProject"

**第二次导出（相同文件名）**：
1. 在 DAW 中修改项目
2. 保存为相同文件名 `TestProject.als`
3. 在插件中点击 Export
4. **预期结果**：
   - 显示："New version added to existing project!"
   - 浏览器打开同一个项目
   - Web 端版本历史中新增一个版本

**第三次导出（不同文件名）**：
1. 另存为 `TestProject2.als`
2. 点击 Export
3. **预期结果**：
   - 显示："New project created!"
   - 创建新项目 "TestProject2"

## 🔍 调试信息

### 服务器日志
```bash
cd /Users/yifan/Documents/WebD/ColDaw/server
npm run dev

# 观察日志输出
# 首次导出：Creating new project "TestProject"...
# 再次导出：Project "TestProject" exists, creating new version...
```

### 检查项目列表
```bash
# 查看用户的所有项目
curl http://localhost:3001/api/projects?userId=user-1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 检查版本历史
```bash
# 查看项目详情（包含所有版本）
curl http://localhost:3001/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 注意事项

### 1. 项目名称唯一性
- 项目名称基于 `.als` 文件名（不含扩展名）
- 如果要创建多个版本，保持文件名不变
- 如果要创建新项目，使用不同的文件名

### 2. 认证要求
- 必须登录才能使用导出功能
- Token 会自动包含在请求中
- 项目自动关联到登录用户

### 3. 版本信息
- 每次导出都会记录时间戳
- 可以在 Web 端查看完整版本历史
- 支持版本回滚（通过 Web 端）

## 🎨 用户体验优化

### VST 插件状态消息
- ✅ "Logging in..." - 登录中
- ✅ "Logged in as: user@example.com" - 已登录
- ✅ "Exporting..." - 导出中
- ✅ "New project created!" - 新项目
- ✅ "New version added to existing project!" - 新版本
- ❌ "Error: ..." - 错误信息

### Web 端版本历史显示
```
TestProject
├─ Oct 6, 2025 10:00 - Initial commit from VST plugin (v1)
├─ Oct 6, 2025 10:30 - Update from VST plugin (v2)
└─ Oct 6, 2025 11:00 - Update from VST plugin (v3)
```

## 🚀 下一步增强

### 可能的未来功能
1. **手动输入版本消息**：在 VST 插件中添加消息输入框
2. **分支支持**：允许选择导出到不同分支
3. **版本标签**：为重要版本添加标签
4. **冲突检测**：如果有协作者同时修改，提示冲突
5. **自动备份**：定期自动导出保存

## 📚 相关文件

### 服务器端
- `/server/src/routes/project.ts` - 智能导入接口实现
- `/server/src/routes/version.ts` - 版本管理接口

### VST 插件
- `/vst-plugin/Source/PluginProcessor.cpp` - 主要逻辑
- `/vst-plugin/Source/PluginProcessor.h` - 头文件

### 文档
- `/vst-plugin/README.md` - 插件使用指南
- `/vst-plugin/TEST_LOGIN.md` - 登录测试指南
- `/vst-plugin/VST_LOGIN_FIX.md` - 登录问题修复

## ✅ 测试清单

- [ ] VST 插件成功登录
- [ ] 首次导出创建新项目
- [ ] 再次导出相同文件名添加新版本
- [ ] 导出不同文件名创建新项目
- [ ] Web 端显示正确的版本历史
- [ ] 浏览器自动打开正确的项目页面
- [ ] 状态消息清晰准确

---

**版本**：v1.1.0  
**更新日期**：2025-10-06  
**状态**：✅ 已实现并测试
