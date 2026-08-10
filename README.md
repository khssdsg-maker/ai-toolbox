<div align="center">

# 🧰 AI万能工具箱

**AI 时代的超级工具箱** —— 找工具、转文件、装驱动、看视频，一个入口全搞定

[🌐 宣传主页](https://khssdsg-maker.github.io/ai-toolbox/) · [⬇ 下载最新版](https://github.com/khssdsg-maker/ai-toolbox/releases/latest) · [💬 反馈问题](https://github.com/khssdsg-maker/ai-toolbox/issues)

</div>

---

## ⬇ 下载安装（Windows）

| 方式 | 说明 |
|---|---|
| **一键下载** | [点击这里下载安装包](https://github.com/khssdsg-maker/ai-toolbox/releases/latest)（约 208 MB，Win10/11 64位） |
| **安装步骤** | 下载后双击运行 → 选择安装位置 → 完成后桌面出现"AI万能工具箱"图标 |
| **更新方式** | 有新版本时下载新安装包直接覆盖安装，收藏和设置自动保留 |

---



面向普通用户的综合工具平台，基于 Next.js 开发，可打包为 Windows 桌面应用（Electron）。

## 功能模块

### 1. AI 工具导航中心（首页）
汇集全球优质 AI 工具，覆盖 7 大分类：AI 聊天对话、AI Agent 平台、AI 办公、AI 设计绘画、AI 编程、AI 视频、AI 音频音乐。支持搜索、中英文切换、深色模式。

### 2. 视频合集
主流视频平台入口（B站、YouTube、抖音、快手等）+ 视频创作工具 + AI 视频生成工具。
- 精选视频：带封面缩略图，点击即可在应用内播放（B站/YouTube）
- 收藏功能：看视频时一键收藏，自动识别视频来源、提取标题和封面，重复收藏自动拦截

### 3. 文件格式转换中心
全部本地转换，文件不上传：
- 图片格式转换（PNG / JPG / WebP / BMP / AVIF）
- PDF 和 Word 互转
- Markdown 和 HTML 互转
- JSON / CSV / YAML 互转
- JSON 格式化 / Base64 / URL 编解码

### 4. 网络工具箱
IP 查询、DNS 查询、HTTP 状态检测、端口检测、URL 解析、User Agent 解析。

### 5. 驱动工具中心
官方驱动下载入口汇总，共 4 大分类：
- 品牌电脑驱动：联想、戴尔、惠普、华为、华硕、宏碁、微星
- 硬件厂商驱动：NVIDIA、AMD、Intel、Realtek
- 键鼠外设驱动：前行者、迈从、英菲克、罗技、雷蛇、雷柏、达尔优、双飞燕
- 驱动管理工具：驱动精灵、驱动总裁、SDI

### 6. 应用内浏览器
带标签页的内置浏览器，点击工具链接可选：应用内打开 / 系统默认浏览器 / 指定浏览器（Chrome、Edge、Firefox、360、QQ 等），可记住选择。

### 7. 其他
- 收藏页：统一管理收藏的视频和链接，支持播放、删除
- 设置：主题外观（浅色/深色/跟随系统）、界面语言、链接打开方式、清空收藏
- 双语支持：简体中文 / English 一键切换

## 技术栈

| 层面 | 技术 |
|---|---|
| 前端框架 | Next.js 15 + TypeScript |
| 样式 | Tailwind CSS v4 |
| UI 组件 | shadcn/ui + Radix UI |
| 桌面打包 | Electron + electron-builder |
| 文档转换 | pdfjs-dist / mammoth / marked / turndown / jsPDF |
| 安装程序 | NSIS |

## 使用方式

### 普通用户
下载 AI万能工具箱-安装程序.exe，双击安装，桌面会出现"AI万能工具箱"图标，点开即用。

### 开发者

    # 安装依赖
    pnpm install

    # 复制环境变量模板并填写
    cp .env.example .env

    # 开发模式（网页版），打开 http://localhost:3000
    pnpm dev

    # 开发模式（桌面应用）：先启动网页服务，再执行
    npx cross-env NODE_ENV=development npx electron .

    # 构建桌面安装包（产物在 dist-electron/ 目录）
    powershell -ExecutionPolicy Bypass -File update-app.ps1

## 环境变量说明

复制 .env.example 为 .env 后填写（桌面应用模式下除 GA_ID 外均可留空）：

| 变量 | 说明 |
|---|---|
| GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET | GitHub OAuth（后台管理登录用） |
| GITHUB_OWNER / GITHUB_REPO | 投稿功能使用的 GitHub 仓库 |
| GITHUB_PAT | GitHub 个人访问令牌（投稿用） |
| NEXTAUTH_URL | NextAuth 回调地址 |
| AUTH_SECRET | NextAuth 加密密钥 |
| GA_ID | Google Analytics 统计 ID（可选） |

## 项目结构

    src/
    ├── app/                 # 页面路由
    │   ├── page.tsx         # 首页（AI工具导航）
    │   ├── videos/          # 视频合集
    │   ├── convert/         # 文件转换中心
    │   ├── tools/           # 网络工具箱
    │   ├── drivers/         # 驱动工具中心
    │   ├── favorites/       # 我的收藏
    │   └── admin/           # 后台管理
    ├── components/          # 组件
    ├── lib/                 # 工具库（收藏/转换器等）
    ├── styles/              # 全局样式
    └── navsphere/content/   # 导航数据（JSON）
    electron/                # 桌面应用（主进程/标签栏/预加载）

## 桌面应用特性

- 内置静态服务器，安装后核心功能离线可用
- 应用启动自动清缓存，样式永不丢失
- 一键更新脚本：重新构建 → 打包 → 静默覆盖安装 → 自动打开

## 许可

本项目基于 NavSphere 开源项目二次开发。
