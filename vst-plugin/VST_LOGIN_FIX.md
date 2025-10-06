# VST 插件登录问题修复

## 问题描述
用户在 VST 插件中输入正确的邮箱和密码后无法登录。

## 根本原因

### 问题 1：JUCE HTTP 请求方法使用不当
**原始代码问题**：
```cpp
// ❌ 错误的方式
juce::URL postUrl = url.withPOSTData(postData);
std::unique_ptr<juce::InputStream> stream(
    postUrl.createInputStream(
        true,  // doPostLikeRequest
        nullptr,
        nullptr,
        "Content-Type: application/json",  // 这个 header 会被忽略或覆盖！
        10000,
        &responseHeaders,
        &statusCode
    )
);
```

**为什么失败**：
1. `withPOSTData()` 方法会自动将 `Content-Type` 设置为 `application/x-www-form-urlencoded`
2. 在 `extraHeaders` 参数中尝试覆盖 `Content-Type` 不会生效
3. 服务器收到的 Content-Type 是 `application/x-www-form-urlencoded`，但 body 是 JSON
4. Express.js 的 `express.json()` 中间件无法解析，导致 `req.body` 为空
5. 服务器返回 400 错误："Email and password are required"

### 问题 2：旧版 JUCE API 使用
代码使用了 JUCE 的旧版 `createInputStream()` API，新版本应该使用 `InputStreamOptions`。

## 解决方案

### 修复 1：使用正确的 JUCE HTTP API

**修复后的登录代码**：
```cpp
// ✅ 正确的方式
juce::String jsonString = juce::JSON::toString(jsonBody);

// 使用 InputStreamOptions 正确设置 Content-Type
juce::URL::InputStreamOptions options = juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
    .withConnectionTimeoutMs(10000)
    .withResponseHeaders(&responseHeaders)
    .withStatusCode(&statusCode)
    .withExtraHeaders("Content-Type: application/json")  // 这会被正确设置
    .withHttpRequestCmd("POST");

std::unique_ptr<juce::InputStream> stream(
    url.createInputStream(options.withPostData(jsonString))  // 直接传递 String
);
```

**关键改进**：
1. ✅ 使用 `InputStreamOptions` 替代旧 API
2. ✅ 通过 `withExtraHeaders()` 正确设置 Content-Type
3. ✅ 使用 `withPostData(String)` 直接传递 JSON 字符串
4. ✅ 服务器能正确解析 JSON body

### 修复 2：改进文件上传代码

**修复后的上传代码**：
```cpp
// Prepare multipart data
juce::String contentType = "multipart/form-data; boundary=" + boundary;
juce::String extraHeaders = "Content-Type: " + contentType;
if (authToken.isNotEmpty())
{
    extraHeaders += "\r\nAuthorization: Bearer " + authToken;
}

juce::URL::InputStreamOptions options = juce::URL::InputStreamOptions(juce::URL::ParameterHandling::inAddress)
    .withConnectionTimeoutMs(30000)
    .withResponseHeaders(&responseHeaders)
    .withStatusCode(&statusCode)
    .withExtraHeaders(extraHeaders)
    .withHttpRequestCmd("POST");

// Convert MemoryBlock to String for POST data
juce::String postDataString(static_cast<const char*>(completePostData.getData()), 
                             completePostData.getSize());

std::unique_ptr<juce::InputStream> stream(
    url.createInputStream(options.withPostData(postDataString))
);
```

### 修复 3：改进错误处理

添加了更详细的状态码处理：
```cpp
if (stream != nullptr)
{
    juce::String response = stream->readEntireStreamAsString();
    
    if (statusCode >= 200 && statusCode < 300)
    {
        // 成功 - 解析响应
    }
    else if (statusCode == 401)
    {
        // 认证失败
        statusMessage = "Error: Authentication failed. Please login again.";
    }
    else
    {
        // 其他错误
        statusMessage = "Error: Upload failed (Status: " + juce::String(statusCode) + ")";
    }
}
```

## 测试步骤

### 1. 重新编译插件

```bash
cd /Users/yifan/Documents/WebD/ColDaw/vst-plugin
cd build
cmake --build . --config Release
```

### 2. 确保服务器运行

```bash
cd /Users/yifan/Documents/WebD/ColDaw
./start-services.sh
```

验证服务器状态：
- 后端: http://localhost:3001
- 前端: http://localhost:5173

### 3. 测试插件登录

1. 在 DAW 中加载 ColDaw Export 插件
2. 输入测试账号：
   - **Email**: `demo@coldaw.com`
   - **Password**: `demo123`
3. 点击 "Login" 按钮
4. 应该看到 "Logged in as: demo@coldaw.com"

### 4. 测试项目导出

1. 确保已登录
2. 选择一个 .als 文件或让插件自动检测
3. 点击 "Export to ColDaw"
4. 应该看到成功消息并自动在浏览器中打开项目

## 技术细节

### JUCE URL API 演变

**旧 API（已弃用）**：
```cpp
createInputStream(
    bool doPostLikeRequest,
    ProgressCallback* progressCallback,
    void* progressCallbackContext,
    String extraHeaders,
    int timeoutMs,
    StringPairArray* responseHeaders,
    int* statusCode
)
```

**新 API（推荐）**：
```cpp
InputStreamOptions options = InputStreamOptions(ParameterHandling::inAddress)
    .withConnectionTimeoutMs(10000)
    .withExtraHeaders("Content-Type: application/json")
    .withHttpRequestCmd("POST");
    
createInputStream(options.withPostData(data))
```

### HTTP Content-Type 重要性

| Content-Type | 用途 | Express.js 中间件 |
|--------------|------|-------------------|
| `application/json` | JSON 数据 | `express.json()` |
| `application/x-www-form-urlencoded` | 表单数据 | `express.urlencoded()` |
| `multipart/form-data` | 文件上传 | `multer` |

**关键点**：必须确保 Content-Type 与实际数据格式匹配，否则服务器无法解析。

## 相关文件

修改的文件：
- `/vst-plugin/Source/PluginProcessor.cpp` - 修复登录和上传逻辑

相关文档：
- `/vst-plugin/AUTHENTICATION.md` - 认证系统说明
- `/vst-plugin/BUGFIX_401.md` - 之前的 401 错误修复
- `/vst-plugin/README.md` - 插件使用指南

## 预期结果

修复后：
- ✅ 登录功能正常工作
- ✅ 服务器正确接收和解析 JSON
- ✅ Token 正确保存和使用
- ✅ 文件上传包含正确的认证头
- ✅ 错误消息更加清晰准确

## 调试技巧

如果仍有问题，可以：

1. **查看服务器日志**：
```bash
# 在 server 目录查看实时日志
cd /Users/yifan/Documents/WebD/ColDaw/server
npm run dev
# 观察请求日志
```

2. **使用网络监控工具**：
- 在 macOS 上使用 Charles Proxy 或 Wireshark
- 查看实际发送的 HTTP 请求头和 body

3. **添加调试输出**：
```cpp
// 在 PluginProcessor.cpp 中添加
DBG("JSON String: " + jsonString);
DBG("Status Code: " + String(statusCode));
DBG("Response: " + response);
```

## 总结

这个问题的核心是 **JUCE 的 HTTP API 使用方式错误**，导致 Content-Type header 无法正确设置。通过使用现代的 `InputStreamOptions` API，我们能够精确控制 HTTP 请求的各个方面，确保与服务器的通信正常。
