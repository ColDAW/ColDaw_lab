# ColDaw Export 插件使用指南

## 🎯 如何上传当前 Ableton Live 项目

### 方法 1: 自动检测（推荐用于日常工作流）⭐

这是最简单的方法，适合您正在制作音乐时使用：

1. **在 Ableton Live 中打开或创建项目**
2. **保存项目** (Cmd + S / Ctrl + S)
3. **打开 ColDaw Export 插件**
   - 在任意音轨上添加 "ColDaw Export" 插件
   - 打开插件界面
4. **点击 "Export to ColDaw" 按钮**
   - 插件会自动检测最近 5 分钟内保存的项目
   - 如果检测到项目，会显示 "Detected: [项目名]"
5. **等待上传完成**
   - 成功后自动在浏览器中打开项目

**工作原理**：
- 插件会扫描 `~/Documents/Ableton/Projects` 目录
- 查找最近 5 分钟内修改的 .als 文件
- 优先选择最新保存的文件（很可能就是您正在编辑的项目）

### 方法 2: 手动选择文件 📂

如果自动检测不准确，或者您想上传特定的项目文件：

1. **打开 ColDaw Export 插件**
2. **点击 "Select ALS File..." 按钮**
3. **在文件选择对话框中找到您的项目文件**
   - 默认会打开 Documents 目录
   - 浏览到您的项目位置
4. **选择 .als 文件**
   - 插件会显示 "File selected: [项目名]"
   - "Current Project" 区域会更新显示文件名
5. **点击 "Export to ColDaw" 按钮上传**

### 方法 3: 自动上传模式 🚀

适合频繁保存和协作的场景：

1. **勾选 "Auto-export on save" 复选框**
2. **在 Ableton Live 中正常工作**
3. **每次保存项目时**：
   - 插件会在 500ms 后自动上传
   - 无需手动点击导出按钮
   - 状态会显示 "Detected project save, auto-exporting..."

**注意事项**：
- 自动上传会在每次保存时触发
- 确保后端服务器正在运行
- 如果不想自动上传，取消勾选即可

## 📋 完整工作流示例

### 场景 1: 新项目上传

```
1. 在 Ableton Live 中创建新项目
2. 制作音乐...
3. 保存项目 (Cmd + S) → 命名为 "My Song.als"
4. 在任意音轨添加 ColDaw Export 插件
5. 打开插件界面
6. 点击 "Export to ColDaw"
7. 插件显示: "Detected: My Song"
8. 等待上传...
9. 浏览器自动打开: http://localhost:5173/project/xxx
10. 开始协作！
```

### 场景 2: 持续协作

```
1. 在 Ableton Live 中打开现有项目
2. 添加 ColDaw Export 插件（如果还没有）
3. 勾选 "Auto-export on save"
4. 正常制作音乐
5. 每次保存 (Cmd + S) 时自动上传
6. 团队成员可以实时看到更新
```

### 场景 3: 上传历史项目

```
1. 打开 Ableton Live（任意项目都可以）
2. 添加 ColDaw Export 插件
3. 点击 "Select ALS File..."
4. 浏览到历史项目位置
5. 选择要上传的 .als 文件
6. 点击 "Export to ColDaw"
7. 完成上传
```

## 🎨 插件界面说明

```
╔════════════════════════════════════════╗
║         ColDaw Export                  ║
╠════════════════════════════════════════╣
║  ┌──────────────────────────────────┐  ║
║  │   Export to ColDaw               │  ║ <- 点击上传
║  └──────────────────────────────────┘  ║
║  ┌──────────────────────────────────┐  ║
║  │   Select ALS File...             │  ║ <- 手动选择文件
║  └──────────────────────────────────┘  ║
║  ☑ Auto-export on save                 ║ <- 自动上传开关
║                                        ║
║  Status: Detected: My Song         ✓   ║ <- 状态显示
╠════════════════════════════════════════╣
║  Current Project: My Song.als          ║ <- 当前选中的项目
║                                        ║
║  Server URL:  [localhost:3000      ]   ║ <- 服务器地址
║  User ID:     [user@example.com    ]   ║ <- 用户信息
║  Author:      [John Doe            ]   ║ <- 作者名称
╚════════════════════════════════════════╝
```

### 状态指示器

| 颜色 | 含义 | 示例消息 |
|------|------|---------|
| 🔵 蓝色 | 就绪/检测到项目 | "Detected: My Song" |
| 🟢 绿色 | 成功/文件已选择 | "File selected: My Song" |
| 🟡 黄色 | 正在处理 | "Exporting to ColDaw..." |
| 🟠 橙色 | 需要操作 | "Please save your project first..." |
| 🔴 红色 | 错误 | "Error: Connection failed" |

## ⚙️ 配置说明

### Server URL
- **默认**: `http://localhost:3000`
- **说明**: ColDaw 后端服务器地址
- **何时修改**: 如果服务器运行在其他端口或远程服务器

### User ID
- **默认**: `default_user`
- **说明**: 您的用户标识（邮箱或用户名）
- **用途**: 关联项目到您的账户

### Author
- **默认**: `Ableton User`
- **说明**: 项目作者名称
- **用途**: 显示在项目信息中

## 🔧 故障排除

### 问题 1: 插件提示 "Please save your project first"

**原因**: 项目还未保存到磁盘，或插件无法检测到最近的项目文件

**解决方案**:
1. 在 Ableton Live 中保存项目 (Cmd + S)
2. 再次点击 "Export to ColDaw"
3. 或使用 "Select ALS File..." 手动选择文件

### 问题 2: 检测到错误的项目

**原因**: 可能同时打开多个项目，或其他项目最近被修改

**解决方案**:
1. 使用 "Select ALS File..." 手动选择正确的项目
2. 或者确保您要上传的项目是最近 5 分钟内保存的

### 问题 3: 上传失败 "Connection failed"

**原因**: ColDaw 后端服务器未运行或地址配置错误

**解决方案**:
1. 确认后端服务器正在运行:
   ```bash
   cd /Users/yifan/Documents/WebD/ColDaw/server
   npm run dev
   ```
2. 检查 Server URL 配置是否正确
3. 尝试在浏览器中访问: `http://localhost:3000/api/projects`

### 问题 4: 自动上传不工作

**原因**: 可能未正确保存项目，或检测间隔问题

**解决方案**:
1. 确认 "Auto-export on save" 已勾选
2. 保存项目后等待 2-3 秒
3. 查看插件状态显示是否有变化
4. 如果还是不行，手动点击 "Export to ColDaw"

## 💡 最佳实践

### 1. 项目命名规范
- 使用有意义的项目名称
- 避免特殊字符（如 `/`, `\`, `:` 等）
- 推荐格式: `Artist - Song Name v1.als`

### 2. 保存习惯
- 经常保存项目 (Cmd + S)
- 重大修改前先保存
- 启用自动上传前确保网络稳定

### 3. 协作建议
- 每次上传前先保存
- 使用有意义的版本号
- 在状态栏确认上传成功再继续工作

### 4. 性能优化
- 大型项目（>100MB）上传可能需要较长时间
- 上传时可以继续编辑，不会阻塞 DAW
- 避免在上传过程中关闭插件界面

## 🚀 高级用法

### 快捷工作流

**一键保存并上传**:
```
1. 启用 "Auto-export on save"
2. 使用 Cmd + S 保存
3. 自动上传完成后在浏览器中查看
```

**批量上传历史项目**:
```
1. 使用 "Select ALS File..." 选择第一个项目
2. 点击 "Export to ColDaw"
3. 等待完成
4. 重复选择下一个项目
```

### 与团队协作

**场景**: 多人同时编辑同一首歌

```
成员 A:
1. 编辑项目
2. 保存 (自动上传)
3. 继续工作

成员 B:
1. 在 ColDaw 网站查看更新
2. 下载最新版本
3. 在 Ableton Live 中打开
4. 编辑并上传自己的版本
```

## 📞 需要帮助？

- 查看主文档: `vst-plugin/README.md`
- 架构说明: `vst-plugin/ARCHITECTURE.md`
- 项目总结: `vst-plugin/PROJECT_SUMMARY.md`

---

**更新日期**: 2025-10-05
**版本**: 1.0.0
