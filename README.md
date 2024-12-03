This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

建了一个新的 Next.js 项目，使用 npx create-next-app 命令时，默认生成的目录结构大致如下：

my-next-app/
├── app/                     # 新的应用目录
│   ├── layout.js            # 根布局文件，定义页面的布局结构
│   ├── page.js              # 根页面文件，通常对应网站的首页
│   ├── about/               # 子目录，支持嵌套路由
│   │   └── page.js          # 关于页面
│   ├── blog/                # 另一个子目录，示例博客页面
│   │   ├── layout.js        # 特定于该路由的布局文件
│   │   └── page.js          # 博客列表页
│   └── not-found.js         # 错误边界页面，指定当某个页面没有找到时渲染的内容
├── public/                  # 静态资源文件夹
├── styles/                  # 样式文件夹
├── next.config.js           # Next.js 配置文件
├── package.json             # 项目依赖与配置文件
└── tsconfig.json            # TypeScript 配置（如果使用）


重要目录和文件解析
从 Next.js 13 开始，Next.js 引入了一个新的 app/ 目录，逐渐替代了传统的 pages/ 目录，以支持更灵活和现代的路由与布局机制。
这个变动是 Next.js 在 React Server Components 和 渐进式渲染（Incremental Static Regeneration, ISR）功能上的一部分，旨在提供更强的开发体验和更好的性能优化。

新的 app/ 目录（Next.js 13+）
在 Next.js 13 中，你可以使用 app/ 目录来替代传统的 pages/ 目录。虽然 pages/ 仍然可以使用（作为一种回退选项），但是新功能的最佳实践是使用 app/ 目录来组织路由、布局、页面和组件。

app/ 目录的特点
文件系统路由：和 pages/ 目录一样，app/ 目录仍然基于文件系统生成路由，但它引入了更多的灵活性和控制力。你可以更容易地定义嵌套路由、布局、错误边界等。

支持布局（Layouts）：app/ 目录的最大亮点之一是它允许你使用 布局组件（layout.js 或 layout.tsx）来共享 UI 状态和布局结构。这意味着你可以在应用的不同部分共享布局和 UI，而不必重新渲染整个页面。

服务端渲染（SSR）和客户端渲染的结合：你可以选择在页面级别启用服务端渲染（SSR）或静态生成（SSG），并在不同的路由上根据需要进行配置。
React Server Components 和流式渲染的支持将使得你的应用能够更加高效地进行数据加载和渲染。

页面加载与嵌套路由的支持：app/ 目录支持嵌套路由和页面的渐进式加载，这意味着你可以按需加载页面，而不需要在一开始就加载整个应用。

public/ 目录
这个目录用于存放静态文件，Next.js 会自动将其中的文件暴露出来，你可以在前端直接访问这些文件。

示例：public/images/logo.png 可以通过 http://localhost:3000/images/logo.png 访问。
一些常见的文件（例如 favicon.ico）通常也放在这个目录中。
components/ 目录
这个目录用来存放你的可复用 React 组件。它是前端界面构建的基本单位，Next.js 并没有强制要求你创建这个目录，但它是一个推荐的组织方式。

例如，components/Header.js 存放导航栏组件，components/Footer.js 存放页脚组件。
styles/ 目录
Next.js 默认支持 CSS 模块、全局 CSS、SASS/SCSS 等样式方案。通常，样式文件放在 styles/ 目录中。

styles/globals.css 是应用的全局样式，通常会在 pages/_app.js 中引入。
styles/Home.module.css 是 CSS 模块化的示例样式文件。
lib/ 目录
lib/ 目录可以用来存放工具函数、API 客户端代码等。如果你有多个模块需要共享的工具函数、常量、配置等，可以将它们集中放在 lib/ 目录下。

例如，lib/api.js 可能包含一些调用后端 API 的通用方法。
_app.js 和 _document.js

### next.config.js 是 Next.js 项目的配置文件，它允许你进行一些自定义设置，例如：

配置静态文件的路径
启用或禁用某些功能（例如，服务端渲染、CSS 预处理等）
配置 Webpack 等

### tsconfig.json
如果你使用 TypeScript 开发，tsconfig.json 是 TypeScript 配置文件，用来指定编译选项。
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 本地开发配置

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
4. 生产环境使用 Cloudflare Pages 的环��
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
