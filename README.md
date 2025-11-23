# NSFWJS API

一个可以部署到 Vercel 的 NSFW 内容检测 API，使用 nsfwjs 库。采用 Arco Design 设计系统，提供美观流畅的用户界面。

## ✨ 功能特性

### 核心功能
- 🔍 检测图片是否包含 NSFW（不适合工作场合）内容
- 🎯 支持多种图片输入方式：URL、文件上传、拖拽、粘贴
- 📊 返回多个分类的概率（Drawing, Hentai, Neutral, Porn, Sexy）
- ⚡ 实时显示检测结果和处理时间
- 🛡️ 智能风险评估和安全提示

### 界面特性
- 🎨 基于 Arco Design 的现代化界面
- 📱 完整的响应式设计，适配桌面、平板、手机
- 🌈 丰富的动画效果和交互反馈
- ⌨️ 键盘快捷键支持（回车键提交）
- 📋 剪贴板粘贴图片支持
- 🔄 实时图片预览和加载状态
- ♿ 无障碍优化（支持减少动画设置）

## 部署到 Vercel

### 1. 安装 Vercel CLI（可选）

```bash
npm install -g vercel
```

### 2. 部署

在项目根目录运行：

```bash
vercel
```

或者直接通过 Vercel 网站导入 GitHub 仓库。

## API 使用方法

### 端点

```
POST /api/classify
```

### 请求体

```json
{
  "image": "图片URL或base64数据"
}
```

### 示例

#### 使用图片 URL

```bash
curl -X POST https://your-deployment.vercel.app/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/image.jpg"
  }'
```

#### 使用 Base64

```bash
curl -X POST https://your-deployment.vercel.app/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

### 响应格式

```json
{
  "success": true,
  "predictions": [
    {
      "className": "Neutral",
      "probability": 0.95
    },
    {
      "className": "Drawing",
      "probability": 0.03
    },
    {
      "className": "Sexy",
      "probability": 0.01
    },
    {
      "className": "Hentai",
      "probability": 0.005
    },
    {
      "className": "Porn",
      "probability": 0.005
    }
  ]
}
```

## 本地开发

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 打开测试界面，API 端点在 `http://localhost:3000/api/classify`。

## 📱 使用方法

### Web 界面

1. **输入图片 URL**：在输入框中粘贴图片链接，按回车键或点击"开始检测"
2. **上传本地图片**：点击上传区域选择文件，或直接拖拽图片到上传区域
3. **粘贴图片**：复制图片后按 `Ctrl+V`（Windows）或 `Cmd+V`（Mac）直接粘贴
4. **查看结果**：检测完成后自动显示分类结果和风险评估

### API 调用

通过 API 直接调用检测服务：

```bash
curl -X POST https://your-domain.vercel.app/api/classify \
  -H "Content-Type: application/json" \
  -d '{"image": "https://example.com/image.jpg"}'
```

## 分类说明

- **Neutral**: 正常内容
- **Drawing**: 绘画/插画
- **Sexy**: 性感内容
- **Hentai**: 成人动画/漫画
- **Porn**: 色情内容

## 注意事项

- 首次调用可能需要较长时间加载模型（约 5-10 秒）
- Vercel 的 Serverless Functions 有 10 秒超时限制（免费版）
- 建议对图片大小进行限制以提高性能
- 模型会在首次调用时加载并缓存
- 支持的图片格式：JPG、PNG、GIF、WebP 等

## 🎨 界面优化

### 桌面端（≥1200px）
- 大卡片布局，48px 内边距
- 最大容器宽度 900px
- 完整的悬停动画效果

### 平板端（768px-1199px）
- 中等卡片布局，36px 内边距
- 优化的触摸目标尺寸

### 移动端（<768px）
- 紧凑布局，减少边距
- 垂直排列的结果卡片
- 取消不必要的悬停效果
- 优化的触摸反馈

### 横屏模式
- 压缩垂直空间
- 调整预览图片高度
- 优化滚动体验

## 🚀 性能优化

- ✅ 防抖处理 URL 输入（500ms）
- ✅ 图片预加载和错误处理
- ✅ 请求超时控制（30秒）
- ✅ 防止重复提交
- ✅ CSS 动画硬件加速（will-change）
- ✅ 减少动画支持（prefers-reduced-motion）
- ✅ 触摸设备优化（hover: none）

## 🛠️ 技术栈

- **前端框架**：原生 HTML/CSS/JavaScript
- **UI 组件库**：Arco Design
- **后端运行时**：Node.js（Vercel Serverless Functions）
- **AI 模型**：NSFWJS
- **深度学习**：TensorFlow.js

## 许可证

MIT
