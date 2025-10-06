# VST 导入流程 - 完整实现文档

## 🎯 实现目标

VST 导入流程与网页导入流程完全一致，使用前端的 `pendingData` 机制，显示修改差异，通过 MenuBar 的 Push 按钮提交。

## 📋 工作流程

```
1. 用户在 VST 插件中点击 "Export to ColDaw"
   ↓
2. VST 上传 .als 文件到 /api/projects/smart-import
   ↓
3. 服务器检测项目是否存在
   ├─ 项目不存在 → 创建新项目和初始版本
   └─ 项目存在 → 保存临时文件并返回数据
   ↓
4. VST 打开浏览器: http://localhost:5174/project/{projectId}?from=vst
   ↓
5. 前端检测 ?from=vst 参数
   ↓
6. 调用 /api/projects/:projectId/vst-import 获取临时文件数据
   ↓
7. 设置 pendingData (和网页导入相同)
   ├─ 激活 MenuBar 的 Push 按钮
   ├─ 显示橙色提示条
   └─ ArrangementView 自动显示 clips 差异
   ↓
8. 用户审查修改
   ├─ 绿色边框 = 新增的 clips
   ├─ 黄色边框 = 修改的 clips
   └─ 红色边框 = 删除的 clips
   ↓
9. 用户点击 MenuBar 的 Push 按钮
   ↓
10. 提交版本 (使用服务器上的临时文件)
    ↓
11. 清理: 删除临时文件，清除 pendingData，刷新页面
```

## 🔧 技术实现

### 后端

#### 1. Smart Import API (`/api/projects/smart-import`)
**文件**: `/server/src/routes/project.ts`

```typescript
// 项目存在时的处理
if (existingProject) {
  const projectId = existingProject.id;
  const dataDir = path.join(__dirname, '..', '..', 'projects', projectId);
  
  // 保存到临时位置，文件名包含用户ID和时间戳
  const tempFileName = `vst_import_${userId}_${Date.now()}.als`;
  const tempFilePath = path.join(dataDir, tempFileName);
  
  fs.copyFileSync(req.file.path, tempFilePath);
  fs.unlinkSync(req.file.path);

  res.json({
    projectId,
    isNewProject: false,
    hasPendingChanges: true,
    tempFileName,  // 返回临时文件名
    message: 'Project exists. File saved temporarily for import.',
    data: alsData,  // 返回解析的数据
  });
}
```

#### 2. Get VST Import API (`/api/projects/:projectId/vst-import`)
**文件**: `/server/src/routes/project.ts`

```typescript
router.get('/:projectId/vst-import', requireAuth, async (req, res) => {
  // 验证权限
  // 查找最新的 vst_import_{userId}_*.als 文件
  // 解析并返回数据
  res.json({
    success: true,
    data: alsData,
    tempFileName: mostRecent.name,
  });
});
```

#### 3. Commit Version with Temp File (`/api/versions/:projectId/commit`)
**文件**: `/server/src/routes/version.ts`

```typescript
router.post('/:projectId/commit', upload.single('alsFile'), async (req, res) => {
  const { fromVST, tempFileName } = req.body;
  
  if (fromVST === 'true' && tempFileName) {
    // 使用服务器上的临时文件创建版本
    const tempFilePath = path.join(dataDir, tempFileName);
    const alsData = await ALSParser.parseFile(tempFilePath);
    
    // 创建版本...
    
    // 清理临时文件
    fs.unlinkSync(tempFilePath);
  }
});
```

### 前端

#### 1. Store 状态管理
**文件**: `/client/src/store/useStore.ts`

```typescript
interface AppState {
  pendingData: ProjectData | null;  // 待推送的数据
  hasPendingChanges: boolean;       // 是否有待推送的修改
  vstTempFileName: string | null;   // VST导入的临时文件名
  
  setPendingData: (data: ProjectData | null) => void;
  setVSTTempFileName: (fileName: string | null) => void;
  clearPendingChanges: () => void;  // 清理所有待推送状态
}
```

#### 2. ProjectPage 检测 VST 导入
**文件**: `/client/src/pages/ProjectPage.tsx`

```typescript
useEffect(() => {
  loadProject();
  
  // 检测是否是 VST 导入
  const fromVST = searchParams.get('from') === 'vst';
  if (fromVST && projectId) {
    loadVSTImport(projectId);
  }
}, [projectId, user, authLoading]);

const loadVSTImport = async (projId: string) => {
  const result = await projectApi.getVSTImport(projId);
  
  if (result.success && result.data) {
    setPendingData(result.data);
    setVSTTempFileName(result.tempFileName);
    showAlert('VST import loaded! Review and click Push to commit.');
  }
};
```

#### 3. MenuBar Push 功能
**文件**: `/client/src/components/MenuBar.tsx`

```typescript
const handlePush = async () => {
  if (vstTempFileName) {
    // VST 导入：使用服务器上的临时文件
    const formData = new FormData();
    formData.append('fromVST', 'true');
    formData.append('tempFileName', vstTempFileName);
    formData.append('message', message);
    formData.append('author', user.username);
    
    fetch(`/api/versions/${projectId}/commit`, {
      method: 'POST',
      body: formData,
    });
  } else if (importedFile) {
    // 网页导入：上传本地文件
    await versionApi.commitVersion(projectId, importedFile, ...);
  }
  
  clearPendingChanges();  // 清理 pendingData 和 vstTempFileName
};
```

#### 4. 橙色提示条
**文件**: `/client/src/pages/ProjectPage.tsx`

```tsx
{hasPendingChanges && (
  <PendingChangesBar>
    <span>
      You have pending changes. Click Push button in the menu bar to commit.
    </span>
  </PendingChangesBar>
)}
```

#### 5. ArrangementView 差异显示
**文件**: `/client/src/components/ArrangementView.tsx`

自动检测 `hasPendingChanges` 和 `pendingData`，计算 clips 差异：
- 绿色边框：新增的 clips
- 黄色边框：修改的 clips
- 红色边框：删除的 clips

### VST 插件

#### 文件: `/vst-plugin/Source/PluginProcessor.cpp`

```cpp
// 解析响应
bool hasPendingChanges = obj->hasProperty("hasPendingChanges") &&
                         obj->getProperty("hasPendingChanges");

// 打开浏览器并传递参数
openProjectInBrowser(projectId, hasPendingChanges);

void ColDawExportProcessor::openProjectInBrowser(
    const juce::String& projectId, 
    bool fromVST
) {
    juce::String webUrl = "http://localhost:5174/project/" + projectId;
    if (fromVST) {
        webUrl += "?from=vst";
    }
    juce::URL(webUrl).launchInDefaultBrowser();
}
```

## 📁 文件结构

```
server/projects/<projectId>/
├── vst_import_<userId>_<timestamp>.als  # 临时文件（Push后删除）
├── <versionId>.json                     # 已提交的版本数据
└── <versionId>.als                      # 已提交的原始文件
```

## 🎨 UI 行为

### 1. 橙色提示条
- 位置：MenuBar 下方
- 样式：橙色背景，白色文字
- 内容：简单提示"You have pending changes. Click Push button..."
- 无按钮（Push 按钮在 MenuBar 中）

### 2. MenuBar Push 按钮
- 状态：`hasPendingChanges` 为 true 时激活
- 点击：显示提交信息输入框
- 提交后：清除 pendingData，刷新页面

### 3. ArrangementView
- 自动显示 clips 差异
- 颜色编码：绿色（新增）、黄色（修改）、红色（删除）

## ✅ 与网页导入的统一性

| 功能 | 网页导入 | VST导入 | 状态 |
|------|---------|---------|------|
| 数据存储 | `pendingData` | `pendingData` | ✅ 一致 |
| Push 按钮位置 | MenuBar | MenuBar | ✅ 一致 |
| 橙色提示条 | 显示 | 显示 | ✅ 一致 |
| Clips 差异显示 | 自动显示 | 自动显示 | ✅ 一致 |
| 提交流程 | `commitVersion` | `commitVersion` (fromVST) | ✅ 一致 |
| 清理逻辑 | `clearPendingChanges` | `clearPendingChanges` | ✅ 一致 |

## 🔄 清理旧代码

已移除的功能：
- ❌ `PendingChange` 数据库接口（保留在数据库层但不使用）
- ❌ `/api/projects/:projectId/pending-changes` 端点（保留但不调用）
- ❌ `/api/projects/:projectId/push-pending/:pendingId` 端点（保留但不调用）
- ❌ ProjectPage 中的 `pendingChanges` state 和 `handlePushPendingChange`

保留的 API（以防将来需要）：
- `projectApi.getPendingChanges()` - 未被调用
- `projectApi.pushPendingChange()` - 未被调用

## 🚀 测试步骤

1. **创建初始项目**
   - 在网页端登录
   - 创建新项目 "Test Project"

2. **VST 导出（第二次）**
   - 在 Ableton Live 中打开相同项目
   - 使用 VST 插件登录
   - 点击 "Export to ColDaw"
   - 输入相同的项目名 "Test Project"

3. **验证前端**
   - 浏览器自动打开项目页面
   - 看到橙色提示条："You have pending changes..."
   - ArrangementView 显示 clips 差异（绿色/黄色/红色边框）
   - MenuBar 的 Push 按钮变为可用

4. **提交修改**
   - 点击 Push 按钮
   - 输入提交信息："Update from VST"
   - 提交成功后：
     - 橙色提示条消失
     - Push 按钮变为不可用
     - 版本历史显示新版本

## 📊 性能优化

- ✅ 临时文件按用户隔离（避免冲突）
- ✅ 临时文件在 Push 后立即删除（节省空间）
- ✅ 前端只在检测到 `?from=vst` 时才获取数据（避免不必要的请求）
- ✅ 复用现有的 diff 计算逻辑（无重复代码）

## 🐛 错误处理

1. **临时文件不存在**
   - 返回 404，提示"Please re-import from VST"
   
2. **无权限访问**
   - 返回 403，提示"Unauthorized"
   
3. **VST 导入数据未找到**
   - 静默失败（不显示错误，因为这是可选的）

## 📝 总结

此实现完全统一了 VST 导入和网页导入的流程，使用相同的 UI 组件、状态管理和用户交互模式。用户无需区分数据来源，都使用相同的方式审查和提交修改。
