# 📋 AI万能工具箱 (AI Toolbox) 项目开发无缝交接文档

> **文档创建/更新时间**：2026-08-16
> **当前最新版本**：`v1.4.2` (已成功发布至 GitHub Releases)
> **项目本地路径**：`C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox`
> **GitHub 仓库**：`https://github.com/khssdsg-maker/ai-toolbox`
> **在线体验版**：`https://ai-toolbox-ajc.pages.dev`

---

## 一、 项目当前最新状态与已完成工作

### 1. 文件转换接入 Convertio (`v1.4.0`)
- 删除全部自研【文件转换中心】（8 个工具、converters.ts / doc-converters.ts 两个库），`/convert` 页面改为接入 Convertio。
- **桌面端**：应用内 iframe 直接内嵌 `https://convertio.co/zh/`；`electron/main.mjs` 通过 `onHeadersReceived` 仅对 `*.convertio.co` 域移除 `X-Frame-Options`（作用域严格受限）。
- **网页版**：Convertio 官方禁止 iframe 内嵌，自动降级为跳转卡片（favicon + 特性标签 + 新标签页打开）。

### 2. 网络工具箱升级为导航页 (`v1.4.0`)
- 自研网络工具箱 6 工具中 2 个因 `/api/*` 后端不存在而完全坏死（DNS、HTTP 状态）、2 个不可靠（端口、IP 查询依赖外国 API），整页替换为精选导航卡片。
- 收录 10 款实测可用的优质站点：国内直连（站长工具、ITDOG、Boce、IP138、爱站、IPIP.NET）+ 国际服务（MXToolbox、DNSChecker、Ping.pe、YouGetSignal）。

### 3. 依赖瘦身 (`v1.4.0`)
- 移除 7 个全项目零引用的历史依赖：jspdf、marked、pdfjs-dist、turndown、@types/turndown、mammoth、html2canvas；删除死文件 public/vendor/pdf.worker.min.mjs。
- 注：因 v1.2.9 起 node_modules 已排除出安装包，此瘦身不改变安装包体积，收益为仓库精简与构建提速。

### 4. 全新上线【AI 写作与小说生成】核心分类 (`v1.3.1`)
- 在 `src/navsphere/content/navigation.json` 中新增顶级分类 **【AI写作与小说生成】** (`id: "11"`, 图标 `BookOpen`)。
- 精选收录 **12 款 GitHub 高 Star 热门开源小说生成器与主流大厂写作平台**：
  - **GitHub 高 Star 开源项目**：SillyTavern (30,900+ ⭐，全网最火 LLM 故事/角色交互前端)、AutoNovel (自主小说章节创作 Agent)、inkos、StoryMoss (草苔，Tauri 网文 IDE)、Vela (本地网文 IDE) 等。
  - **主流写作平台**：Sudowrite、NovelAI、秘塔写作猫、讯飞奇妙文、彩云小文、Kimi 长文本写作。
- **开源工具宣传主页升格**：开源项目链接全面升级为其官方宣传体验首页（如 `https://sillytavern.app/`），而非裸 GitHub 代码仓库。
- **属性提纯**：剔除文字冒险 RPG 游戏属性的 AI Dungeon，替换为纯小说创作管线 AutoNovel。

### 2. 死链检测与淘汰机制 (`v1.3.1`)
- 建立死链扫描与淘汰机制，彻底清理已 404 失效的 **TaskingAI** 平台与 **RecurrentGPT Demo** 页面。
- 明确区分“需要科学上网的海外顶级服务”（如 ChatGPT、Claude、Gemini、Midjourney 等绝对保留）与“真实 404/域名过期的死链”（予以淘汰）。

### 3. GitHub Releases 标题与全量日志规范化 (`v1.3.1`)
- 改进 `publish-release.js` 脚本，通过 `--notes-file` 传递临时 Markdown 文件，彻底解决 Windows CLI 命令行在长文本/多行描述时的换行截断问题。
- 将 GitHub Releases 页面所有历史版本标题统一规范调整为 **`AI Toolbox vX.X.X`**。
- GitHub Release `v1.3.1` 与历史版本 (`v1.3.0`~`v1.1.0`) 描述均已完成详细 Markdown 日志同步填充。

### 4. 图标加速与零闪烁持久化缓存 (`v1.3.0`)
- 重构 `src/components/site-favicon.tsx`：
  - 弃用受墙影响的 `google.com/s2/favicons` 接口，换用免墙高速 CDN `favicon.im` 与 `api.iowen.cn`。
  - 针对 NovelAI 等特殊节点配置专属高清直链源。
  - 引入 `localStorage` 持久化缓存与首帧同步状态计算，挂载第 1 帧直接读取本地缓存，彻底消除切页与重新进入应用时的图标重复刷新与闪烁。

### 5. 深度瘦身与体积优化 (`v1.2.9`)
- 修正 `package.json` 依赖分类，将 `electron-builder` 等纯打包依赖归入 `devDependencies`。
- **桌面端安装后磁盘占用由 975 MB 暴降至 366 MB（物理节省 609 MB，资源目录缩减 97%）**。

---

## 二、 海辰专属工作习惯与必须遵守的铁律

已部署全局准则文档至：
- **Global Skill**: `C:\Users\海辰\.gemini\config\skills\haichen-workflow-habits\SKILL.md`
- **Global Rule**: `C:\Users\海辰\.gemini\config\rules\haichen-workflow.md`

### 必须遵守的核心规范（违规必究）：
1. **先解释、后请示、再行动（最高纪律）**：
   - 严禁擅自动手！在执行任何代码修改、脚本调用或构建命令前，**必须先用文字向海辰详细解释“要做什么”和“为什么做”**。
   - 解释完毕后，**必须停下来等待海辰明确下达指令（如“同意”、“行动”、“可以”）后，方可动手执行**。
2. **未令不动（Git & 部署纪律）**：“让你行动了吗？”；“只在本地项目更新，不忙上传”。
   - 未经海辰明确指令前，**绝对禁止擅自执行 `git push` 或部署 Cloudflare Pages**。
3. **版本号管理纪律**：
   - 本地测试构建 (`node update-local.js`) 时属于纯本地开发测试版本，**严禁修改 `package.json` 中的 `version` 版本号**。
   - 只有在海辰明确指令“打包发布到 GitHub Release”时，才可使用 `publish-release.js` 递增版本号。
4. **工具与平台筛选标准**：
   - GitHub 上 **Star 高的热门开源项目**（如数千/数万星标）以及全球/国内大厂主流 AI 工具均可收录。
   - 严禁收录已失效 404 或无维护的死链项目；开源项目优先链接至其官方宣传/演示主页。
5. **日志 100% 自动同步**：
   - 每次正式发布版本时，必须同步更新：
     1. `src/components/settings-dialog.tsx` 中的 `FALLBACK_RELEASE_NOTES`
     2. `docs/index.html` 落地页面的特征与下载版本号
     3. GitHub Release 页面正文描述（通过 `publish-release.js` 自动关联 `--notes-file`）

---

## 三、 常用构建命令速查

- **⚠️ 海辰本机实际安装位置**：`D:\AI万能工具箱\navsphere\`（早期手动安装自选了 D 盘目录）。`update-local.js` 已修复为通过注册表自动定位真实安装目录（兼容任意盘符），静默安装后**校验版本真正落地**并从正确路径启动，杜绝"假成功"。
- **本地更新/测试安装包 (不改版本号，纯本地静默更新重启)**：
  ```bash
  node update-local.js
  ```
- **正式打包并发布到 GitHub Release (自动递增版本号、打 Tag 并同步发布说明)**：
  ```bash
  node publish-release.js v1.4.3
  ```
- **TypeScript 类型检查 (修改代码后必查)**：
  ```bash
  pnpm exec tsc --noEmit
  ```

---

## 四、 新对话接话提示词 (直接复制发给新 Agent)

请在开启新对话后，直接将以下框内文本完整发送给新 Agent：

```text
我们继续【AI万能工具箱】项目的开发。
项目本地路径：C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox

请先读取本地的交接文档 HANDOFF.md 以及全局规则 C:\Users\海辰\.gemini\config\rules\haichen-workflow.md 确认项目最新状态与海辰的开发习惯。

确认完毕后，我们接下来开始做：[在此填写您下一步的新需求/修改]
```
