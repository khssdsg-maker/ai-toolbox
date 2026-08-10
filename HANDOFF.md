# AI万能工具箱 — 项目交接文档

> 给接手的 AI Agent：动手前先完整读一遍本文档。仓库地址：https://github.com/khssdsg-maker/ai-toolbox（公开仓库）

---

## 一、这是什么项目

「AI万能工具箱」是面向普通用户（非技术人员）的桌面工具平台，定位是"AI 时代的超级工具箱"。基于 Next.js 网页应用 + Electron 打包为 Windows 桌面软件。产品负责人是非程序员，沟通需简洁直接、全程中文。

五大核心模块：AI 工具导航中心、文件格式转换中心、驱动工具中心、网络工具中心、AI Agent 助手。

---

## 二、当前完成状态

| 模块 | 状态 | 说明 |
|---|---|---|
| AI 工具导航（首页） | 已完成 | 37+ AI 工具，7 大分类，搜索/双语/深浅色 |
| 视频合集 `/videos` | 已完成 | 平台入口 + 精选视频在线播放 + 一键收藏 |
| 文件转换 `/convert` | 已完成（基础版） | 图片互转/PDF↔Word/Markdown/JSON/CSV/Base64/URL |
| 网络工具箱 `/tools` | 已完成 | IP/DNS/HTTP/端口/URL/UA |
| 驱动中心 `/drivers` | 已完成 | 品牌/硬件/键鼠外设驱动官方入口 |
| 收藏 `/favorites` | 已完成 | 视频与链接收藏，localStorage + 文件双通道 |
| 内置多标签浏览器 | 已完成 | 链接可选应用内/外部浏览器打开 |
| 设置（左下角） | 已完成 | 主题/语言/链接打开方式/清空收藏 |
| 软件自动更新 | 已完成 | electron-updater + GitHub Releases |
| AI Agent 助手 | 未开始 | 五大模块中唯一未做 |
| 文件转换扩容 | 待做 | 批量图片、图片压缩等 |
| 驱动自动检测 | 待做 | 读取本机硬件推荐驱动 |
---

## 三、技术架构

| 层面 | 技术 |
|---|---|
| 前端框架 | Next.js 15.5.7 + TypeScript |
| 样式 | Tailwind CSS v4（暖白/墨蓝/琥珀金主题，宋体标题） |
| UI 组件 | shadcn/ui + Radix UI |
| 桌面打包 | Electron 43 + electron-builder |
| 自动更新 | electron-updater（数据源：GitHub Releases） |
| 文档转换 | pdfjs-dist / mammoth / marked / turndown / html2canvas / jsPDF |
| 宣传页 | GitHub Pages（docs/index.html） |

**关键目录：**

    src/app/                 页面路由（首页/videos/convert/tools/drivers/favorites/admin）
    src/components/          组件（sidebar/navigation-card/video-card/settings-dialog/convert-center/drivers-center 等）
    src/lib/                 favorites.ts(收藏)/converters.ts(转换)/doc-converters.ts(文档转换)/data-loader.ts
    src/navsphere/content/   导航数据 JSON（navigation.json/videos.json/site.json）
    src/styles/globals.css   全局样式（含主题色变量）
    electron/main.mjs        Electron 主进程（内置静态服务器+多标签浏览器+自动更新+收藏链接）
    electron/tab-bar.html    内置浏览器标签栏
    electron/main-preload.cjs / tab-preload.cjs   预加载桥接
    docs/index.html          宣传页（GitHub Pages）
    update-app.ps1           一键更新脚本（构建→打包→静默安装→启动）
    electron-builder.json    打包配置（含 GitHub 发布配置）

**应用运行原理：** Electron 启动后用 Node http 在 `127.0.0.1:3456` 起一个静态服务器，加载 `resources/web/`（Next.js 静态导出的产物），主窗口加载该地址。收藏、链接打开方式等数据由主进程直接读写 userData 下的 JSON 文件（避免多层 IPC 不可靠）。
---

## 四、如何运行 / 构建 / 打包 / 发布

**环境要求：** Node.js 20+，pnpm。依赖安装：`pnpm install`。

**开发调试（网页版）：**

    pnpm dev                    # 启动 http://localhost:3000

**静态导出（打包前必做）：** Next.js 配了 `output: 'export'`（由环境变量 `BUILD_EXPORT=true` 触发）。但 API 路由/中间件/admin 后台不支持静态导出，导出前必须临时重命名：

    src/app/api           →  src/app/_api_disabled
    src/app/middleware.ts →  src/app/middleware-disabled.ts
    src/app/admin         →  src/app/_admin_disabled
    然后  $env:BUILD_EXPORT="true"; next build   生成 out/
    导出后务必改回原名（update-app.ps1 已自动处理这套流程）

**一键更新（推荐）：** `powershell -ExecutionPolicy Bypass -File update-app.ps1`
自动完成：停应用→静态导出→electron-builder 打包→静默安装→启动。

**手动打包：** `node node_modules\electron-builder\out\cli\cli.js --win --publish never --config.directories.output=dist2`

**发布新版本（GitHub Releases，供自动更新）：**
1. 修改 package.json 的 version（递增，如 1.2.2）
2. `git tag v<版本>; git push origin v<版本>`
3. `$env:GH_TOKEN = (gh auth token)`
4. `node node_modules\electron-builder\out\cli\cli.js --win --publish always --config.directories.output=dist2`
5. 确认 Release 资产里有 `latest.yml`（自动更新必需）；若缺失，手动 `gh release upload v<版本> dist2\latest.yml --clobber`

**安装位置：** 应用装在 `D:\AI万能工具箱`，桌面快捷方式指向 `D:\AI万能工具箱\AI万能工具箱.exe`。
---

## 五、已知坑（必读，都是踩过的）

1. **electron-updater 是 CommonJS 模块**：不能用 `import { autoUpdater } from 'electron-updater'`（会报 SyntaxError 导致应用启动即崩溃、内置服务器起不来）。必须用默认导入再解构：
   `import electronUpdater from 'electron-updater'; const { autoUpdater } = electronUpdater`。
   且 `setupAutoUpdate()` 要放在 `createWindow()` 之后并包 try/catch，更新出错不能影响应用使用。

2. **CSS 样式绝不能丢**：产品负责人对"样式丢失/裸 HTML"极其敏感。改页面时不要重构 `globals.css`，只做增量；改 Tailwind 类名避免动态拼接导致类不生成；改完务必验证样式。改完清 `.next` 缓存再重启。

3. **.env 含密钥，永不提交**：已从 git 历史彻底清除，`.gitignore` 已排除。仓库里有 `.env.example` 作模板。切勿再把 `.env` 加进版本控制。

4. **多语言字段需手动加**：`src/types/navigation.ts` 的类型默认没有 `titleEn`/`descriptionEn`，用到时要手动加可选字段，否则 TS 报错。

5. **PowerShell 写文件**：用 `[System.IO.File]::WriteAllText/AppendAllText`；大段内容用 here-string。`Get-Content -Raw` 做 `.Replace()` 时注意换行符（CRLF）匹配，建议行级处理。

6. **构建产物勿提交**：`dist-electron/`、`dist2/`、`out/` 已在 `.gitignore`。曾误提交 dist2 撑爆仓库，务必避免。

7. **文件锁**：`dist-electron/` 偶被安全软件/IDE 锁住删不掉，可换输出目录（如 `dist2`）绕过。

8. **中文 artifactName 可能导致更新器命名不一致**：建议保持英文 `artifactName`（当前 electron-builder.json 的 nsis.artifactName）。

9. **React createPortal** 参数必须用逗号分隔（`createPortal(el, document.body)`）。

---

## 六、未完成事项（Roadmap）

按优先级：
1. **文件转换扩容**：批量图片处理、图片压缩（纯前端 canvas，易落地）；视频/音频转换需 FFmpeg（体积大，谨慎）。
2. **驱动自动检测**：读取本机硬件（`Get-CimInstance` 等）推荐对应驱动，桌面专属功能。
3. **AI Agent 助手**：五大模块中唯一未做，需接入 LLM API（需 API Key，建议用户自备 Key、本地保存）。

---

## 七、给接手 Agent 的协作提示

- 产品负责人是非程序员、脾气较急：全程中文、简洁直接、先给结论和选项；要决策时给方案对比并明确推荐；需用户操作时给分步指引。
- 分阶段交付：每完成一个模块先让对方验收再继续，不要一次性堆全部代码。
- 已部署的 Impeccable 设计规范在 `.qoder/skills/impeccable/`，宣传页/界面美化时参考，避免 AI 味套路。
- 宣传页在 `docs/index.html`（GitHub Pages：https://khssdsg-maker.github.io/ai-toolbox/）。
- 自动更新数据源是 GitHub Releases，发版务必带 `latest.yml`。
