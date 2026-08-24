# 📋 AI万能工具箱 (AI Toolbox) 项目开发无缝交接文档

> **文档创建/更新时间**：2026-08-24
> **当前最新版本**：`v1.6.2` (已成功发布至 GitHub Releases 与 Cloudflare Pages)
> **项目本地路径**：`C:\Users\海辰\.gemini\antigravity\scratch\ai-toolbox`
> **GitHub 仓库**：`https://github.com/khssdsg-maker/ai-toolbox`
> **在线体验版**：`https://ai-toolbox-ajc.pages.dev`

---

## 一、 项目当前最新状态与已完成工作

### 0. ⭐ 下一阶段开发路线图（2026-08-22 战略决策，新 Agent 必读）

> 背景：产品诊断结论——九大功能模块分散火力，每条战线 60-80 分无一 95 分；多轮迭代被视觉微调吞噬，基建欠账（数据安全/发布工程/测试）未还。**战略转向：收敛聚焦，把 AI 分屏研判做成全网最强，其余枢纽降级维护。**

**四阶段路线图（按序执行）：**

**📦 阶段一 v1.7.0「还债保命」（1-2 天，不加任何新功能）**
1. 数据镜像备份：启动时把 localStorage 关键数据（自建分类/卡片/主题/阵容）自动镜像写入 userData 的 JSON，检测 localStorage 为空时自动恢复（堵住"清缓存全丢"漏洞）；
2. 发布工程加固：publish-release.js 增加代理可达性探测（7890 不通自动走直连）；更新日志从 settings-dialog.tsx 内嵌数组外置为独立 JSON 文件（拆除"正则解析组件源码"脆弱耦合）；
3. 工程卫生：启用 ESLint（结束永久 --no-lint）、清死代码（arena 的 single-1 死路径、无 UI 入口的 removeCustomModel、未使用图标）、修正 README 与代码失真（react-resizable-panels 宣称在用实为手写拖拽）；
4. 顺手修 arena 小 bug：通义万相被误分入"国际顶流"分组（arena-content.tsx:875/:882 slice 边界）、自定义模型缺删除 UI。

**⚔️ 阶段二 v1.8.0「AI 分屏 · 全自动流水线」核心战役（3-5 天，只打分屏）**
1. 回复完成自动检测：轮询各栏 webview 字数，连续 3 次稳定即判定生成完毕（整条流水线缺失的触发器）；
2. 全自动研判流水线：群发 → 自动等各站完成 → 自动抓取 → 自动喂总审官 → 自动出终审，全程零人肉；
3. 注入可见性：逐栏发送成功/失败徽标 + 重试按钮；webview 加载状态条与白屏/Cloudflare 拦截提示（现无任何 did-fail-load 处理）；
4. 体验闭环：阵容与布局记忆（现全部不持久化，刷新即丢）、多套阵容预设一键切换、总审官 webview 会话保活（现关弹窗即销毁，重开冷加载 5-10 秒）、三栏/四宫格拖拽调宽（用已安装未使用的 react-resizable-panels）。

**🏆 阶段三 v1.9.0「战绩与升级体验」（2-3 天）**
1. 竞技场战绩系统：A/B 投票 + ELO 排行榜（Award/Crown 图标已导入未使用）；2. 研判报告一键导出 Markdown；3. 接入 electron-updater 差量更新（blockmap/app-update.yml 打包时已在生成，安装包 92MB → 每次升级仅几 MB）。

**✂️ 阶段四 v2.0「做减法」战略版**
- 其余枢纽降级为精简入口不再迭代；安全收尾：AI 站分站独立 partition（现 11 站 cookie 共池 persist:ai_arena 有跨站关联风控风险）、CSP/XFO 剥离按域名白名单收窄（main.mjs setupSessionSecurity 现对所有域名无差别生效）；README 写清晰定位宣言。

**🚫 不做清单（防发散，与做什么同等重要）：**
1. 不再新增第 10 个功能枢纽，新功能只进 AI 分屏；
2. 视觉体系冻结：五层玻璃体系已定稿，只修显示 bug，不再调主观参数（透明度/磨砂数值）；
3. 不做 Web 端 arena 降级（webview 依赖 Electron 是架构事实，浏览器端保持"新窗口打开"卡片）。

### 0.5 ⭐ 本会话（2026-08-22，v1.5.7→v1.6.1）确立的关键技术事实（新 Agent 防坑必读）
1. **五层玻璃层次体系**：桌面 → 舞台底(`.bg-background`) → 侧栏/顶栏(chrome 档) → 卡片(card 档) → 胶囊岛(`.capsule-island`)，CSS 变量注入于 `wallpaper-background.tsx`（随设置滑杆联动）。玻璃选择器必须含 `[class*="bg-background/"]`、`[class*="bg-card/"]`、`[class*="bg-muted/"]` 等属性子串匹配——**Tailwind v4 的 `bg-background/85` 是独立类名 token，`.bg-background` 选择器匹配不到它**。
2. **磨砂架构**：main.mjs 已**移除** `backgroundMaterial: 'acrylic'`（曾两度反复，最终决策：桌面清晰实时透视）；全屏磨砂由 `wallpaper-background.tsx` 的磨砂纱层（`backdrop-filter: blur(bgBlur×1.33px)`）无极控制，"背景高斯模糊"滑杆=全屏磨砂强度（0 全清晰~40 重磨砂）。**CSS 无法模糊窗口外的真实桌面**（backdrop-filter 只作用于应用内网页内容），只有系统 acrylic 能磨砂桌面但强度固定不可调——此为最终取舍结论，勿再反复。
3. 预设光幕四边羽化 mask（左右 5%/上下 3%）防窗口边缘辉光硬切断层；预设底色为 65% alpha 纱罩；图片/视频壁纸黑遮罩渲染时 ×0.5。
4. **发布流程三大坑**：① publish-release.js 在无环境代理时强制注入 `127.0.0.1:7890`——**代理软件未运行时 electron-builder 必挂**（ECONNREFUSED），先 `curl -x http://127.0.0.1:7890` 测代理再跑，不通请海辰开代理；② `gh release create` 中断会残留**草稿状态**（isDraft:true 用户不可见），需 `gh release edit vX.X.X --draft=false` 修正并验证 api.github.com/releases/latest；③ 国内网络 github.com 主站时断时续而 api.github.com 通常可达，push 失败多为网络窗口期，多重试或等代理。
5. **安装包瘦身**：electron-builder.json 已加 `"electronLanguages": ["zh-CN", "en-US"]`（裁 55 个语言包），安装包 105→92MB、安装体积 360→314MB。Chromium LICENSES.chromium.html（20MB）保留未删（海辰决策）。
6. Wallpaper Engine 壁纸 `/local-media` 接口的 `parsedUrl` 未定义变量 bug 已在 v1.6.0 修复（改 `new URL(req.url, 'http://localhost')`）。
7. arena 完整功能清单与 10 项已知局限已在 2026-08-22 全面梳理（注入引擎 15 输入框+12 按钮选择器、DOM 改版即静默失效、研判弹窗"共识点/优势速览"为硬编码假智能、状态不持久化等），优化项已纳入上述路线图阶段一/二。

### 1. 全新发布【真·实时桌面透视、磨砂无极调节、五层玻璃层次与全站铺满布局】(`v1.6.0`)
- **真·实时桌面透视**：移除固定系统亚克力磨砂，窗口全透明实时透出桌面动态壁纸（Wallpaper Engine 动画与桌面同一动画）。
- **磨砂无极调节**：新增全屏磨砂纱层，"背景高斯模糊"滑杆升级为 0~40 无级磨砂（全清晰 ↔ 重磨砂实时可调）。
- **五层玻璃层次体系**：桌面→舞台底→侧栏顶栏→卡片→胶囊岛五档亮度递进，消除割裂竖线，软件界面与桌面明辨分明；胶囊岛改最透悬浮晶体（capsule-island 专属规则）。
- **全站铺满与质感统一**：主页/视频页内容去除 max-w-5xl 限宽铺满超宽屏（网格自适应 4~5 列）；侧栏/顶栏/弹层/bg-muted 块全部玻璃化统一；预设光幕四边羽化消融。
- **修复**：Wallpaper Engine 壁纸加载报错（/local-media 服务端变量未定义）、预设光幕窗口两侧辉光断层。

### 2. 发布【安装包与安装体积大幅瘦身】(`v1.6.1`)
- 下载安装包 105 MB → 92 MB（-12%），安装体积 360 MB → 314 MB（-13%）；裁剪 Chromium 冗余语言包仅留 zh-CN/en-US，功能零影响。

### 3. 发布【Steam Wallpaper Engine 联动、全景通透无界画布、全导航自定义与主题解耦】(`v1.5.7`)
- WE 创意工坊壁纸库自动扫描/自定义目录画廊选择/GPU 加速静音视频壁纸；Windows 桌面透视透明窗体；全景羽化消融分割线与晶体磨砂卡片；6 大枢纽通用自定义卡片与 JSON 备份；7 套 UI 氛围色与 6 款胶囊动效主题解耦。

### 4. 全新发布【黄金三栏零重叠架构、胶囊岛 6 大高定动效主题与全自由拖拽排版】(`v1.5.6`)
- **黄金三栏物理隔离（彻底根治重叠）**：全局悬浮胶囊岛（`left-3`）、纯净 AI 分类侧边栏（`left-58px`）与主画卷内容（`lg:pl-282px`）各司其职并列排布，彻底消除遮挡。
- **胶囊岛 6 大高定动效主题引擎**：
  1. 🌿 **赛博薄荷绿 (默认经典)**：`#4DE0B1` 生物荧光呼吸脉冲（Bioluminescent Pulse）
  2. 🌌 **深海极光蓝**：`#3B82F6` 极光 4 色流光平滑流转 + 磁吸弹性（Aurora Spring）
  3. 🔮 **赛博霓虹紫**：`#A855F7` 全息穿透扫光 + 高压霓虹灯管辉光（Neon Holo Glow）
  4. ⚡ **电光落日橙**：`#F59E0B` 太阳耀斑熔岩流动 + 暖阳微粒光晕（Solar Flare）
  5. 🌸 **樱花绯红粉**：`#EC4899` 果冻水滴挤压物理形变 + 花瓣柔光（Jelly Waterdrop）
  6. 💎 **黑曜石钛金**：`#334155` 镜面金属拉丝扫掠 + 机械脆爽吸附（Titanium Sheen）
  - 支持胶囊岛底部 `[🎨 调色盘]` 与设置弹窗双通道秒切，永久持久化记忆。
- **真实网页元数据爬虫**：添加工具时通过真实 Electron 网络爬虫自动提取官方 `<title>` 与 `<meta name="description">` 简介，输入框 100% 自由手动编辑，卡片悬浮支持「✏️ 二次编辑」。
- **独立自建分类与自由拖拽排版**：增设独立「📁 新建分类」入口无需填网址秒建空分类；左侧栏分类与主页卡片均支持物理弹性拖拽重排与本地持久化记忆。
- **驱动中心真实官方 Logo 与 7 层防反爬嗅探**：子域名清洗归一化 + 22+ 硬件大厂抗反爬高保真官方图标字典，状态栏「🌐 修复空白图标」与卡片「🔄 重新拉取」真实有效且 100% 保护好图标。

- **2×2 拟真视窗画廊**：主说明书 `README.md` 彻底摒弃长篇纯文本，重构为内嵌高清实机截图的操作系统拟真视窗画廊（收录分屏打擂、总审官研判中枢、提示词宝典、视频收藏直接看等 7 大核心视窗）与 Mermaid 研判协同流程图。
- **官网宣传主页升级**：`docs/index.html` 升级为 7 大核心功能拟真交互视窗，支持点击选项卡实时切换对应功能的真实高清界面。
- **标准化多语言指引**：规范清理 `README-CN.md` 与 `README-EN.md`，使双语文档与主项目完全对齐。

### 2. 全新升级【通义万相高画质矢量品牌图标与多模态创作生态增强】(`v1.5.5`)
- **超清矢量图标原生化**：为【通义万相】专属定制超清阿里几何渐变矢量图标（`/icons/wanxiang.svg`），彻底解决因第三方图床跨域与阿里 SSO 重定向导致的图标加载空白问题。
- **双端即时渲染**：在首页导航卡片与 AI 大模型分屏对比台下拉中完美呈现清晰品牌标识。

### 2. 全新收录【阿里通义万相 AI 绘画与视频生成创作平台】(`v1.5.4`)
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

请先读取本地的交接文档 HANDOFF.md（重点精读「一、0. ⭐ 下一阶段开发路线图」与「一、0.5 ⭐ 本会话确立的关键技术事实（防坑必读）」两节）以及全局规则 C:\Users\海辰\.gemini\config\rules\haichen-workflow.md，确认项目最新状态、既定路线图与海辰的开发铁律后再行动。

确认完毕后，我们接下来开始做：[在此填写您下一步的新需求/修改，或直接填写"按 HANDOFF.md 路线图执行下一阶段"]
```
