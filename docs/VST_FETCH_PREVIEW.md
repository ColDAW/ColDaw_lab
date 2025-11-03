# VST Bridge - Fetch & Preview 功能

## 概述
在原有的 VST Bridge 基础上,增加了两阶段更新流程:Fetch(获取预览) → Confirm(确认应用)。

## 功能说明

### 原有流程
1. 网页端点击 "VST Bridge" 发送更新通知
2. VST 插件检测到更新后显示 "Confirm Updates" 按钮
3. 点击按钮直接下载并应用更新

### 新流程
1. 网页端点击 "VST Bridge" 发送更新通知
2. VST 插件检测到更新后显示 **"Fetch Updates"** 按钮(蓝色)
3. 点击 "Fetch Updates" 后:
   - 下载更新文件到临时目录
   - 解析文件生成预览信息(版本 ID、文件大小、下载时间)
   - 在界面上显示预览信息
   - 按钮变为 **"Confirm Updates"**(绿色)
4. 查看预览信息后,点击 "Confirm Updates":
   - 使用已下载的文件替换当前项目
   - 清理临时文件
   - 重置所有更新状态

## 技术实现

### 新增状态变量
```cpp
bool updatePreviewed = false;          // 是否已预览更新
juce::String updatePreview = "";       // 预览信息文本
juce::File downloadedUpdateFile;       // 已下载的更新文件
```

### 新增方法

#### `fetchWebUpdate()`
- 下载更新文件到临时目录(`coldaw_preview_[versionId].als`)
- 生成预览信息:
  - 版本 ID(前8位)
  - 文件大小(KB)
  - 下载时间戳
- 设置 `updatePreviewed = true`
- 更新状态消息

#### `hasPreviewedUpdate()`
- 返回是否已有预览的更新

#### `getUpdatePreview()`
- 返回预览信息文本

#### `confirmWebUpdate()` (修改)
- 检查是否有预览文件:
  - 有:直接使用预览文件,跳过下载
  - 无:执行原下载流程
- 应用更新后清理所有状态

### UI 更新

#### 按钮状态
- **未预览**: "FETCH UPDATES" (蓝色 #4a90e2)
- **已预览**: "CONFIRM UPDATES" (绿色 successColor)

#### 预览标签
- `updatePreviewLabel`: 显示预览信息
- 位于 "Fetch/Confirm Updates" 按钮下方
- 灰色背景,80px 高度
- 仅在已预览时显示

### 流程改进

#### checkForWebUpdates() 修改
原先:检测到更新后自动显示 "Confirm Updates"
现在:检测到更新后显示 "Fetch Updates",提示用户先预览

## 使用场景

### 场景 1: 网页推送更新
1. 在网页端编辑项目
2. 点击 Export → VST Bridge
3. 在 DAW 的 VST 插件中看到 "Fetch Updates" 按钮(蓝色)
4. 点击按钮查看预览信息
5. 确认后点击 "Confirm Updates" 应用

### 场景 2: VST 主动拉取
1. 在 DAW 中打开 VST 插件
2. 插件自动检测网页端是否有更新
3. 如有更新,显示 "Fetch Updates" 按钮
4. 用户可以先 Fetch 查看,再决定是否 Confirm

## 安全性提升

- 用户可以在应用更新前查看更新信息
- 避免误操作导致当前工作丢失
- 临时文件存储在系统临时目录,不污染项目目录
- 应用更新后自动清理临时文件

## 文件位置

### 修改的文件
- `vst-plugin/Source/PluginProcessor.h` - 添加方法和状态变量声明
- `vst-plugin/Source/PluginProcessor.cpp` - 实现 fetch 和修改 confirm 逻辑
- `vst-plugin/Source/PluginEditor.h` - 添加预览标签
- `vst-plugin/Source/PluginEditor.cpp` - UI 更新和按钮事件处理

### 后端 API(无需修改)
现有的 VST Bridge API 无需改动,完全兼容:
- `POST /api/projects/:id/notify-vst` - 发送更新通知
- `GET /api/projects/:id/check-vst-notification/:userId` - 检查通知
- `POST /api/projects/:id/confirm-vst-update/:userId` - 下载更新文件

## 测试建议

1. **正常流程测试**:
   - 网页端发送更新 → VST Fetch → 查看预览 → Confirm 应用

2. **取消测试**:
   - Fetch 后不 Confirm,检查临时文件是否存在
   - 重新 Fetch,检查是否覆盖旧的预览

3. **错误处理测试**:
   - 网络中断时 Fetch
   - 磁盘空间不足时 Fetch
   - 预览文件被手动删除后 Confirm

4. **UI 状态测试**:
   - 按钮文字和颜色切换
   - 预览标签显示/隐藏
   - 状态消息更新

## 已知限制

1. **预览信息有限**: 当前只显示基本元数据,未解析 .als 文件内部内容
2. **单一预览**: 同一时间只能预览一个更新,新的 Fetch 会覆盖旧的
3. **临时文件管理**: 如果 VST 插件崩溃,临时文件可能残留在系统临时目录

## 未来改进方向

1. **深度预览**: 解析 .als 文件,显示:
   - 音轨数量变化
   - 插件列表变化
   - 版本消息/提交日志

2. **多版本预览**: 支持预览多个历史版本并选择

3. **差异对比**: 显示当前版本和更新版本的具体差异

4. **回滚功能**: Confirm 前自动备份当前版本,支持一键回滚
