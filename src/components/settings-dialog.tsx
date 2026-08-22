import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Settings2, Sun, Moon, Monitor, Github, ExternalLink, History, Sparkles, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Globe, Image as ImageIcon, Video, Sliders, Eye, Trash2, UploadCloud, Gamepad2, FolderSearch, MonitorPlay } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/lib/language-context'
import { CAPSULE_THEMES, CapsuleThemeKey } from '@/components/floating-sidebar'
import { WallpaperConfig, WALLPAPER_PRESETS, DEFAULT_WALLPAPER_CONFIG } from '@/components/wallpaper-background'

export interface WallpaperEngineItem {
  id: string
  title: string
  type: 'video' | 'image'
  mediaPath: string
  mediaUrl: string
  preview?: string
  folderPath: string
}

export interface UIThemeOption {
  key: string
  name: string
  nameEn: string
  color: string
  desc: string
  descEn: string
}

export const UI_THEMES: UIThemeOption[] = [
  { key: 'default', name: '经典默认', nameEn: 'Classic Default', color: '#3b82f6', desc: '原始均衡蓝墨配色，清晰护眼', descEn: 'Balanced classic dark ink style' },
  { key: 'mint', name: '赛博薄荷', nameEn: 'Cyber Mint', color: '#4DE0B1', desc: '高能荧光生机，薄荷绿流光高亮', descEn: 'High-energy bioluminescent mint glow' },
  { key: 'aurora', name: '深海极光', nameEn: 'Aurora Blue', color: '#3B82F6', desc: '深邃湛蓝极光，灵动科技质感', descEn: 'Deep cyan aurora & smooth tech vibe' },
  { key: 'neon', name: '赛博霓虹', nameEn: 'Neon Cyber', color: '#A855F7', desc: '电光紫全息霓虹，极具未来感', descEn: 'Electric purple holographic neon glow' },
  { key: 'sunset', name: '电光落日', nameEn: 'Sunset Ember', color: '#F59E0B', desc: '暖阳炽热琥珀金，熔岩流体高光', descEn: 'Warm sunset amber & solar flare highlights' },
  { key: 'sakura', name: '樱花绯红', nameEn: 'Sakura Bloom', color: '#EC4899', desc: '柔和花瓣绯红粉，细腻温润视觉', descEn: 'Soft sakura petal pink & gentle warmth' },
  { key: 'obsidian', name: '黑曜钛金', nameEn: 'Obsidian Pro', color: '#64748B', desc: '深空冷金属拉丝灰，极客高级感', descEn: 'Deep space cold titanium brushed metal' }
]

interface BrowserInfo {
  name: string
  path: string
}

interface LinkSettings {
  mode: string
  browserPath: string
}

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

interface ReleaseNote {
  version: string
  date: string
  title: string
  titleEn: string
  changes: string[]
  changesEn: string[]
}

export const FALLBACK_RELEASE_NOTES: ReleaseNote[] = [
  {
    version: 'v1.6.1',
    date: '2026-08-22',
    title: '安装包与安装体积大幅瘦身',
    titleEn: 'Significantly Slimmed Installer & Installation Footprint',
    changes: [
      '【安装包瘦身】下载安装包从 105 MB 减至约 92 MB（-12%），安装体积从 360 MB 减至约 314 MB（-13%）',
      '【语言包精简】裁剪 Chromium 冗余语言包，仅保留简体中文与英文（zh-CN / en-US），功能零影响'
    ],
    changesEn: [
      'Slimmed Installer: Download size reduced from 105 MB to ~92 MB (-12%), on-disk footprint from 360 MB to ~314 MB (-13%)',
      'Locale Cleanup: Trimmed redundant Chromium language packs, keeping only Simplified Chinese & English (zh-CN / en-US) with zero feature impact'
    ]
  },
  {
    version: 'v1.6.0',
    date: '2026-08-22',
    title: '真·实时桌面透视、磨砂无极调节、五层玻璃层次与全站铺满布局',
    titleEn: 'Real-time Desktop See-through, Stepless Frost Control, 5-Layer Glass Hierarchy & Full-width Layout',
    changes: [
      '【真·实时桌面透视】移除固定亚克力磨砂，窗口全透明实时透出桌面动态壁纸，软件与桌面同一动画',
      '【磨砂无极调节】新增全屏磨砂纱层，"背景高斯模糊"滑杆升级为 0~40 无极磨砂，全清晰 ↔ 重磨砂实时可调',
      '【五层玻璃层次体系】桌面→舞台底→侧栏顶栏→卡片→胶囊岛五档亮度递进，消除割裂竖线，软件界面与桌面明辨分明',
      '【全站铺满与质感统一】主页/视频页内容铺满超宽屏（4~5 列自适应），侧栏/顶栏/弹层/muted 块全部玻璃化统一，预设光幕四边羽化',
      '【修复】Wallpaper Engine 壁纸加载报错（/local-media 服务端变量未定义），预设光幕窗口两侧辉光断层'
    ],
    changesEn: [
      'Real-time Desktop See-through: Removed fixed system acrylic for fully transparent windows that mirror your live desktop wallpaper in real time',
      'Stepless Frost Control: New full-screen frost veil upgrades the Gaussian blur slider to a 0-40 stepless range, from crystal clear to heavily frosted',
      '5-Layer Glass Hierarchy: Desktop, stage base, chrome bars, cards and capsule island step up in brightness for clear separation without hard dividers',
      'Full-width Unified Layout: Home & Video hubs now span ultra-wide screens (4-5 adaptive columns) with consistent glassmorphism across all panels',
      'Fixes: Wallpaper Engine loading error (undefined server variable in /local-media) and preset aurora edge glow clipping on both window sides'
    ]
  },
  {
    version: 'v1.5.7',
    date: '2026-08-22',
    title: 'Steam Wallpaper Engine 联动、全景通透无界画布、全导航自定义与主题解耦',
    titleEn: 'Wallpaper Engine Integration, Seamless Acrylic Canvas, Universal Custom Cards & Decoupled Themes',
    changes: [
      '【Steam Wallpaper Engine 联动】深度支持自动扫描并联动 Wallpaper Engine 创意工坊已下载壁纸库，支持自定义壁纸目录与内置画廊选择，一键秒切 GPU 硬件加速静音动态视频壁纸',
      '【Windows 原生桌面透视 (Desktop Acrylic)】开启透明窗体与亚克力磨砂材质，支持直接穿透看到电脑桌面正在运行的系统壁纸与底层窗口',
      '【全景无界通透玻璃画布】全面消除生硬实体分割线与死白色块，全站采用两端羽化消融微光线与 Linear/Raycast 级悬浮晶体磨砂卡片',
      '【全 6 大导航枢纽通用自定义】AI工具、驱动中心、转换中心、网络工具、提示词宝典、视频中心全面支持自定义卡片添加、实时爬虫与全量数据备份导入导出',
      '【界面氛围主题解耦】7 套专属 UI 氛围色彩与 6 款悬浮胶囊微动效主题解耦，支持自由搭配组合'
    ],
    changesEn: [
      'Wallpaper Engine Integration: Auto-scans and links downloaded Steam workshop wallpapers with in-app gallery preview and hardware-accelerated video playback',
      'Native Desktop Acrylic Translucency: Transparent window architecture showing through to real Windows desktop wallpaper and windows',
      'Seamless Glassmorphism Canvas: Eliminates hard divider borders, featuring feathered whisper dividers and Linear/Raycast-grade frosted glass cards',
      'Universal Custom Cards Across 6 Hubs: Full custom cards, auto web scraper, and JSON backup/restore across all 6 navigation hubs',
      'Decoupled UI Themes: 7 UI accent color palettes decoupled from 6 animated capsule island themes for flexible personalization'
    ]
  },
  {
    version: 'v1.5.6',
    date: '2026-08-19',
    title: '黄金三栏零重叠架构、胶囊岛 6 大高定动效主题与全自由拖拽排版',
    titleEn: 'Zero-Overlap 3-Column Layout, 6 Animated Capsule Themes & Free Drag Reordering',
    changes: [
      '【黄金三栏零重叠】重构全局固定悬浮胶囊岛（left-3）、纯净 AI 分类侧边栏（left-58px）与主画卷内容（lg:pl-282px），各司其职绝对物理隔离，彻底根治文字遮挡与卡片重叠',
      '【胶囊岛 6 大高定动效主题】还原经典赛博薄荷绿（生物荧光呼吸脉冲），新增深海极光蓝（极光流光+磁吸弹性）、赛博霓虹紫（全息扫光+霓虹辉光）、电光落日橙（太阳耀斑+熔岩微动）、樱花绯红粉（果冻水滴挤压+柔光绽放）、黑曜石钛金（金属镜面反光+机械吸附），支持调色盘与设置弹窗双通道秒切',
      '【真实网页爬虫与二次自由编辑】添加工具时通过真实后台网络爬虫自动提取官方 <title> 与 <meta name="description"> 简介，100% 自由手动编辑，支持卡片悬浮「✏️ 二次编辑」',
      '【独立自建分类与自由拖拽排版】增设独立「📁 新建分类」入口无需填网址秒建空分类；左侧栏分类与主页卡片均支持物理弹性拖拽重排与本地持久化记忆',
      '【驱动中心真实官方 Logo 与 7 层防反爬嗅探】子域名清洗归一化 + 22+ 硬件大厂抗反爬高保真官方图标字典，状态栏「🌐 修复空白图标」与卡片「🔄 重新拉取」真实有效且 100% 保护好图标'
    ],
    changesEn: [
      'Zero-Overlap 3-Column Layout: Reconstructed layout isolating Global Floating Capsule (left-3), Pure AI Category Sidebar (left-58px), and Main Canvas (lg:pl-282px) for zero visual overlap',
      '6 Animated Capsule Themes: Restored classic Cyber Mint (bioluminescent pulse), added Aurora Blue (aurora shimmer + magnetic spring), Neon Cyber (holographic scan + neon beam), Sunset Ember (solar flare + lava motion), Sakura Bloom (jelly waterdrop + petal bloom), and Obsidian Pro (titanium metallic sheen + mechanical snap)',
      'Real Web Scraper & In-Place Editing: Auto-extracts authentic <title> and meta descriptions with 100% manual editable inputs and in-place secondary editing',
      'Standalone Custom Category & Physics Drag-and-Drop: Dedicated category creation without URL requirements, plus full drag-and-drop reordering for both categories and cards',
      'Driver Center Official Logos & 7-Layer Anti-Crawler Engine: Root-domain normalizer + 22+ hardware brand vector dictionaries ensure authentic logos immune to WAF/404'
    ]
  },
  {
    version: 'v1.5.5',
    date: '2026-08-19',
    title: '通义万相高画质矢量品牌图标与多模态创作生态增强',
    titleEn: 'High-Res Vector Brand Icon for Tongyi Wanxiang & Multimodal Enhancements',
    changes: [
      '【品牌图标升级】为【通义万相】专属定制超清阿里几何渐变矢量图标（/icons/wanxiang.svg），彻底解决第三方图床与 SSO 重定向导致的图标加载空白问题',
      '【双端即时渲染】在首页导航卡片与 AI 大模型分屏对比台顶级下拉中完美展示高清通义万相品牌标识'
    ],
    changesEn: [
      'Brand Icon Upgrade: Custom high-res Alibaba geometry vector icon (/icons/wanxiang.svg) for Tongyi Wanxiang to eliminate CORS and SSO blank icon fallback',
      'Dual-view rendering: crisp icon display across both Home Navigation cards and Arena model selectors'
    ]
  },
  {
    version: 'v1.5.4',
    date: '2026-08-19',
    title: '收录阿里通义万相 AI 绘画与视频生成创作平台',
    titleEn: 'Added Alibaba Tongyi Wanxiang AI Art & Video Generation Platform',
    changes: [
      '【新增核心工具】收录阿里巴巴官方旗舰级多模态创作平台【通义万相】（https://wanxiang.aliyun.com/）',
      '【多场景深度整合】全面接入【AI设计绘画】核心分类卡片库与【AI大模型分屏对比台】，支持一键内嵌秒开与多屏同台创作',
      '【多模态创作赋能】全面支持高画质文生图、相似图创意衍生、涂鸦作画、图像局部重绘与 AI 视频生成'
    ],
    changesEn: [
      'New tool integration: Added Alibaba official flagship multimodal creative platform Tongyi Wanxiang (https://wanxiang.aliyun.com/)',
      'Ecosystem integration: Available in both AI Design & Art navigation catalog and AI Model Arena workstation with seamless embedded sandboxing',
      'Multimodal capabilities: High-fidelity text-to-image, creative variation, inpainting, and AI video generation'
    ]
  },
  {
    version: 'v1.5.3',
    date: '2026-08-19',
    title: '通义千问硬件级粘贴、ChatGPT精准锁定与专属任务智能切片',
    titleEn: 'Hardware-Level Paste for Qwen, Precision Target for ChatGPT & Fuzzy Task Slicing',
    changes: [
      '【通义千问硬件级粘贴】升级底层物理级 Ctrl+V 原生粘贴模拟与 Slate 容器自动适配，彻底根治富文本框虚拟 DOM 假输入与发送按钮未解锁问题',
      '【ChatGPT 主输入框绝对锁定】精准锁定 #prompt-textarea，严格过滤并杜绝发送指令被误填入顶部会话标题栏或搜索框',
      '【专属任务智能母名切片】支持各模型关键词模糊穿透切片，精准把总审官对各家的专属深化指令拆解并定向派发至主屏对应视窗',
      '【双轮协同全流程闭环】引入阶段流转步进器（Stepper），完整支持第一轮初审分工与第二轮终极单一融合成品（神作交付）',
      '【动态提炼 Agent 提示词】从总审官实战方案中 100% 动态提取可直接用于 Cursor / Cline / Dify 的专属工业级 System Prompt'
    ],
    changesEn: [
      'Hardware-level paste for Qwen: native clipboard paste simulation completely fixes Slate virtual DOM input blockage and button lock issues',
      'ChatGPT precision selector: strictly target #prompt-textarea to prevent prompt injection into top header/rename/search boxes',
      'Fuzzy task slicing: accurately segment per-model dedicated instructions from judge review and dispatch exclusively to corresponding arena slots',
      'Two-phase workflow stepper: complete lifecycle support from Round 1 review & task assignment to Round 2 final single masterpiece synthesis',
      'Dynamic Agent Prompt: 100% extract live tailored Cursor/Cline/Dify system prompts generated by chief judge'
    ]
  },
  {
    version: 'v1.5.2',
    date: '2026-08-18',
    title: 'AI 多模型多轮研判协同中枢与多屏矩阵架构',
    titleEn: 'AI Multi-Model Synthesis Hub & Multi-Screen Matrix Architecture',
    changes: [
      '【多模型多轮协同中枢】新增「左侧原始答卷池 vs 右侧内嵌独立总审官大模型」双区研判架构，彻底解决对话覆盖与状态污染问题',
      '【全平台深度正文抓取】深度适配通义千问、DeepSeek、ChatGPT、Kimi、豆包等平台，支持全自动正文提取与左侧透明可视编辑/一键粘贴辅助',
      '【二轮攻坚动态派发】总审官完成初审后，支持一键实时提取总审意见并自动派发至主屏各模型开展第二轮针对性深化与改写',
      '【多屏灵活矩阵】支持双栏自由无级拖拽分屏 (1:1)、三栏竞速并排 (1:1:1)、四宫格全开矩阵 (2x2) 与单屏临时最大化切换',
      '【双轨成果输出】提供结构化多模型研判综合报告与工业级 AI Agent (Cursor/Cline/Dify) 系统提示词一键导出'
    ],
    changesEn: [
      'New feature: Multi-Model Synthesis Hub with isolated dual-pane architecture (Raw Answers Pool on the left vs Live Independent Arbiter on the right)',
      'Robust DOM extraction: seamlessly capture full response text across Qwen, DeepSeek, ChatGPT, Kimi, and Doubao with live editable review & clipboard paste helper',
      'Round 2 dynamic dispatch: extract live advice from chief arbiter and automatically forward targeted refinement tasks to arena models',
      'Multi-pane matrix: flexible layout modes supporting 2-pane resizable split, 3-pane triple race, 4-pane quad grid, and single-pane temporary zoom',
      'Dual-track export: 1-click copy for synthesis comparison reports and production-ready AI Agent (Cursor/Cline/Dify) system prompts'
    ]
  },
  {
    version: 'v1.5.1',
    date: '2026-08-18',
    title: 'AI 大模型分屏对比台上线与独立沙箱风控免疫',
    titleEn: 'AI Model Arena & Split-Screen Comparison Workstation',
    changes: [
      '【重磅功能】新增【AI 大模型聚合分屏对比台】：收录 10 大国内外主流顶尖大模型（DeepSeek R1、ChatGPT、Kimi、豆包、通义千问、Claude、智谱清言、秘塔搜索等），支持 1:1 双栏并排即时对比',
      '【自定义模型】支持自由添加任意第三方私有/本地大模型（如 Ollama、Grok、私有知识库），永久保存在本地',
      '【风控免疫架构】全面升级为 Chromium 原生独立隔离沙箱（Webview）与标准桌面 Chrome 身份伪装，彻底消除反嵌套警告与风控拦截',
      '【持久化登录】接入物理磁盘持久化存储池（persist:ai_arena），用户登录状态、账户凭证与历史对话永久保留，无需重复登录',
      '【生态闭环】与【提示词宝典】深度联动，精选实战 Prompt 模板支持一键送入双模型分屏对比'
    ],
    changesEn: [
      'New feature: AI Model Arena featuring 10 top domestic and global LLMs (DeepSeek R1, ChatGPT, Kimi, Doubao, Qwen, Claude) with 1:1 split-screen real-time comparison',
      'Support custom AI models: easily add local Ollama, Grok, or private knowledge bases with persistent local storage',
      'Stealth sandboxing architecture: isolated Webview processes with genuine desktop Chrome signatures bypass anti-framing and bot-detection guards',
      'Persistent authentication: session and cookies are stored on disk (persist:ai_arena) to preserve login states indefinitely',
      'Ecosystem integration: one-click dispatch from Prompts Hub into dual-model split-screen comparison'
    ]
  },
  {
    version: 'v1.5.0',
    date: '2026-08-18',
    title: 'AI 提示词灵感宝典发布与内置浏览器智能全自动翻译',
    titleEn: 'AI Prompts Hub & Persistent In-App Browser Auto-Translation',
    changes: [
      '【重磅功能】新增【AI 提示词灵感宝典】：收录 11 大全球权威及高星开源 Prompt 平台（Anthropic 官方提示词库、LiblibAI、OpenArt、FlowGPT 等），一键直达海量灵感',
      '【实战模板】精选 5 大高频场景结构化提示词模板（网文开篇大纲、AI 架构师开发、Midjourney 咒语、职场文案、学术思考），支持参数动态交互填空与秒级一键复制',
      '【内置浏览器大升级】新增【全自动常驻持续网页翻译】：基于 MutationObserver 底层监听，单页应用动态加载与站内切页跳转均自动持续翻译为中文，支持一键还原原文与状态高亮',
      '【导航增强】内置浏览器新增【在系统默认浏览器 (Edge/Chrome) 打开】快捷按键与【后退/前进/刷新】完整网页控制',
      '【全局交互】左侧胶囊悬浮导航栏提升为全页面顶级常驻，跨模块自由切换无缝衔接'
    ],
    changesEn: [
      'New feature: AI Prompts Hub featuring 11 curated top prompt platforms (Anthropic Library, LiblibAI, OpenArt, FlowGPT) and rich prompt communities',
      'Curated production-ready prompt templates across 5 core categories with interactive variable fill-in and one-click instant copy',
      'Persistent in-app browser auto-translation with MutationObserver: dynamic SPA updates and sub-page navigations are automatically translated into Chinese',
      'Added "Open in System Default Browser" (Edge/Chrome) shortcut and complete navigation controls (Back, Forward, Reload)',
      'Global floating capsule navigation bar is now persistently mounted across all sub-pages for seamless switching'
    ]
  },
  {
    version: 'v1.4.4',
    date: '2026-08-16',
    title: '内置浏览器防护体系：协议弹窗根除与稳定性大修',
    titleEn: 'In-App Browser Hardening: Protocol Dialogs Eliminated',
    changes: [
      '【重要修复】彻底解决刷抖音等网站时 Windows 反复弹出"获取打开此链接的应用"系统对话框的问题：应用认领 bytedance 等字节系协议并静默终结，任何网站的自定义协议唤起一律免疫',
      '【优化】系统级封锁网站借应用身份弹送的 Windows 通知（注册表层实现，不干扰网页正常浏览）',
      '【稳定性】网页渲染进程崩溃时自动整页重载，杜绝黑屏死区',
      '【工具链】本地更新脚本三级保障：NSIS 静默安装 → 失败自动重试 → win-unpacked 直拷覆盖，更新永远可落地'
    ],
    changesEn: [
      'Eliminated the recurring Windows "look for an app to open this link" dialog when browsing sites like Douyin: ByteDance custom protocols are claimed and silently terminated, plus a universal guard for all custom-protocol launches',
      'Windows-level registry block stops websites from sending system notifications under the app identity, without touching page behavior',
      'Crashed renderers now auto-reload, eliminating dead black areas',
      'Local updater now has three-tier fallbacks: NSIS silent install, auto-retry, and direct win-unpacked overlay copy'
    ]
  },
  {
    version: 'v1.4.3',
    date: '2026-08-16',
    title: '图标加载系统重构：Logo 显示修复与启动提速',
    titleEn: 'Favicon System Rebuild: Logo Fix & Faster Startup',
    changes: [
      '【重要修复】修复部分分类（如 AI 聊天对话）大量卡片图标无法显示网站 Logo 的问题',
      '【性能】应用启动图标加载显著提速：移除不稳定的备用图标源（404/超时），主源全量实测健康',
      '【健壮性】图标失败状态不再永久缓存，网络恢复后重开应用自动重试，杜绝"死亡图标"',
      '历史被污染的图标缓存一次性作废重建，首次启动约 1 秒内全量解析，之后恢复首帧秒开'
    ],
    changesEn: [
      'Fixed broken website logos on many cards (e.g. the AI Chat category)',
      'Faster startup icon loading: removed an unreliable fallback source (404/timeouts)',
      'Failed icon lookups are no longer persisted; they auto-retry after network recovery',
      'Poisoned legacy icon cache invalidated and rebuilt once (~1s), then instant first paint'
    ]
  },
  {
    version: 'v1.4.2',
    date: '2026-08-16',
    title: '收藏的视频直接看 & 官网实拍展示上线',
    titleEn: 'Play Favorited Videos In-App & Landing Page Showcase',
    changes: [
      '【收藏视频】收藏的 B站 / YouTube 视频点击卡片即可应用内直接播放，与精选视频同款体验；旧视频书签自动升级，B站封面自动补抓',
      '【重要修复】修复内置浏览器"收藏链接"因数据异常导致收藏静默失败的 Bug，并自动归类视频收藏',
      '【官网】落地页全新实拍展示区：应用内真实截图直观呈现收藏看视频、视频合集等核心功能',
      '强化本地更新脚本：安装前自动关闭应用 + 安装后文件级落地校验，杜绝假成功'
    ],
    changesEn: [
      'Favorited Bilibili / YouTube videos now play in-app with one click; legacy video bookmarks auto-upgrade with covers fetched',
      'Fixed a critical bug where favoriting from the in-app browser silently failed; video favorites now categorized automatically',
      'Landing page revamped with real app screenshots showcasing favorites playback and the video hub',
      'Hardened local updater: auto-close app before install plus file-level verification'
    ]
  },
  {
    version: 'v1.4.1',
    date: '2026-08-16',
    title: '视频合集大扩充 & 窗口控制全页面可用',
    titleEn: 'Video Hub Expansion & Global Window Controls',
    changes: [
      '【视频合集】新增「直播平台」分类：虎牙、斗鱼、B站直播、抖音直播、YY直播、网易CC直播',
      '【视频合集】「视频平台」新增腾讯视频、芒果TV、西瓜视频、咪咕视频 4 个影视站点，总收录由 14 增至 26',
      '【窗口控制】最小化 / 关闭按钮现已在全部功能页顶栏显示，任意页面均可直接操作窗口',
      '强化本地更新脚本：自动定位任意安装盘符并校验安装真正落地，杜绝假成功'
    ],
    changesEn: [
      'Video hub: new Live Streaming category with Huya, Douyu, Bilibili Live, Douyin Live, YY and NetEase CC',
      'Video hub: added Tencent Video, Mango TV, Xigua Video and Migu Video, expanding collection from 14 to 26',
      'Window controls (minimize / close) now available on every page header',
      'Hardened local update script: auto-locates install directory on any drive and verifies installation'
    ]
  },
  {
    version: 'v1.4.0',
    date: '2026-08-16',
    title: '文件转换接入 Convertio & 网络工具升级导航页',
    titleEn: 'Convertio Integration & Network Tools Navigation',
    changes: [
      '【文件转换】全面重构：桌面端应用内直接内嵌 Convertio 官方页面，支持 300+ 文件格式在线互转；网页版自动降级为跳转卡片',
      '【网络工具】自研工具箱升级为精选导航页：收录站长工具、ITDOG、MXToolbox、DNSChecker 等 10 款优质在线网络工具（全部实测可用）',
      '移除 jspdf、pdfjs-dist、mammoth 等 7 个无引用历史依赖与死文件，仓库更精简、构建更快'
    ],
    changesEn: [
      'File conversion rebuilt: desktop app embeds the official Convertio page for 300+ format online conversion; web version falls back to a redirect card',
      'Network tools upgraded from self-built toolbox to a curated navigation page featuring Chinaz, ITDOG, MXToolbox, DNSChecker and more (all verified working)',
      'Removed 7 unused legacy dependencies and dead files for a leaner repo and faster builds'
    ]
  },
  {
    version: 'v1.3.1',
    date: '2026-08-12',
    title: '新增 AI 写作与小说生成分类 & 淘汰失效死链',
    titleEn: 'AI Novel Writing Category & Dead Links Elimination',
    changes: [
      '新增顶级分类【AI 写作与小说生成】，收录 SillyTavern (3.1万★)、AutoNovel、Sudowrite 等 12 款热门 AI 写作与小说生成工具',
      '开源项目全面升格关联官方宣传与体验首页（如 sillytavern.app、aidungeon.com 等）',
      '检测并清理淘汰已失效 404 死链（TaskingAI 等）',
      '全量规范 GitHub Release 标题格式为 AI Toolbox vX.X.X'
    ],
    changesEn: [
      'Added AI Novel Writing category featuring SillyTavern (30.9k★), AutoNovel, Sudowrite and 12 top AI writing platforms',
      'Upgraded open-source tool links to official showcase websites (sillytavern.app, aidungeon.com, etc.)',
      'Cleaned up verified broken 404 links (TaskingAI)',
      'Standardized GitHub release title format to AI Toolbox vX.X.X'
    ]
  },
  {
    version: 'v1.3.0',
    date: '2026-08-11',
    title: '新增 28 款主流 AI Agent 平台 & 永久解决图标重载问题',
    titleEn: '28 Mainstream AI Agent Platforms & Zero-Flicker Icon Caching',
    changes: [
      '新增独立【AI 编程 Agent】分类与 28 款全球/国产大厂主流 AI Agent 平台（包括 Google Antigravity、Claude Code、OpenAI Codex、Trae、Qoder、ZCode 等）',
      '重构图标加载与 LocalStorage 持久化缓存，彻底解决每次重进应用重复刷新与闪烁问题',
      '修正应用主界面左上角 Logo 指向官方图标标志 /icon.png',
      '移除应用启动时清除 HTTP 缓存的限制，大幅提升离线与重复打开加载速度'
    ],
    changesEn: [
      'Added dedicated AI Coding Agents category with 28 top global and Chinese AI Agent platforms',
      'Refactored icon loading with LocalStorage caching to eliminate icon reloading and flickering',
      'Updated top-left app header logo to official icon mark /icon.png',
      'Removed startup cache wipe to boost app launching performance'
    ]
  },
  {
    version: 'v1.2.9',
    date: '2026-08-11',
    title: '深度瘦身省 609MB & 新增顶级 AI Agent 平台',
    titleEn: '609MB Resource Slimming & Top AI Agent Platforms',
    changes: [
      '剔除编译依赖，桌面安装资源体积从 975MB 暴降至 366MB（资源缩减 609MB）',
      '新增独立【AI 编程 Agent】分类与 28 款全球/国产大厂主流 AI Agent 平台（包括 Google Antigravity、Claude Code、OpenAI Codex、Trae、Qoder、ZCode 等）',
      '优化网站 Favicon/Logo 加载速度，彻底解决图标重复闪烁与超时延迟',
      '内嵌静默升级进度条，支持全流程静默更新体验'
    ],
    changesEn: [
      'Slimmed desktop package footprint from 975MB down to 366MB (saved 609MB)',
      'Added dedicated AI Coding Agents category with 28 top global and Chinese AI Agent platforms',
      'Optimized site favicon loading performance and eliminated icon flickering',
      'Added in-app background download progress bar'
    ]
  },
  {
    version: 'v1.2.8',
    date: '2026-08-10',
    title: '应用内嵌入安装进度条 & Cloudflare Pages 全球静止发布',
    titleEn: 'In-App Download Progress & Cloudflare Pages Static Release',
    changes: [
      '设置面板内嵌无感知背景升级进度条',
      '完成 Cloudflare Pages 全球 CDN 在线版本实时部署上线',
      '修复 React Hook 顺序引发的渲染异常'
    ],
    changesEn: [
      'Embedded smooth download progress bar into settings dialog',
      'Deployed live static app on Cloudflare Pages global CDN',
      'Fixed React Hook ordering issue'
    ]
  },
  {
    version: 'v1.2.7',
    date: '2026-08-10',
    title: '极简 Logo、无边框悬浮侧边栏与版本检测绑定',
    titleEn: 'Minimalist Logo, Frameless Floating Sidebar & Version Sync',
    changes: [
      '应用确认选择的 Logo 方案二（纯矢量图形、无文字）',
      '全新无边框（Frameless）应用架构，打造左侧悬浮圆角胶囊导航与沉浸无界移动窗口',
      '系统设置内增加版本实时比对与单实例防护',
      '最近 4 次更新日志支持全网实时读取推送'
    ],
    changesEn: [
      'Applied Logo Option 2 pure icon mark (no text)',
      'Constructed Frameless window architecture with floating pill sidebar and draggable window header',
      'Added SemVer real-time version compare and single-instance protection',
      'Supported live fetching of latest 4 release notes'
    ]
  },
  {
    version: 'v1.2.6',
    date: '2026-08-10',
    title: '卡片常用置顶、拖拽重排与全网真实 Logo 支持',
    titleEn: 'Card Pinning, Drag & Drop Reordering & Real Domain Logos',
    changes: [
      '每个工具卡片增加【常用置顶】按键，设为常用的卡片自动置顶在最最前面',
      '支持工具卡片在列表间自由拖拽排布顺序',
      '全部工具替换为当前链接的真实网站 Favicon / 官方图标，不使用占位图',
      '响应 Issue #1 新增 Recapo.ai 智能剪辑及全网 22 个热门 AI 工具'
    ],
    changesEn: [
      'Added Pin-to-top button on each card; pinned tools automatically float to top',
      'Supported free Drag-and-drop card reordering in categories',
      'Replaced tool icons with real website favicons/logos',
      'Added Recapo.ai (Issue #1) and 22 trending AI tools'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-08-03',
    title: '新增驱动中心与网络工具箱',
    titleEn: 'Driver Center & Network Tools Added',
    changes: [
      '新增驱动工具中心：品牌电脑、硬件厂商、键鼠外设官方驱动入口汇总',
      '新增网络工具箱：IP查询、DNS解析、HTTP检测与端口分析工具',
      '新增硬件驱动分类一键查找导航'
    ],
    changesEn: [
      'Added Driver Center for brand PC, hardware & outer peripherals driver downloads',
      'Added Network Toolbox for IP, DNS, HTTP status, and Port inspection',
      'Added categorized navigation for official driver portals'
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026-08-01',
    title: '文件格式转换中心与内置浏览器',
    titleEn: 'File Converter & In-App Browser',
    changes: [
      '新增纯本地文件格式转换中心（图片互转、PDF↔Word、Markdown/JSON/CSV/Base64）',
      '新增内置多标签页浏览器，点击工具支持在应用内直接全屏多标签浏览',
      '支持收藏链接到本地文件库，自动提取视频封面与标题'
    ],
    changesEn: [
      'Added local file format converter (Images, PDF↔Word, Markdown, JSON, CSV)',
      'Added built-in multi-tab browser for smooth in-app web navigation',
      'Supported local link favorites with auto video metadata fetching'
    ]
  }
]

function isGreaterVersion(remote: string, local: string): boolean {
  const p1 = (remote || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)
  const p2 = (local || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0
    const n2 = p2[i] || 0
    if (n1 > n2) return true
    if (n1 < n2) return false
  }
  return false
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'browsing' | 'data' | 'update' | 'about'>('general')
  const [isDesktop, setIsDesktop] = useState(false)
  const [linkSettings, setLinkSettings] = useState<LinkSettings>({ mode: 'ask', browserPath: '' })
  const [browsers, setBrowsers] = useState<BrowserInfo[]>([])
  const [savedTip, setSavedTip] = useState(false)
  const [clearTip, setClearTip] = useState('')

  const [appVersion, setAppVersion] = useState('')
  const [showChangelog, setShowChangelog] = useState(false)
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>(FALLBACK_RELEASE_NOTES)

  // 检查更新状态
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateResult, setUpdateResult] = useState<{
    status: 'idle' | 'latest' | 'available' | 'error'
    version?: string
    url?: string
    message?: string
  }>({ status: 'idle' })
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!open) return
    const api = (window as unknown as {
      appAPI?: {
        getSettings?: () => Promise<{ settings: LinkSettings; browsers: BrowserInfo[] }>
        getVersion?: () => Promise<string>
      }
    }).appAPI

    if (api) {
      if (api.getVersion) {
        api.getVersion().then((v) => { if (v) setAppVersion(v) }).catch(() => {})
      }
      if (api.getSettings) {
        setIsDesktop(true)
        api.getSettings().then((data) => {
          setLinkSettings(data.settings || { mode: 'ask', browserPath: '' })
          setBrowsers(data.browsers || [])
        }).catch(() => {})
      }
    } else {
      setIsDesktop(false)
    }

    // 实时读取 GitHub 动态最新的最近 4 次 Release 日志
    fetch('https://api.github.com/repos/khssdsg-maker/ai-toolbox/releases?per_page=4')
      .then(res => res.json())
      .then((data: Array<{ tag_name: string; published_at?: string; name?: string; body?: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          const fetched: ReleaseNote[] = data.map(rel => {
            const lines = (rel.body || '')
              .split('\n')
              .map(l => l.trim())
              .filter(l => l && !l.startsWith('#') && !l.startsWith('>') && !l.includes('核心功能与变更'))
              .map(l => l.replace(/^[-*•]\s*/, ''))
            let titleStr = rel.name || rel.tag_name || '更新版本'
            titleStr = titleStr.replace(/^AI万能工具箱\s*(v\d+\.\d+\.\d+)?\s*[—\-:]\s*/i, '')
            return {
              version: rel.tag_name || 'v1.0.0',
              date: rel.published_at ? rel.published_at.substring(0, 10) : '',
              title: titleStr,
              titleEn: titleStr,
              changes: lines.length > 0 ? lines : [titleStr],
              changesEn: lines.length > 0 ? lines : [titleStr]
            }
          })
          setReleaseNotes(fetched)
        }
      })
      .catch(() => {})
  }, [open])

  const [capsuleTheme, setCapsuleTheme] = useState<CapsuleThemeKey>('mint')
  const [uiTheme, setUiTheme] = useState<string>('default')
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig>(DEFAULT_WALLPAPER_CONFIG)

  useEffect(() => {
    try {
      const savedCapsule = localStorage.getItem('ai-toolbox-capsule-theme') as CapsuleThemeKey
      if (savedCapsule && CAPSULE_THEMES.some(t => t.key === savedCapsule)) setCapsuleTheme(savedCapsule)

      const savedUiTheme = localStorage.getItem('ai-toolbox-ui-theme')
      if (savedUiTheme) setUiTheme(savedUiTheme)

      const savedWallpaper = localStorage.getItem('ai-toolbox-wallpaper-config')
      if (savedWallpaper) setWallpaperConfig({ ...DEFAULT_WALLPAPER_CONFIG, ...JSON.parse(savedWallpaper) })
    } catch {}
  }, [open])

  const handleSetCapsuleTheme = (thKey: CapsuleThemeKey) => {
    setCapsuleTheme(thKey)
    try {
      localStorage.setItem('ai-toolbox-capsule-theme', thKey)
      window.dispatchEvent(new CustomEvent('ai-toolbox-capsule-theme-change', { detail: { theme: thKey } }))
    } catch {}
  }

  const handleSetUiTheme = (themeKey: string) => {
    setUiTheme(themeKey)
    try {
      localStorage.setItem('ai-toolbox-ui-theme', themeKey)
      window.dispatchEvent(new CustomEvent('ai-toolbox-ui-theme-change', { detail: { theme: themeKey } }))
    } catch {}
  }

  const handleUpdateWallpaper = (partial: Partial<WallpaperConfig>) => {
    const next = { ...wallpaperConfig, ...partial }
    setWallpaperConfig(next)
    try {
      localStorage.setItem('ai-toolbox-wallpaper-config', JSON.stringify(next))
      window.dispatchEvent(new CustomEvent('ai-toolbox-wallpaper-change', { detail: next }))
    } catch {}
  }

  const [weWallpapers, setWeWallpapers] = useState<WallpaperEngineItem[]>([])
  const [weScanning, setWeScanning] = useState(false)
  const [weCurrentPath, setWeCurrentPath] = useState<string>('')

  // 扫描 Wallpaper Engine 壁纸
  const handleScanWallpaperEngine = async () => {
    setWeScanning(true)
    try {
      const api = (window as unknown as {
        appAPI?: {
          scanWallpaperEngine?: (path?: string) => Promise<{ path: string; items: WallpaperEngineItem[] }>
        }
      }).appAPI

      if (api && api.scanWallpaperEngine) {
        const res = await api.scanWallpaperEngine()
        if (res && res.items) {
          setWeWallpapers(res.items)
          setWeCurrentPath(res.path || '')
          if (res.items.length === 0) {
            alert(t('未在 Steam 默认路径检测到 Wallpaper Engine 创意工坊壁纸，请点击【选择本地壁纸目录】手动指定。', 'No Wallpaper Engine items found in default paths. Please choose folder manually.'))
          }
        }
      } else {
        alert(t('Wallpaper Engine 本地联动仅在桌面客户端中支持', 'Wallpaper Engine sync is only supported in desktop client'))
      }
    } catch {
      alert(t('扫描壁纸失败，请重试', 'Failed to scan wallpapers'))
    } finally {
      setWeScanning(false)
    }
  }

  // 手动选择 Wallpaper 文件夹
  const handleSelectWallpaperFolder = async () => {
    setWeScanning(true)
    try {
      const api = (window as unknown as {
        appAPI?: {
          selectWallpaperFolder?: () => Promise<{ path: string; items: WallpaperEngineItem[] } | null>
        }
      }).appAPI

      if (api && api.selectWallpaperFolder) {
        const res = await api.selectWallpaperFolder()
        if (res && res.items) {
          setWeWallpapers(res.items)
          setWeCurrentPath(res.path || '')
        }
      }
    } catch {}
    finally {
      setWeScanning(false)
    }
  }

  const handleApplyWallpaperEngineItem = (item: WallpaperEngineItem) => {
    handleUpdateWallpaper({
      type: item.type,
      url: item.mediaUrl || item.mediaPath,
    })
  }

  const handleUploadWallpaperFile = (e: React.ChangeEvent<HTMLInputElement>, isVideo = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        handleUpdateWallpaper({
          type: isVideo ? 'video' : 'image',
          url: result,
        })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useEffect(() => { setMounted(true) }, [])

  if (!open || !mounted) return null

  // 保存链接打开方式（桌面应用）
  const saveLinkSettings = (s: LinkSettings) => {
    setLinkSettings(s)
    const api = (window as unknown as { appAPI?: { saveSettings?: (x: LinkSettings) => void } }).appAPI
    if (api && api.saveSettings) {
      api.saveSettings(s)
      setSavedTip(true)
      setTimeout(() => setSavedTip(false), 1500)
    }
  }

  // 打开本地数据物理目录
  const handleOpenDataFolder = () => {
    const api = (window as unknown as { appAPI?: { openDataFolder?: () => void } }).appAPI
    if (api && api.openDataFolder) {
      api.openDataFolder()
    } else {
      alert(t('网页版无需本地目录，数据直接保存在浏览器中', 'Web version data is saved directly in browser'))
    }
  }

  // 导出全量数据备份（全6大导航枢纽自定义数据、主题与壁纸配置）
  const handleExportAllData = () => {
    try {
      const backup = {
        app: 'AI万能工具箱',
        version: appVersion || '1.5.6',
        exportDate: new Date().toISOString(),
        favorites: JSON.parse(localStorage.getItem('ai-toolbox-favorites') || '[]'),
        customTools: JSON.parse(localStorage.getItem('ai-toolbox-custom-tools') || '[]'),
        customCategories: JSON.parse(localStorage.getItem('ai-toolbox-custom-categories') || '[]'),
        pinnedTools: JSON.parse(localStorage.getItem('ai-toolbox-pinned-tools') || '[]'),
        customDrivers: JSON.parse(localStorage.getItem('ai-toolbox-custom-drivers') || '[]'),
        customConverters: JSON.parse(localStorage.getItem('ai-toolbox-custom-converters') || '[]'),
        customNetworkTools: JSON.parse(localStorage.getItem('ai-toolbox-custom-network-tools') || '[]'),
        customPromptsTools: JSON.parse(localStorage.getItem('ai-toolbox-custom-prompts-tools') || '[]'),
        customVideos: JSON.parse(localStorage.getItem('ai-toolbox-custom-videos') || '[]'),
        promptFavs: JSON.parse(localStorage.getItem('ai_toolbox_prompt_favs') || '[]'),
        capsuleTheme: localStorage.getItem('ai-toolbox-capsule-theme') || 'mint',
        uiTheme: localStorage.getItem('ai-toolbox-ui-theme') || 'default',
        wallpaperConfig: JSON.parse(localStorage.getItem('ai-toolbox-wallpaper-config') || '{}'),
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `ai-toolbox-full-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
    } catch {}
  }

  // 恢复全量数据备份（覆盖并持久化全6大导航枢纽数据、主题与壁纸）
  const handleImportAllData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data && typeof data === 'object') {
          if (Array.isArray(data.favorites)) {
            localStorage.setItem('ai-toolbox-favorites', JSON.stringify(data.favorites))
            window.dispatchEvent(new CustomEvent('ai-toolbox-favorites-updated'))
          }
          if (Array.isArray(data.customTools)) {
            localStorage.setItem('ai-toolbox-custom-tools', JSON.stringify(data.customTools))
          }
          if (Array.isArray(data.customCategories)) {
            localStorage.setItem('ai-toolbox-custom-categories', JSON.stringify(data.customCategories))
          }
          if (Array.isArray(data.pinnedTools)) {
            localStorage.setItem('ai-toolbox-pinned-tools', JSON.stringify(data.pinnedTools))
          }
          if (Array.isArray(data.customDrivers)) {
            localStorage.setItem('ai-toolbox-custom-drivers', JSON.stringify(data.customDrivers))
          }
          if (Array.isArray(data.customConverters)) {
            localStorage.setItem('ai-toolbox-custom-converters', JSON.stringify(data.customConverters))
          }
          if (Array.isArray(data.customNetworkTools)) {
            localStorage.setItem('ai-toolbox-custom-network-tools', JSON.stringify(data.customNetworkTools))
          }
          if (Array.isArray(data.customPromptsTools)) {
            localStorage.setItem('ai-toolbox-custom-prompts-tools', JSON.stringify(data.customPromptsTools))
          }
          if (Array.isArray(data.customVideos)) {
            localStorage.setItem('ai-toolbox-custom-videos', JSON.stringify(data.customVideos))
          }
          if (Array.isArray(data.promptFavs)) {
            localStorage.setItem('ai_toolbox_prompt_favs', JSON.stringify(data.promptFavs))
          }
          if (data.capsuleTheme) {
            localStorage.setItem('ai-toolbox-capsule-theme', data.capsuleTheme)
            window.dispatchEvent(new CustomEvent('ai-toolbox-capsule-theme-change', { detail: { theme: data.capsuleTheme } }))
          }
          if (data.uiTheme) {
            localStorage.setItem('ai-toolbox-ui-theme', data.uiTheme)
            window.dispatchEvent(new CustomEvent('ai-toolbox-ui-theme-change', { detail: { theme: data.uiTheme } }))
          }
          if (data.wallpaperConfig && typeof data.wallpaperConfig === 'object') {
            localStorage.setItem('ai-toolbox-wallpaper-config', JSON.stringify(data.wallpaperConfig))
            window.dispatchEvent(new CustomEvent('ai-toolbox-wallpaper-change', { detail: data.wallpaperConfig }))
          }
          alert(t('🎉 全量数据备份恢复成功！包含所有导航卡片、主题与壁纸配置，页面将自动刷新生效。', 'Backup restored successfully! Reloading...'))
          window.location.reload()
        }
      } catch {
        alert(t('备份文件解析失败，请确认文件格式是否正确', 'Invalid backup file format'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // 清空收藏
  const handleClearFavorites = async () => {
    if (!confirm(t('确定要清空所有收藏吗？此操作无法撤销。', 'Clear all favorites? This cannot be undone.'))) return
    localStorage.removeItem('ai-toolbox-favorites')
    const api = (window as unknown as { appAPI?: { clearFavorites?: () => void } }).appAPI
    if (api && api.clearFavorites) {
      api.clearFavorites()
    }
    setClearTip(t('收藏已清空', 'Favorites cleared'))
    setTimeout(() => setClearTip(''), 2000)
  }

  // 手动检查更新
  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    setUpdateResult({ status: 'idle' })

    const api = (window as unknown as {
      appAPI?: {
        checkForUpdates?: () => Promise<{ status: string; version?: string; releaseUrl?: string; message?: string }>
        getVersion?: () => Promise<string>
      }
    }).appAPI

    let currentLocalVersion = appVersion
    if (api && api.getVersion) {
      try {
        const v = await api.getVersion()
        if (v) { currentLocalVersion = v; setAppVersion(v) }
      } catch {}
    }

    if (api && api.checkForUpdates) {
      try {
        const res = await api.checkForUpdates()
        if (res.status === 'available' || (res.version && isGreaterVersion(res.version, currentLocalVersion))) {
          setUpdateResult({
            status: 'available',
            version: res.version,
            url: res.releaseUrl || 'https://github.com/khssdsg-maker/ai-toolbox/releases/latest'
          })
        } else if (res.status === 'latest' || res.version) {
          setUpdateResult({ status: 'latest', version: currentLocalVersion || res.version })
        } else {
          setUpdateResult({ status: 'error', message: res.message || t('网络连接失败', 'Network connection error') })
        }
      } catch {
        setUpdateResult({ status: 'error', message: t('请求异常，请检查网络', 'Request failed, check network') })
      } finally {
        setCheckingUpdate(false)
      }
    } else {
      // 网页端在线请求 GitHub API
      try {
        const res = await fetch('https://api.github.com/repos/khssdsg-maker/ai-toolbox/releases/latest')
        if (res.ok) {
          const data = await res.json()
          const latestVer = (data.tag_name || '').replace(/^v/, '')
          if (latestVer && isGreaterVersion(latestVer, currentLocalVersion)) {
            setUpdateResult({
              status: 'available',
              version: latestVer,
              url: data.html_url || 'https://github.com/khssdsg-maker/ai-toolbox/releases/latest'
            })
          } else {
            setUpdateResult({ status: 'latest', version: currentLocalVersion || latestVer })
          }
        } else {
          setUpdateResult({ status: 'error', message: t('访问 GitHub 接口超时', 'Failed to reach GitHub API') })
        }
      } catch {
        setUpdateResult({ status: 'error', message: t('无法检查更新，请确认网络', 'Network error') })
      } finally {
        setCheckingUpdate(false)
      }
    }
  }

  const handleConfirmUpdate = () => {
    const api = (window as unknown as {
      appAPI?: {
        startDownloadUpdate?: () => Promise<{ status: string; message?: string }>
        onDownloadProgress?: (cb: (percent: number) => void) => void
      }
    }).appAPI

    if (api && api.startDownloadUpdate) {
      setIsDownloading(true)
      setDownloadProgress(0)
      if (api.onDownloadProgress) {
        api.onDownloadProgress((percent) => setDownloadProgress(percent))
      }
      api.startDownloadUpdate().then((res) => {
        if (res.status === 'error') {
          setIsDownloading(false)
          setDownloadProgress(null)
          setUpdateResult({ status: 'error', message: res.message || t('下载失败，请重试', 'Download failed') })
        }
      }).catch(() => {
        setIsDownloading(false)
        setDownloadProgress(null)
        setUpdateResult({ status: 'error', message: t('应用内下载出错', 'Download error') })
      })
    } else {
      if (updateResult.url) {
        window.open(updateResult.url, '_blank')
      } else {
        window.open('https://github.com/khssdsg-maker/ai-toolbox/releases/latest', '_blank')
      }
    }
  }

  const navTabs = [
    { id: 'general' as const, label: t('常规偏好', 'General'), icon: Settings2 },
    { id: 'appearance' as const, label: t('外观动效', 'Appearance'), icon: Sparkles },
    { id: 'browsing' as const, label: t('浏览跳转', 'Browsing'), icon: Globe },
    { id: 'data' as const, label: t('数据备份', 'Data & Backup'), icon: History },
    { id: 'update' as const, label: t('版本更新', 'Updates'), icon: RefreshCw },
    { id: 'about' as const, label: t('关于我们', 'About'), icon: AlertCircle },
  ]

  const linkOptions = [
    { value: 'ask', label: t('每次询问我', 'Ask every time') },
    { value: 'internal', label: t('应用内浏览器打开（带多标签页与实时翻译）', 'In-app browser (with tabs & translator)') },
    { value: 'external', label: t('系统默认外部浏览器', 'System default external browser') },
  ]

  const themeOptions = [
    { value: 'light', label: t('浅色', 'Light'), icon: Sun },
    { value: 'dark', label: t('深色', 'Dark'), icon: Moon },
    { value: 'system', label: t('跟随系统', 'System'), icon: Monitor },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 sm:p-6" onClick={onClose}>
      <div
        className="w-full max-w-4xl h-[620px] max-h-[90vh] rounded-2xl bg-card border border-border/70 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">{t('系统设置中心', 'Settings Studio')}</h2>
              <p className="text-[11px] text-muted-foreground">{t('个性化偏好、主题动效、浏览行为与数据备份', 'Preferences, Themes, Browsing & Full Backup')}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 主体双栏区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧导航栏 */}
          <aside className="w-48 sm:w-52 border-r border-border/40 p-3 bg-muted/15 flex flex-col gap-1.5 flex-shrink-0 overflow-y-auto">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}

            <div className="mt-auto pt-3 border-t border-border/30 px-2 text-[11px] text-muted-foreground/70">
              <p className="truncate">AI万能工具箱 v{appVersion || '1.5.6'}</p>
              <p className="text-[10px] text-muted-foreground/50">MIT Licensed</p>
            </div>
          </aside>

          {/* 右侧内容面板 */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. 常规偏好 */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <section>
                  <h3 className="text-sm font-bold text-foreground mb-1">{t('界面语言 (Language)', 'Interface Language')}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t('实时生效，无需重启软件', 'Instant change without restart')}</p>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      onClick={() => setLocale('zh')}
                      className={`p-3 rounded-xl border text-sm transition-all flex items-center justify-between ${
                        locale === 'zh' ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs' : 'border-border/50 hover:border-border text-muted-foreground'
                      }`}
                    >
                      <span>简体中文</span>
                      {locale === 'zh' && <span className="text-xs">✓</span>}
                    </button>
                    <button
                      onClick={() => setLocale('en')}
                      className={`p-3 rounded-xl border text-sm transition-all flex items-center justify-between ${
                        locale === 'en' ? 'border-primary bg-primary/5 text-primary font-semibold shadow-xs' : 'border-border/50 hover:border-border text-muted-foreground'
                      }`}
                    >
                      <span>English</span>
                      {locale === 'en' && <span className="text-xs">✓</span>}
                    </button>
                  </div>
                </section>

                <section className="pt-4 border-t border-border/40">
                  <h3 className="text-sm font-bold text-foreground mb-1">{t('窗口与运行状态', 'Window & Launch')}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t('智能记忆窗口大小、屏幕位置与最大化状态', 'Auto-restore window dimensions and maximize state')}</p>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{t('窗口状态物理记忆', 'Window State Memory')}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{t('已启用 (window-state.json)', 'Enabled')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('单实例防多开保护', 'Single Instance Lock')}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{t('已启用 (SingleLock)', 'Enabled')}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* 2. 外观与动效 */}
            {activeTab === 'appearance' && (
              <div className="space-y-7 animate-in fade-in duration-150 pb-6">
                {/* 1. 明暗模式 */}
                <section>
                  <h3 className="text-sm font-bold text-foreground mb-1">{t('明暗主题模式', 'Color Theme')}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t('选择深色、浅色或跟随 Windows 系统外观', 'Dark, Light or System default')}</p>
                  <div className="grid grid-cols-3 gap-3 max-w-lg">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon
                      const isSel = theme === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all ${
                            isSel
                              ? 'border-primary bg-primary/5 text-primary shadow-xs font-semibold ring-1 ring-primary/40'
                              : 'border-border/50 hover:border-border text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* 2. 全局界面氛围主题 */}
                <section className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">{t('全局界面氛围主题 (UI Accent Theme)', 'UI Accent Theme')}</h3>
                    </div>
                    <span className="text-xs text-primary font-medium">{t('与胶囊解耦 · 即时生效', 'Decoupled · Live Update')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t('为整个软件的主色调、高亮流光、卡片边框与按钮赋予专属氛围色彩', 'Set accent highlight colors and border glow across the whole application')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {UI_THEMES.map((th) => {
                      const isSelected = uiTheme === th.key
                      return (
                        <button
                          key={th.key}
                          type="button"
                          onClick={() => handleSetUiTheme(th.key)}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-foreground shadow-sm ring-1 ring-primary/50'
                              : 'border-border/50 hover:border-border text-muted-foreground'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0 shadow-sm ring-2 ring-background"
                            style={{ backgroundColor: th.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate text-foreground flex items-center justify-between">
                              <span>{locale === 'en' ? th.nameEn : th.name}</span>
                              {isSelected && <span className="text-[10px] text-primary">✓</span>}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                              {locale === 'en' ? th.descEn : th.desc}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* 3. 悬浮胶囊导航主题 */}
                <section className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-foreground">{t('悬浮胶囊 6 大动效主题', 'Capsule Island Themes')}</h3>
                    <span className="text-xs text-muted-foreground">{t('左侧常驻胶囊', 'Floating Island')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t('独立选择左侧悬浮胶囊岛的生物荧光、全息霓虹或机械金属质感', 'Choose live glowing & physics feedback styles for the capsule dock')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CAPSULE_THEMES.map((th) => {
                      const isSelected = capsuleTheme === th.key
                      return (
                        <button
                          key={th.key}
                          type="button"
                          onClick={() => handleSetCapsuleTheme(th.key)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-foreground shadow-sm ring-1 ring-primary/40'
                              : 'border-border/50 hover:border-border text-muted-foreground'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0 shadow-sm ring-2 ring-background"
                            style={{ backgroundColor: th.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate text-foreground">
                              {locale === 'en' ? th.nameEn : th.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                              {th.desc}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                {/* 4. 自定义壁纸与毛玻璃透明界面 */}
                <section className="pt-4 border-t border-border/40 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">{t('自定义壁纸与动态视频', 'Wallpaper & Dynamic Video')}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{t('沉浸式背景', 'Immersive Canvas')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('支持精选预设、本地静态图片与本地 MP4 动态视频循环播放', 'Presets, custom images and dynamic video loops (MP4/WebM)')}</p>

                  {/* 壁纸类型切换器 */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { id: 'none', label: t('🚫 纯净实体', 'No Wallpaper') },
                      { id: 'desktop', label: t('🪟 原生透视桌面', 'Desktop Acrylic') },
                      { id: 'we', label: t('🎮 Wallpaper Engine', 'Wallpaper Engine') },
                      { id: 'preset', label: t('🌟 精选流体光幕', 'Presets') },
                      { id: 'image', label: t('🖼️ 自定义图片', 'Custom Image') },
                      { id: 'video', label: t('🎬 动态视频', 'Dynamic Video') },
                      { id: 'url', label: t('🌐 网络直链', 'Online URL') },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          if (mode.id === 'we') {
                            if (weWallpapers.length === 0) handleScanWallpaperEngine()
                            handleUpdateWallpaper({ type: 'video' })
                          } else {
                            handleUpdateWallpaper({ type: mode.id as any })
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          (wallpaperConfig.type === mode.id || (mode.id === 'we' && weWallpapers.length > 0 && wallpaperConfig.type === 'video'))
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40'
                            : 'border-border/50 hover:border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. 原生透视电脑桌面 */}
                  {wallpaperConfig.type === 'desktop' && (
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs">
                        <Eye className="h-4 w-4" />
                        <span>{t('🪟 Windows 原生桌面亚克力透视模式已激活', 'Desktop Acrylic Translucency Active')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('软件窗口底层已完全穿透，您当前 Windows 电脑桌面上运行的任何壁纸（包括 Wallpaper Engine 桌面壁纸与桌面图标）都将透过毛玻璃卡片自然透出！', 'The window background is fully transparent to your real Windows desktop.')}
                      </p>
                    </div>
                  )}

                  {/* 2. Wallpaper Engine 创意工坊画廊 */}
                  {(wallpaperConfig.type === 'we' || weWallpapers.length > 0) && (
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4 text-primary" />
                          <h4 className="text-xs font-bold text-foreground">
                            {t('Wallpaper Engine 创意工坊已下载壁纸库', 'Wallpaper Engine Downloaded Library')}
                          </h4>
                          {weWallpapers.length > 0 && (
                            <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono font-bold">
                              {weWallpapers.length} 款
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={weScanning}
                            onClick={handleScanWallpaperEngine}
                            className="h-7 text-xs gap-1"
                          >
                            <RefreshCw className={`h-3 w-3 ${weScanning ? 'animate-spin' : ''}`} />
                            <span>{weScanning ? t('扫描中...', 'Scanning...') : t('重新扫描 Steam', 'Scan Steam')}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={weScanning}
                            onClick={handleSelectWallpaperFolder}
                            className="h-7 text-xs gap-1"
                          >
                            <FolderSearch className="h-3 w-3" />
                            <span>{t('选择本地目录', 'Pick Folder')}</span>
                          </Button>
                        </div>
                      </div>

                      {weCurrentPath && (
                        <p className="text-[10px] text-muted-foreground font-mono truncate bg-background/50 p-1.5 rounded-md border border-border/40">
                          {t('📁 当前壁纸目录: ', 'Directory: ')}{weCurrentPath}
                        </p>
                      )}

                      {/* 扫描到的壁纸网格画廊 */}
                      {weWallpapers.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                          {weWallpapers.map((item) => {
                            const isCurrent = wallpaperConfig.url === item.mediaUrl || wallpaperConfig.url === item.mediaPath
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleApplyWallpaperEngineItem(item)}
                                className={`group relative rounded-xl border p-2 flex flex-col gap-1.5 cursor-pointer transition-all ${
                                  isCurrent
                                    ? 'border-primary ring-2 ring-primary/50 bg-primary/10 shadow-md scale-[1.02]'
                                    : 'border-border/50 hover:border-primary/50 hover:bg-muted/40'
                                }`}
                              >
                                <div className="relative w-full h-20 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                                  {item.preview ? (
                                    <img
                                      src={item.preview}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <MonitorPlay className="h-8 w-8 text-muted-foreground/50" />
                                  )}
                                  <span className="absolute top-1 right-1 text-[9px] bg-black/70 text-white px-1.5 py-0.2 rounded font-medium backdrop-blur-xs">
                                    {item.type === 'video' ? '🎬 动态视频' : '🖼️ 静态图片'}
                                  </span>
                                  {isCurrent && (
                                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-xs">
                                      ✓ 使用中
                                    </div>
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-foreground truncate" title={item.title}>
                                  {item.title}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-border/60 text-center space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {t('点击上方【重新扫描 Steam】或【选择本地目录】导入您的 Wallpaper Engine 壁纸', 'Click Scan Steam or Pick Folder to import your Wallpaper Engine collection.')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. 预设列表 */}
                  {wallpaperConfig.type === 'preset' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 animate-in fade-in duration-150">
                      {WALLPAPER_PRESETS.map((p) => {
                        const isSel = wallpaperConfig.presetId === p.id
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleUpdateWallpaper({ presetId: p.id })}
                            className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                              isSel
                                ? 'border-primary ring-2 ring-primary/50 shadow-md scale-[1.02]'
                                : 'border-border/50 hover:border-border opacity-85 hover:opacity-100'
                            }`}
                          >
                            <div
                              className="w-full h-12 rounded-lg shadow-inner flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ background: p.preview }}
                            >
                              {isSel && '✓'}
                            </div>
                            <span className="text-[11px] font-bold text-foreground truncate">
                              {locale === 'en' ? p.nameEn : p.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* 本地图片上传 */}
                  {wallpaperConfig.type === 'image' && (
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <UploadCloud className="h-4 w-4 text-primary" />
                          <span>{t('选择本地图片 (JPG / PNG / WEBP)', 'Choose Local Image')}</span>
                        </label>
                        {wallpaperConfig.url && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWallpaper({ url: '' })}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>{t('清除图片', 'Clear')}</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={(e) => handleUploadWallpaperFile(e, false)}
                        className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* 本地视频上传 */}
                  {wallpaperConfig.type === 'video' && (
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-primary" />
                          <span>{t('选择本地动态视频 (MP4 / WebM)', 'Choose Dynamic Video')}</span>
                        </label>
                        {wallpaperConfig.url && (
                          <button
                            type="button"
                            onClick={() => handleUpdateWallpaper({ url: '' })}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>{t('清除视频', 'Clear')}</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={(e) => handleUploadWallpaperFile(e, true)}
                        className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                      />
                      <p className="text-[11px] text-muted-foreground/80">
                        {t('⚡ 提示：视频将在背景以硬件加速静音循环播放，建议分辨率 1080P 以内以获得最佳流畅度。', 'Video plays muted in a hardware-accelerated loop in the background.')}
                      </p>
                    </div>
                  )}

                  {/* 在线 URL */}
                  {wallpaperConfig.type === 'url' && (
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2 animate-in fade-in duration-150">
                      <label className="text-xs font-semibold text-foreground block">
                        {t('图片或 MP4 视频网络直链 URL', 'Direct Image or MP4 Video URL')}
                      </label>
                      <input
                        type="text"
                        placeholder="https://.../wallpaper.mp4 或 https://.../bg.jpg"
                        value={wallpaperConfig.url}
                        onChange={(e) => handleUpdateWallpaper({ url: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}

                  {/* 遮罩、模糊与毛玻璃透明度调节器 */}
                  <div className="p-4 rounded-xl border border-border/50 bg-muted/15 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/30 pb-3">
                      <div>
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span>{t('✨ 亚克力毛玻璃透明界面', 'Acrylic Glassmorphism Mode')}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {t('开启后顶栏、侧边栏与卡片底板呈现半透明高斯磨砂质感', 'Semi-transparent frosted glass across headers and cards')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wallpaperConfig.glassMode || wallpaperConfig.type !== 'none'}
                          onChange={(e) => handleUpdateWallpaper({ glassMode: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-semibold text-foreground">{t('壁纸遮罩暗化度', 'Mask Opacity')}</span>
                          <span className="text-muted-foreground font-mono">{Math.round(wallpaperConfig.maskOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.05"
                          value={wallpaperConfig.maskOpacity}
                          onChange={(e) => handleUpdateWallpaper({ maskOpacity: parseFloat(e.target.value) })}
                          className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-semibold text-foreground">{t('背景高斯模糊', 'Background Blur')}</span>
                          <span className="text-muted-foreground font-mono">{wallpaperConfig.bgBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="1"
                          value={wallpaperConfig.bgBlur}
                          onChange={(e) => handleUpdateWallpaper({ bgBlur: parseInt(e.target.value, 10) })}
                          className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-semibold text-foreground">{t('界面半透明度', 'Glass Opacity')}</span>
                          <span className="text-muted-foreground font-mono">{Math.round(wallpaperConfig.glassOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="0.9"
                          step="0.05"
                          value={wallpaperConfig.glassOpacity}
                          onChange={(e) => handleUpdateWallpaper({ glassOpacity: parseFloat(e.target.value) })}
                          className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="font-semibold text-foreground">{t('毛玻璃磨砂半径', 'Frosted Radius')}</span>
                          <span className="text-muted-foreground font-mono">{wallpaperConfig.glassBlur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="2"
                          value={wallpaperConfig.glassBlur}
                          onChange={(e) => handleUpdateWallpaper({ glassBlur: parseInt(e.target.value, 10) })}
                          className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* 3. 网页与浏览 */}
            {activeTab === 'browsing' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <section>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-foreground">{t('链接打开方式偏好', 'Link Opening Preference')}</h3>
                    {savedTip && <span className="text-xs text-green-600 font-semibold">{t('已实时保存 ✓', 'Saved ✓')}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t('在桌面应用中点击工具卡片时的默认跳转行为', 'Default target when clicking tool cards in desktop app')}</p>
                  
                  <div className="space-y-2 max-w-xl">
                    {linkOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          linkSettings.mode === opt.value && !(opt.value === 'external' && linkSettings.browserPath)
                            ? 'border-primary bg-primary/5 text-foreground font-medium'
                            : 'border-border/50 hover:border-border text-muted-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name="linkmode"
                          checked={linkSettings.mode === opt.value && !(opt.value === 'external' && linkSettings.browserPath)}
                          onChange={() => saveLinkSettings({ mode: opt.value, browserPath: '' })}
                          className="accent-[hsl(33_92%_55%)]"
                        />
                        <span className="text-xs sm:text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {browsers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30 max-w-xl">
                      <p className="text-xs font-semibold text-foreground mb-2">{t('或定向指定已安装的外部浏览器：', 'Or route directly to an installed browser:')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {browsers.map((b) => (
                          <label
                            key={b.path}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                              linkSettings.browserPath === b.path
                                ? 'border-primary bg-primary/5 text-foreground font-semibold'
                                : 'border-border/50 hover:border-border text-muted-foreground'
                            }`}
                          >
                            <input
                              type="radio"
                              name="linkmode"
                              checked={linkSettings.browserPath === b.path}
                              onChange={() => saveLinkSettings({ mode: 'external', browserPath: b.path })}
                              className="accent-[hsl(33_92%_55%)]"
                            />
                            <span className="truncate">{b.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* 4. 数据与备份 */}
            {activeTab === 'data' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <section>
                  <h3 className="text-sm font-bold text-foreground mb-1">{t('全量数据备份与迁移', 'Full Data Backup & Restore')}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t('一键导出包含「个人收藏 + 自建分类 + 自定义工具 + 拖拽排版记忆」的完整 JSON 备份', 'Export full JSON backup including favorites, custom categories & layout')}</p>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleExportAllData} className="gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>{t('导出全量备份 (JSON)', 'Export Full Backup (JSON)')}</span>
                    </Button>

                    <label className="cursor-pointer">
                      <input type="file" accept=".json" onChange={handleImportAllData} className="hidden" />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted text-xs font-medium transition-colors">
                        <History className="h-3.5 w-3.5 text-blue-500" />
                        <span>{t('导入备份文件', 'Import Backup File')}</span>
                      </span>
                    </label>

                    {isDesktop && (
                      <Button variant="outline" size="sm" onClick={handleOpenDataFolder} className="gap-1.5 text-xs">
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        <span>{t('打开本地数据目录 (%APPDATA%)', 'Open Data Directory')}</span>
                      </Button>
                    )}
                  </div>
                </section>

                <section className="pt-4 border-t border-border/40">
                  <h3 className="text-sm font-bold text-red-500 mb-1">{t('危险区重置', 'Danger Zone')}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t('仅清空您的收藏记录，不会影响自建分类与系统配置', 'Clear favorites only')}</p>
                  <Button variant="outline" size="sm" onClick={handleClearFavorites} className="text-red-500 border-red-500/30 hover:bg-red-500/10 text-xs">
                    {clearTip || t('清空个人收藏列表', 'Clear all favorites')}
                  </Button>
                </section>
              </div>
            )}

            {/* 5. 版本更新 */}
            {activeTab === 'update' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{t('版本与在线更新', 'Version & Update Check')}</h3>
                      <p className="text-xs text-muted-foreground">{t('当前安装版本：', 'Current version: ')} v{appVersion || '1.5.6'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCheckUpdate}
                      disabled={checkingUpdate}
                      className="gap-1.5 text-xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                      <span>{t('检查新版本', 'Check Updates')}</span>
                    </Button>
                  </div>

                  {/* 发现新版本时的升级面板 */}
                  {updateResult.status === 'available' && (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm">
                        <Sparkles className="h-4 w-4 flex-shrink-0" />
                        <span>{t(`发现新版本 v${updateResult.version}！`, `New version v${updateResult.version} available!`)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('检测到官方有新版本更新，是否现在前往查看并下载新版本？', 'Official update detected. Would you like to view and download the latest release?')}
                      </p>
                      {isDownloading ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold">
                            <span>{t(downloadProgress === 100 ? '下载完成，正在自动启动安装向导...' : '正在为您下载最新安装包...', downloadProgress === 100 ? 'Download complete, launching setup...' : 'Downloading update...')}</span>
                            <span>{downloadProgress !== null ? `${downloadProgress}%` : ''}</span>
                          </div>
                          <div className="w-full bg-amber-500/20 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${downloadProgress || 0}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <Button size="sm" onClick={handleConfirmUpdate} className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                            {isDesktop ? t('应用内一键下载升级', 'Download & Update') : t('前往 GitHub 查看', 'View on GitHub')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setUpdateResult({ status: 'idle' })} className="h-8 text-xs text-muted-foreground">
                            {t('暂不更新', 'Later')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {updateResult.status === 'latest' && (
                    <p className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 py-2.5 px-3 rounded-xl border border-green-500/20 flex items-center gap-2">
                      <span>✓</span>
                      <span>{t(`当前已是最新版本 (v${updateResult.version})`, `Already on the latest version (v${updateResult.version})`)}</span>
                    </p>
                  )}

                  {updateResult.status === 'error' && (
                    <p className="text-xs text-red-500 bg-red-500/10 py-2.5 px-3 rounded-xl border border-red-500/20 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{updateResult.message}</span>
                    </p>
                  )}
                </section>

                {/* 最近更新日志 */}
                <section className="pt-4 border-t border-border/40">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    <span>{t('版本迭代历史', 'Release Changelog')}</span>
                  </h3>

                  <div className="space-y-3.5">
                    {releaseNotes.slice(0, 3).map((note) => (
                      <div key={note.version} className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            <span>{note.version} {note.title ? `— ${locale === 'zh' ? note.title : note.titleEn}` : ''}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{note.date}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11.5px] leading-relaxed">
                          {(locale === 'zh' ? note.changes : note.changesEn).map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* 6. 关于我们 */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <section className="text-center py-4 space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-foreground">{t('AI万能工具箱', 'AI Toolbox')}</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {t('专为 AI 时代打造的高性能桌面生产力枢纽，汇聚全球顶尖 AI 工具、品牌驱动中心、格式转换工作台与多模型分屏对比台。', 'Curated AI productivity powerhouse with Model Arena, Drivers & Converters.')}
                  </p>
                </section>

                <section className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('开源协议', 'License')}</span>
                    <span className="font-semibold text-foreground">MIT License</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('开发作者', 'Author')}</span>
                    <a href="https://github.com/khssdsg-maker" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                      <span>khssdsg-maker</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('官方开源仓库', 'GitHub Repository')}</span>
                    <a href="https://github.com/khssdsg-maker/ai-toolbox" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                      <Github className="h-3.5 w-3.5" />
                      <span>khssdsg-maker/ai-toolbox</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>,
    document.body
  )
}
