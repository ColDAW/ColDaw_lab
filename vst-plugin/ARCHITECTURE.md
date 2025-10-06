# ColDaw VST3 插件架构说明

## 技术栈

- **框架**: JUCE 7.0+
- **语言**: C++17
- **构建系统**: CMake 3.15+
- **插件格式**: VST3, AU, Standalone

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Ableton Live                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │           ColDaw Export Plugin (VST3)              │     │
│  │                                                     │     │
│  │  ┌──────────────┐         ┌──────────────┐        │     │
│  │  │ GUI Editor   │◄────────┤ Processor    │        │     │
│  │  │              │         │              │        │     │
│  │  │ - 导出按钮   │         │ - 文件检测    │        │     │
│  │  │ - 设置界面   │         │ - 文件监听    │        │     │
│  │  │ - 状态显示   │         │ - HTTP 上传   │        │     │
│  │  └──────────────┘         └──────┬───────┘        │     │
│  │                                   │                │     │
│  └───────────────────────────────────┼────────────────┘     │
│                                      │                      │
└──────────────────────────────────────┼──────────────────────┘
                                       │
                                       │ HTTP POST
                                       │ multipart/form-data
                                       ▼
                    ┌──────────────────────────────────┐
                    │     ColDaw Server (Node.js)      │
                    │                                  │
                    │  POST /api/projects/init         │
                    │  - 接收 .als 文件                 │
                    │  - 解析项目数据                   │
                    │  - 存储到数据库                   │
                    │  - 返回 projectId                │
                    └──────────────────┬───────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────┐
                    │   ColDaw Web Client (React)      │
                    │                                  │
                    │  /project/{projectId}            │
                    │  - 显示项目详情                   │
                    │  - 实时协作编辑                   │
                    │  - 版本历史                      │
                    └──────────────────────────────────┘
```

## 核心组件

### 1. ColDawExportProcessor (PluginProcessor.cpp)

**职责**:
- 管理插件状态
- 文件系统监听
- HTTP 通信
- 设置持久化

**关键方法**:
```cpp
void exportToColDaw()              // 主导出函数
void detectAbletonProject()        // 自动检测项目文件
void uploadProjectFile(file)       // 上传文件到服务器
void timerCallback()               // 定时检查文件变化
void openProjectInBrowser(id)      // 打开浏览器
```

**状态管理**:
- `exporting`: 是否正在导出
- `autoExport`: 是否启用自动导出
- `currentProjectFile`: 当前项目文件
- `lastModificationTime`: 上次修改时间

### 2. ColDawExportEditor (PluginEditor.cpp)

**职责**:
- 用户界面渲染
- 用户交互处理
- 状态显示更新

**UI 组件**:
```cpp
TextButton exportButton           // 导出按钮
TextButton selectFileButton       // 选择文件按钮
ToggleButton autoExportToggle     // 自动导出开关
Label statusLabel                 // 状态显示
TextEditor serverUrlEditor        // 服务器地址输入
TextEditor userIdEditor           // 用户 ID 输入
TextEditor authorEditor           // 作者输入
```

## 工作流程

### 手动导出流程

```
用户点击按钮
    ↓
检测 Ableton 项目文件
    ↓
读取 .als 文件内容
    ↓
构建 multipart/form-data
    ↓
POST 到 /api/projects/init
    ↓
解析 JSON 响应
    ↓
提取 projectId
    ↓
在浏览器中打开项目
```

### 自动导出流程

```
定时器触发 (每 2 秒)
    ↓
检查文件修改时间
    ↓
文件已修改？
    ↓ (是)
等待 500ms (确保文件写入完成)
    ↓
执行导出流程
```

### 文件检测逻辑

```cpp
// 方法 1: 扫描默认目录
~/Documents/Ableton/Projects
    ↓
查找所有 .als 文件
    ↓
按修改时间排序
    ↓
选择最近的文件

// 方法 2: 用户手动选择
用户点击 "Select ALS File..."
    ↓
打开文件选择对话框
    ↓
用户选择 .als 文件
    ↓
更新当前文件路径
```

## HTTP 请求详解

### 请求格式

```http
POST /api/projects/init HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----ColDawBoundary12345

------ColDawBoundary12345
Content-Disposition: form-data; name="projectName"

MyProject
------ColDawBoundary12345
Content-Disposition: form-data; name="author"

John Doe
------ColDawBoundary12345
Content-Disposition: form-data; name="userId"

user@example.com
------ColDawBoundary12345
Content-Disposition: form-data; name="alsFile"; filename="MyProject.als"
Content-Type: application/octet-stream

[二进制文件内容]
------ColDawBoundary12345--
```

### 响应格式

```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "versionId": "660e8400-e29b-41d4-a716-446655440001",
  "message": "Project initialized successfully",
  "data": {
    "name": "MyProject",
    "tempo": 120,
    "tracks": [...]
  }
}
```

## 数据流

```
.als 文件 (Ableton Live)
    ↓
MemoryBlock (JUCE)
    ↓
Multipart Form Data
    ↓
HTTP POST Request
    ↓
Express.js Server
    ↓
Multer 中间件
    ↓
ALS Parser
    ↓
JSON 数据
    ↓
PostgreSQL/SQLite
    ↓
React 前端
```

## 线程模型

- **主线程**: GUI 渲染和用户交互
- **音频线程**: 音频处理 (本插件为直通)
- **定时器线程**: 文件监听 (每 2 秒)
- **网络线程**: HTTP 请求 (JUCE 内部管理)

## 错误处理

```cpp
try {
    // 检查文件存在
    if (!file.exists()) 
        throw "File not found";
    
    // 读取文件
    if (!file.loadFileAsData(data))
        throw "Could not read file";
    
    // 发送请求
    auto stream = url.createInputStream(...);
    if (!stream)
        throw "Connection failed";
    
    // 解析响应
    auto json = JSON::parse(response);
    if (!json.hasProperty("projectId"))
        throw "Invalid response";
        
} catch (const char* error) {
    statusMessage = "Error: " + String(error);
    exporting = false;
}
```

## 性能优化

1. **异步上传**: 使用 JUCE URL 类的异步功能
2. **文件缓存**: 记录文件修改时间，避免重复读取
3. **定时器间隔**: 2 秒检查一次，平衡响应速度和 CPU 使用
4. **内存管理**: 使用 MemoryBlock 高效处理大文件
5. **状态缓存**: 保存设置到插件状态，避免重复输入

## 安全考虑

1. **文件验证**: 仅允许 .als 文件
2. **大小限制**: 可以在上传前检查文件大小
3. **超时设置**: HTTP 请求 10 秒超时
4. **错误处理**: 捕获所有异常，避免崩溃
5. **路径验证**: 防止路径遍历攻击

## 扩展性

### 未来功能

1. **增量同步**
```cpp
class DeltaSyncManager {
    void calculateDelta(oldFile, newFile);
    void uploadDelta(delta);
};
```

2. **实时协作**
```cpp
class RealtimeCollaboration {
    void connectWebSocket();
    void sendCursorPosition();
    void receiveCursorUpdates();
};
```

3. **冲突解决**
```cpp
class ConflictResolver {
    void detectConflicts(local, remote);
    void mergeTracks(localTrack, remoteTrack);
    void showConflictUI();
};
```

4. **压缩支持**
```cpp
void compressFile(file) {
    // 使用 zlib 压缩
    auto compressed = GZIPCompressorOutputStream::compress(data);
}
```

## 调试技巧

### 日志输出
```cpp
DBG("Exporting file: " + file.getFullPathName());
DBG("Server URL: " + serverUrl);
DBG("Response: " + response);
```

### 断点位置
- `exportToColDaw()` 开始处
- `uploadProjectFile()` HTTP 请求前
- `timerCallback()` 文件检测处

### 测试命令
```bash
# 测试服务器连接
curl -X POST http://localhost:3000/api/projects/parse-als \
  -F "alsFile=@test.als"

# 查看插件日志
tail -f ~/Library/Logs/Ableton/Live.log
```

## 构建变体

### Debug 构建
```bash
cmake .. -DCMAKE_BUILD_TYPE=Debug
# 包含调试符号，可以使用 LLDB/GDB
```

### Release 构建
```bash
cmake .. -DCMAKE_BUILD_TYPE=Release
# 优化性能，去除调试符号
```

### 仅 VST3
```cmake
FORMATS VST3
```

### 所有格式
```cmake
FORMATS VST3 AU Standalone
```

## 兼容性

- **Ableton Live**: 10, 11, 12
- **Logic Pro**: ✓ (AU)
- **FL Studio**: ✓ (VST3)
- **Cubase**: ✓ (VST3)
- **Reaper**: ✓ (VST3)
- **Studio One**: ✓ (VST3)

## 文件大小

- 源代码: ~20 KB
- 编译后 VST3: ~2-5 MB (取决于平台)
- 依赖 JUCE: ~50 MB (编译时)

## 资源链接

- JUCE 文档: https://docs.juce.com
- VST3 SDK: https://github.com/steinbergmedia/vst3sdk
- CMake 文档: https://cmake.org/documentation
- 项目仓库: https://github.com/yourusername/coldaw
