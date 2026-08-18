# 📋 AI万能工具箱 (AI Toolbox) 项目开发无缝交接文档

> **文档创建/更新时间**：2026-08-19
> **当前最新版本**：`v1.5.4` (已成功发布至 GitHub Releases 与 Cloudflare Pages)
> **项目本地路径**：`C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox`
> **GitHub 仓库**：`https://github.com/khssdsg-maker/ai-toolbox`
> **在线体验版**：`https://ai-toolbox-ajc.pages.dev`

---

## 一、 项目当前最新状态与已完成工作

### 1. 全新收录【阿里通义万相 AI 绘画与视频生成创作平台】(`v1.5.4`)
- **双端深度收录**：在【AI设计绘画】核心分类卡片库与【AI大模型分屏对比台】预置模型库中全面接入阿里巴巴官方多模态平台【通义万相】（`https://wanxiang.aliyun.com/`）。
- **多模态创作生态扩展**：支持高画质文生图、相似图衍生、图像局部重绘、涂鸦作画与 AI 视频生成，支持在应用内持久化沙箱秒开或分屏对比。

### 2. 全新上线【通义千问硬件级粘贴、ChatGPT精准锁定与专属任务智能切片】(`v1.5.3`)
- **通义千问（Qwen）硬件级 `Ctrl+V` 原生粘贴**：针对 Slate/Lexical 富文本框虚拟 DOM 拦截问题，直接通过原生剪贴板与底层硬件事件完成模拟粘贴，彻底根治假输入与按钮未解锁问题。
- **ChatGPT 主输入框绝对锁定**：绑定 `#prompt-textarea` 专属选择器，杜绝发送指令被误填入顶部会话标题栏/搜索栏。
- **专属任务智能母名切片**：自动剥离括号与版本号，利用多别名关键词模糊穿透，把总审官对各家的专属深化任务精准拆解并定向注入对应视窗。
- **双轮协同全流程 Stepper 闭环**：两阶段步进器，涵盖第 1 轮初审分工与第 2 轮终极单一融合成品（神作交付）。
- **100% 动态提炼 Agent 提示词**：从总审官实战方案中实时提取适配 Cursor / Cline / Dify 的高水准工业级 System Prompt。

### 2. 全新上线【AI 多模型多轮研判协同中枢与多屏矩阵架构】(`v1.5.2`)
- **双区研判协同架构**：左侧【主屏原始答卷池】（保留各模型作答记录，支持可视编辑与一键粘贴辅助）vs 右侧【内嵌独立总审官大模型视窗】（专职深度分析与冲突裁决，彻底杜绝主屏答卷被冲掉/覆盖的问题）。
- **全平台正文深度提取引擎**：精准适配通义千问、DeepSeek、ChatGPT、Kimi、豆包等平台，全自动提取回答全文，并在 Tab 标签页实时展示字数。
- **二轮攻坚全动态派发**：实时抓取右侧总审官的最新分析与分工意见，先解除弹窗遮挡后毫秒级注入主屏各模型开展第二轮定向深化。
- **多屏灵活布局矩阵**：支持双栏自由无级拖拽分屏 (1:1)、三栏竞速并排 (1:1:1)、四宫格全开矩阵 (2x2) 与单屏临时最大化切换。
- **双轨成果输出**：一键导出结构化多模型研判综合报告与工业级 AI Agent (Cursor/Cline/Dify) 系统提示词。

### 2. 全新上线【AI 大模型分屏对比台】(`v1.5.1`)
- 新增顶级路由页面 `/arena`（对应组件 `src/components/arena-content.tsx`，数据文件 `src/data/arena-models.ts`）。
- **10 大主流预置模型一键分屏**：涵盖国内直连（DeepSeek R1、Kimi、通义千问、豆包、智谱清言、秘塔搜索）与国际顶流（ChatGPT、Claude 3.5 Sonnet、Google Gemini、Perplexity）。
- **用户自定义模型扩展**：支持自由添加本地部署 Ollama、Grok 或私有知识库，本地持久化永久保存。
- **Webview 独立沙箱与风控免疫**：注入 `disable-blink-features: AutomationControlled` 底层开关，清除自动化标记，伪装纯净原生 Chrome 桌面版，彻底消除 ChatGPT 与豆包的风控拦截与反嵌套警告。
- **物理持久化会话 (`persist:ai_arena`)**：登录态、Token 与对话历史物理保存在磁盘，下次使用免登录。
- **生态联动**：提示词宝典每张卡片增设 `[⚔️ 分屏对比]`，参数填空后一键直达对比台。

### 2. 全新上线【AI 提示词灵感宝典】模块 (`v1.5.0`)
- 新增顶级路由页面 `/prompts`（对应组件 `src/components/prompts-center.tsx`，数据文件 `src/data/prompts-data.ts`）。
- **全球 11 大顶尖 Prompt 平台导航**：精选收录 Anthropic 官方提示词库、LiblibAI 哩布哩布、OpenArt PromptBook、FlowGPT、AI Short、Awesome Prompts 11万★ 开源版、PromptBase、ClickPrompt、AIPRM、PromptPerfect、SnackPrompt。
- **5 大高频场景结构化实战模板**：涵盖网文小说（黄金三章/金手指推演）、AI 编程开发（架构与 Debug）、绘画咒语（Midjourney 胶片光影）、职场办公（爆款小红书文案）、学术深度思考（费曼学习法与反事实推演）。
- 支持**动态交互参数填空**、**实时关键词/标签检索**、**一键秒级复制到剪贴板**与**本地收藏持久化**。

### 2. 内置浏览器升级【全自动常驻持续网页翻译】与导航增强 (`v1.5.0`)
- **SPA 动态 DOM 监听 (`MutationObserver`)**：在单页应用中点击菜单切换 Tab 或滚动加载新内容时，自动捕捉新载入的英文并在后台毫秒级自动翻译为简体中文。
- **跨页面切页状态继承 (`did-navigate` 联动)**：一旦开启翻译，标签页站内超链接跳转、前进、后退或刷新均全自动持续翻译，彻底告别单次翻译丢失。
- **工具栏与控制胶囊**：新增 `🌐 自动翻译中` 高亮开关、`🧭 浏览器打开`（一键调用系统默认 Edge/Chrome 打开）、`◀ / ▶ / ⟳` 基础导航按键。

### 3. 全局胶囊悬浮导航栏常驻固定 (`v1.5.0`)
- 将 `FloatingSidebar` 提升至全局根布局 `src/app/layout.tsx`，在所有子页面（主页、提示词、转换、收藏、驱动、网络工具、视频）永久固定悬浮，无缝跳转。

### 4. 文件转换接入 Convertio (`v1.4.0`)
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
  node publish-release.js v1.4.5
  ```
- **TypeScript 类型检查 (修改代码后必查)**：
  ```bash
  pnpm exec tsc --noEmit
  ```
- **死链巡检 (扫描全部收录链接，三级分类报告，真死链才需处理)**：
  ```bash
  node scripts/check-links.mjs
  ```
  支持 `--only 关键字` 过滤、`--timeout 毫秒` 调超时。另：`publish-release.js` 已内置网页版自动部署（GitHub + Cloudflare Pages 一次发布全搞定）。

---

## 四、 新对话接话提示词 (直接复制发给新 Agent)

请在开启新对话后，直接将以下框内文本完整发送给新 Agent：

```text
我们继续【AI万能工具箱】项目的开发。
项目本地路径：C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox

请先读取本地的交接文档 HANDOFF.md 以及全局规则 C:\Users\海辰\.gemini\config\rules\haichen-workflow.md 确认项目最新状态与海辰的开发习惯。

确认完毕后，我们接下来开始做：[在此填写您下一步的新需求/修改]
```
