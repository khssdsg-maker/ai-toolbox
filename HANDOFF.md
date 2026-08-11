# 📋 AI万能工具箱 (AI Toolbox) 项目开发无缝交接文档

> **文档创建时间**：2026-08-11
> **当前最新版本**：`v1.3.0` (已发布至 GitHub Releases)
> **项目本地路径**：`C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox`

---

## 一、 项目当前最新状态与已完成工作

### 1. 深度瘦身与体积优化 (已上线)
- 修正 `package.json` 依赖分类，将 `electron-builder` 等纯打包依赖归入 `devDependencies`。
- 移除 `electron-builder.json` 中失效配置，**桌面端安装后磁盘占用由 975 MB 暴降至 366 MB（物理节省 609 MB，资源目录缩减 97%）**。

### 2. 扩充 mainstream AI Agent 平台 (已上线)
- 在 `src/navsphere/content/navigation.json` 中新增独立顶级分类 **【AI 编程 Agent】** (`id: "10"`)。
- 完整收录 **28 款全球/国产大厂主流 AI Agent 平台**：
  - **全球大厂与知名开源平台**：Google Antigravity, Claude Code, OpenAI Codex, Devin, Cursor, Windsurf, Replit Agent, Bolt.new, Lovable, v0, OpenCode, Aider, OpenHands, Sourcegraph Cody, Amazon Q Developer 等。
  - **国产大厂平台**：ByteDance Trae, 阿里 Qoder/通义灵码, 智谱 ZCode, 百度 Comate, 腾讯元器, 阿里百炼, 钉钉 AI Agent, 百度 AgentBuilder, 讯飞火星 Agent, 万知 01.AI, CodeGeeX, Fitten Code, WorkBuddy 等。
  - **工作流 Agent**：n8n, Make.com, Zapier Central 等。

### 3. 彻底解决图标重载与闪烁问题 (已上线)
- 重构 `src/components/site-favicon.tsx`：
  - 弃用受墙影响的 `google.com/s2/favicons` 接口，换用免墙高速 CDN `favicon.im` 与 `api.iowen.cn`。
  - 引入 `localStorage` 持久化缓存与首帧同步状态计算，挂载第 1 帧直接读取本地缓存。
- 移除 `electron/main.mjs` 中启动时的 `session.defaultSession.clearCache()` 强清逻辑，保留 HTTP 磁盘缓存。

### 4. 视觉与品牌修整 (已上线)
- 修正 `src/navsphere/content/site.json` 中 `appearance.logo` 路径，将窗口主界面左上角 Logo 指向官方标准图标 `/icon.png`。
- 修复 `src/app/layout.tsx` 中字体加载兼容性逻辑，保证离线/网络受限时 `next build` 稳定编译。

### 5. 规范化 GitHub Release 标题与全量日志同步 (已上线)
- 改进 `publish-release.js` 脚本，每次执行正式发布时使用临时文本文件 (`--notes-file`)，彻底解决 Windows CLI 命令行在长文本/多行描述时的截断问题。
- 将 GitHub Releases 页面所有历史版本标题统一规范调整为 **`AI Toolbox vX.X.X`**。
- GitHub Release `v1.3.0` 与所有历史版本 (`v1.2.9`~`v1.1.0`) 描述均已完成详细 Markdown 日志同步填充。

### 6. 新增 GitHub 高 Star 开源 AI 小说与文本生成分类 (已上线)
- 在 `src/navsphere/content/navigation.json` 中新增顶级分类 **【AI写作与小说生成】** (`id: "11"`)。
- 完整收录 **12 款 GitHub 高 Star 热门开源项目与主流写作平台**：
  - **GitHub 高 Star 开源项目**：SillyTavern (30,900+ ⭐)、AI Dungeon (3,200+ ⭐)、RecurrentGPT (1,000+ ⭐)、inkos、StoryMoss (草苔)、Vela 等。
  - **主流写作平台**：Sudowrite、NovelAI、秘塔写作猫、讯飞奇妙文、彩云小文、Kimi 长文本写作。

---

## 二、 海辰专属 Skill & 规范准则

已部署全局准则文档至：
- **Global Skill**: `C:\Users\海辰\.gemini\config\skills\haichen-workflow-habits\SKILL.md`
- **Global Rule**: `C:\Users\海辰\.gemini\config\rules\haichen-workflow.md`

### 必须遵守的核心规范：
1. **版本号管理纪律**：
   - 仅在本地测试构建 (`node update-local.js`) 时，属于测试版本，**严禁修改 `package.json` 中的 `version` 版本号**。
   - 只有在明确指令发布 GitHub Release 时才可递增版本号。
2. **工具选型标准**：“小众的不要”。严禁收录知名度低、个人小玩具或缺乏维护的边缘项目，只收录主流大厂与高 Star 热门 Agent/AI 工具。
3. **图标与缓存**：前端严禁使用受限制的 Google Favicon 接口，必须使用高速 CDN API + `localStorage` 永久缓存，保障切页与重启 0 闪烁。
4. **日志同步**：每次发布 Release 必须自动更新 `settings-dialog.tsx`、`docs/index.html` 以及 GitHub Release Body。
5. **未令不动**：“让你行动了吗？”；“只在本地项目更新，不忙上传”。未经明确指令，禁止擅自 `git push` 或部署 Cloudflare Pages。

---

## 三、 常用构建命令速查

- **本地更新/测试安装包 (不改版本号)**：
  ```bash
  node update-local.js
  ```
- **正式打包并发布到 GitHub Release (自动同步日志与版本号)**：
  ```bash
  node publish-release.js v1.3.0
  ```
- **TypeScript 类型检查**：
  ```bash
  pnpm exec tsc --noEmit
  ```

---

## 四、 新对话接话提示词 (直接复制使用)

请在开启新对话后，直接将以下框内文本发送给 Agent：

```text
我们继续【AI万能工具箱】项目的开发。
项目本地路径：C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox

请先读取本地的交接文档 HANDOFF.md 以及全局规则 C:\Users\海辰\.gemini\config\rules\haichen-workflow.md 确认项目最新状态与海辰的开发习惯。

确认完毕后，我们接下来开始做：[在此填写您下一步的需求/功能/修改]
```
