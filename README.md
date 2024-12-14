# NavSphere

<p align="center">
  <img src="[logo-url]" alt="NavSphere Logo" width="200"/>
</p>

<p align="center">
  <a href="https://github.com/tianyaxiang/NavSphere/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/tianyaxiang/NavSphere"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/network"><img alt="GitHub forks" src="https://img.shields.io/github/forks/tianyaxiang/NavSphere"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/tianyaxiang/NavSphere"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/tianyaxiang/NavSphere"></a>
</p>

## 📖 Overview

NavSphere is a modern web application built with Next.js for managing and organizing navigation items and categories. Perfect for creating personal navigation portals or bookmark management systems.

## ✨ Features

- 🚀 **Modern Tech Stack**: Built with Next.js 13+, React 18, and TypeScript
- 🔐 **Authentication**: GitHub OAuth integration for secure access
- 💾 **Git-based Storage**: Uses GitHub as a backend for data storage
- 🎨 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🌐 **Internationalization**: Support for multiple languages
- 🎯 **Drag and Drop**: Intuitive interface for organizing navigation items
- 🔍 **Search Functionality**: Quick access to navigation items
- 🌓 **Dark Mode**: Built-in dark mode support

## 🛠️ Tech Stack

- **Framework:** Next.js 13+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **State Management:** React Context
- **Data Storage:** GitHub API
- **Deployment:** Cloudflare Pages
- **Icons:** Heroicons

## 🚀 Quick Start

### Prerequisites

- Node.js 16.8 or later
- pnpm 7.0 or later
- GitHub account

### Installation

1. Clone the repository
```bash
git clone https://github.com/tianyaxiang/NavSphere.git
cd NavSphere
```

2. Install dependencies
```bash
pnpm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
pnpm dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# GitHub Configuration
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
```

### 1. GitHub OAuth App 配置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
   - 点击右上角头像
   - Settings
   - 左侧边栏底部 Developer settings
   - OAuth Apps
   - New OAuth App

2. 填写应用信息：
   ```
   Application name: 你的应用名称
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. 创建后获取：
   - Client ID: 显示在应用详情页
   - Client Secret: 点击 "Generate a new client secret" 生成

### 2. GitHub 仓库配置

1. 创建用于存储数据的仓库：
   - 访问 [GitHub New Repository](https://github.com/new)
   - 填写仓库名
   - 选择 Public 或 Private
   - 创建仓库

2. 获取仓库信息：
   ```
   GITHUB_OWNER: 你的 GitHub 用户名
   GITHUB_REPO: 仓库名
   ```

3. 创建 GitHub 组织（可选）：
   - 访问 [GitHub New Organization](https://github.com/organizations/new)
   - 选择免费计划
   - 填写组织名称
   - 将需要访问的用户添加到组织

### 3. 环境变量配置

```env
# GitHub OAuth App 配置
GITHUB_ID=从 OAuth App 获取的 Client ID
GITHUB_SECRET=从 OAuth App 获取的 Client Secret

# GitHub 组织和仓库配置
GITHUB_ORG=你的组织名称（如果使用组织）
GITHUB_OWNER=你的 GitHub 用户名
GITHUB_REPO=用于存储数据的仓库名
GITHUB_BRANCH=main

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=使用以下命令生成:
# openssl rand -base64 32
```

### 4. 权限配置

1. OAuth App 权限：
   - 在 OAuth App 设置页面
   - 确保 `read:org` 和 `repo` 权限被勾选

2. 仓库权限：
   - 如果是私有仓库，确保 OAuth App 有访问权限
   - 如果使用组织，确保 OAuth App 已在组织中安装

### 5. 注意事项

1. 本地开发和生产环境使用不同的 OAuth App
2. 生产环境需要更新回调 URL 为实际域名
3. 确保 `.env.local` 不被提交到 Git
4. 生产环境使用 Cloudflare Pages 的环
5. 定期轮换 Client Secret 以提高安全性

## Cloudflare Pages 部署

1. 在 Cloudflare Pages 中创建新项目
2. 连接 GitHub 仓库
3. 设置构建命令：
   ```bash
   pnpm install && pnpm build
   ```
4. 设置环境变量：
   - GITHUB_ID
   - GITHUB_SECRET
   - GITHUB_OWNER
   - GITHUB_REPO
   - GITHUB_BRANCH
   - NEXTAUTH_URL (设置为你的域名)
   - NEXTAUTH_SECRET
5. 部署项目

## 环境变量

需要配置以下环境变量：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
```

## 开发

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量

```bash
cp .env.example .env.local
```

3. 启动开发服务器

```bash
pnpm dev
```

## 数据文件

项目使用 GitHub 仓库存储数据，需要以下数据文件：

1. `app/data/db/navigation.json` - 导航数据
2. `app/data/db/resources.json` - 资源数据

这些文件会在首次提交到仓库时自动创建。

## 数据格式

### navigation.json
```json
[
  {
    "id": "string",
    "title": "string",
    "icon": "string",
    "items": [
      {
        "title": "string",
        "titleEn": "string",
        "description": "string",
        "descriptionEn": "string",
        "icon": "string",
        "href": "string"
      }
    ],
    "subCategories": [
      {
        "id": "string",
        "title": "string",
        "items": []
      }
    ]
  }
]
```

### resources.json
```json
[
  {
    "id": "string",
    "title": "string",
    "items": [
      {
        "title": "string",
        "description": "string",
        "icon": "string",
        "url": "string"
      }
    ]
  }
]
```

## 故障排除

### 导航数据加载失败

1. 检查环境变量配置
   - GITHUB_OWNER 是否正确
   - GITHUB_REPO 是否正确
   - GITHUB_BRANCH 是否正确

2. 检查仓库权限
   - 仓库是否公开
   - OAuth App 是否有正确的权限
   - Token 是否有效

3. 检查数据文件
   - navigation.json 是否存在
   - 文件格式是否正确
   - 文件路径是否正确

4. 查看控制台日志
   - 检查 API 请求是否成功
   - 检查错误信息
   - 检查返回的数据格式

## 📚 Documentation

Detailed documentation is available in the [docs](./docs) directory:

- [Authentication Setup](./docs/authentication.md)
- [Data Structure](./docs/data-structure.md)
- [Deployment Guide](./docs/deployment.md)
- [API Reference](./docs/api-reference.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Cloudflare for the deployment platform
- All contributors who have helped this project
