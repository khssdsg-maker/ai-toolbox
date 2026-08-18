export interface PromptItem {
  id: string
  title: string
  titleEn: string
  category: 'novel' | 'code' | 'art' | 'office' | 'study'
  description: string
  descriptionEn: string
  tags: string[]
  prompt: string
  variables?: Array<{
    key: string
    label: string
    placeholder: string
    defaultValue?: string
  }>
}

export interface PromptPlatform {
  id: string
  name: string
  nameEn: string
  url: string
  description: string
  descriptionEn: string
  tag: string
  icon?: string
}

export interface PromptCategory {
  id: 'all' | 'novel' | 'code' | 'art' | 'office' | 'study' | 'fav'
  label: string
  labelEn: string
  icon: string
}

export const PROMPT_PLATFORMS: PromptPlatform[] = [
  {
    id: 'anthropic_prompts',
    name: 'Anthropic 官方提示词库',
    nameEn: 'Anthropic Prompt Library',
    url: 'https://docs.anthropic.com/en/prompt-library/library',
    description: 'Claude 官方出品的权威提示词宝典，覆盖代码架构、长文撰写、复杂推理与分析。',
    descriptionEn: 'Official Claude prompt engineering library for high-end reasoning and coding.',
    tag: 'Claude官方出品'
  },
  {
    id: 'liblib',
    name: 'LiblibAI (哩布哩布)',
    nameEn: 'LiblibAI',
    url: 'https://www.liblib.art/',
    description: '国内第一 AI 图像创作与模型/咒语分享社区，数百万绘画提示词与作品灵感直连秒开。',
    descriptionEn: 'Leading AI image creation community with millions of prompts and models.',
    tag: '国内最火生图咒语'
  },
  {
    id: 'openart',
    name: 'OpenArt PromptBook',
    nameEn: 'OpenArt Prompts',
    url: 'https://openart.ai/promptbook',
    description: '全球顶尖 AI 绘画咒语电子书与提示词搜索，详尽拆解风格、镜头、光影与构图。',
    descriptionEn: 'The definitive prompt book and search engine for AI art enthusiasts.',
    tag: '生图咒语宝典'
  },
  {
    id: 'flowgpt',
    name: 'FlowGPT',
    nameEn: 'FlowGPT',
    url: 'https://flowgpt.com/',
    description: '全球最大、最活跃的 AI 提示词与角色互动社区，汇集数十万款热门 Prompt。',
    descriptionEn: 'The largest global AI prompt community with thousands of top prompts.',
    tag: '全球最大社区'
  },
  {
    id: 'aishort',
    name: 'AI Short (ChatGPT 快捷指令)',
    nameEn: 'AI Short',
    url: 'https://www.aishort.top/',
    description: '国内超火的中文 AI 生产力指令导航站，数十个工作与学习分类即点即用。',
    descriptionEn: 'Curated Chinese AI productivity prompt commands and shortcuts.',
    tag: '中文快捷指令'
  },
  {
    id: 'prompts_chat',
    name: 'Awesome Prompts (prompts.chat)',
    nameEn: 'Awesome Prompts',
    url: 'https://prompts.chat/',
    description: 'GitHub 11万★ 开源提示词宝典官方 Web 版，汇聚百种专业角色预设。',
    descriptionEn: 'Official web version of the 110k+ stars GitHub prompt engineering repo.',
    tag: '11万★ 开源宝典'
  },
  {
    id: 'promptbase',
    name: 'PromptBase',
    nameEn: 'PromptBase',
    url: 'https://promptbase.com/',
    description: '全球最知名的专业高质量 Prompt 灵感集市与交易平台（涵盖 DALL·E/GPT-4/SD）。',
    descriptionEn: 'Leading marketplace & library for premium DALL-E, GPT and Midjourney prompts.',
    tag: '高质Prompt集市'
  },
  {
    id: 'clickprompt',
    name: 'ClickPrompt',
    nameEn: 'ClickPrompt',
    url: 'https://www.clickprompt.org/',
    description: '知名开源 Prompt 生成与优化平台，专为开发者与创作者打造的提示词工具箱。',
    descriptionEn: 'Open-source prompt generator and workbench for creators and engineers.',
    tag: '开源生成工具'
  },
  {
    id: 'aiprm',
    name: 'AIPRM',
    nameEn: 'AIPRM',
    url: 'https://www.aiprm.com/',
    description: '超 200 万用户使用的 ChatGPT 专业提示词库，专攻 SEO、营销与工程方案。',
    descriptionEn: 'Over 2M users prompt library for SEO, marketing and coding.',
    tag: '200万+ 用户常用'
  },
  {
    id: 'promptperfect',
    name: 'PromptPerfect',
    nameEn: 'PromptPerfect',
    url: 'https://promptperfect.jina.ai/',
    description: 'Jina AI 出品的专业级 Prompt 自动调优与重构工具，自动将简短指令升格为大片。',
    descriptionEn: 'Automated prompt optimizer and refiner powered by Jina AI.',
    tag: '提示词自动调优'
  },
  {
    id: 'snackprompt',
    name: 'SnackPrompt',
    nameEn: 'SnackPrompt',
    url: 'https://snackprompt.com/',
    description: 'Reddit 风格的每日高赞 AI 提示词社区，每日投票更新全网最火实用 Prompt。',
    descriptionEn: 'Community-driven daily upvoted trending AI prompts.',
    tag: '社区高赞榜'
  }
]

export const PROMPT_CATEGORIES: PromptCategory[] = [
  { id: 'all', label: '全部提示词', labelEn: 'All Prompts', icon: 'Sparkles' },
  { id: 'novel', label: '网文小说创作', labelEn: 'Novel & Fiction', icon: 'BookOpen' },
  { id: 'code', label: 'AI 编程开发', labelEn: 'Coding & Architecture', icon: 'Code' },
  { id: 'art', label: 'AI 绘画设计咒语', labelEn: 'AI Art & Design', icon: 'Palette' },
  { id: 'office', label: '职场办公写作', labelEn: 'Office & Copywriting', icon: 'Briefcase' },
  { id: 'study', label: '学术与深度思考', labelEn: 'Academic & Thinking', icon: 'GraduationCap' },
  { id: 'fav', label: '⭐ 我的收藏', labelEn: '⭐ Favorites', icon: 'Star' }
]

export const PROMPTS_DATA: PromptItem[] = [
  // ==================== 1. 网文小说与故事创作 ====================
  {
    id: 'novel_golden_3_chapters',
    title: '网文“黄金三章”开篇大纲推演',
    titleEn: 'Webnovel 3-Chapter Hook Outline Builder',
    category: 'novel',
    description: '遵循起点/番茄核心节奏，规划第1章危机与金手指、第2章立威与冲突、第3章期待感卡扣。',
    descriptionEn: 'Structured outline generator for first 3 chapters with hooks, golden finger and cliffhangers.',
    tags: ['网文大纲', '黄金三章', '节奏设计', '救猫咪'],
    variables: [
      { key: 'genre', label: '题材类型', placeholder: '如：玄幻修真 / 都市异能 / 赛博朋克', defaultValue: '都市异能' },
      { key: 'golden_finger', label: '金手指/外挂', placeholder: '如：每天刷新一个概念级词条 / 看到万物属性面板', defaultValue: '能看到所有人未来24小时的机缘气运' },
      { key: 'protagonist', label: '主角身份背景', placeholder: '如：落魄外卖员 / 被家族废除的少主', defaultValue: '刚被黑心公司开除的底层程序员' }
    ],
    prompt: `你是一位深谙网文爆款节奏的起点白金级小说主编兼架构师。
请根据我提供的设定，为一部【[genre]】题材小说设计极具吸睛力的“黄金三章”开篇大纲。

【核心设定】：
- 题材类型：[genre]
- 主角背景：[protagonist]
- 核心金手指：[golden_finger]

【大纲设计要求】：
1. **第 1 章：危局切入与金手指觉醒**
   - 开篇核心痛点/危机事件（避免冗长世界观说明，直接事件切入）
   - 主角面临的绝境与心理反差
   - 金手指觉醒契机与首次机制触发（明确爽点反馈）
2. **第 2 章：首次验证与反打脸/小爽点**
   - 借助金手指逆转眼前的小危机，获得第一笔关键收益/情报
   - 塑造一个鲜活的对立面小人物（制造情绪反弹）
   - 展现金手指的独特趣味性与成长潜力
3. **第 3 章：大地图展开与核心期待感卡扣（Cliffhanger）**
   - 牵扯出更大的主线线索/世界观冰山一角
   - 设立一个 48 小时内的紧迫倒计时危机或巨大机缘
   - 章尾必须留下强烈的“欲知后事如何”卡扣挂钩，让读者不得不追读。`
  },
  {
    id: 'novel_character_card',
    title: '立体小说角色人设卡（性格缺陷+核心动机）',
    titleEn: '3D Character Profile Card Builder',
    category: 'novel',
    description: '拒绝扁平脸谱化，生成包含核心动机、反差魅力、软肋弱点与说话口吻的丰满角色。',
    descriptionEn: 'Deep character generator with core desires, fatal flaws, contrasts and dialogue tone.',
    tags: ['人物设定', '性格反差', '角色塑造', '台词设计'],
    variables: [
      { key: 'char_name', label: '角色姓名与定位', placeholder: '如：林巡（主角）/ 叶青璇（病娇师姐）', defaultValue: '江彻（亦正亦邪的主角）' },
      { key: 'world_bg', label: '所在世界观', placeholder: '如：诡异复苏修仙界 / 废土赛博朋克', defaultValue: '神明复苏的现代高武都市' },
      { key: 'tagline', label: '核心人设一句话标签', placeholder: '如：表面懒散摸鱼，实则谋定后动的幕后执棋者', defaultValue: '表面是毒舌财迷的中介，实则暗夜中的弑神者' }
    ],
    prompt: `你是一位专业文学角色顾问与编剧导师。请为以下角色构建一份富有张力和深度的人设档案卡：

【基本输入】：
- 角色姓名与定位：[char_name]
- 所在世界观环境：[world_bg]
- 核心人设标签：[tagline]

【人设档案卡规格】：
1. **外在特质与辨识符号**：
   - 标志性容貌/着装细节（让读者能一眼脑补的记忆锚点）
   - 习惯性微动作/标志性口癖
2. **内在矛盾与反差魅力**：
   - 显性性格（在外人面前展现的面具）vs 隐性性格（独处或面对生死时的真实底色）
   - 核心欲望（他誓死追求的执念是什么）vs 致命软肋/阿喀琉斯之踵（能摧毁他的心理防线是什么）
3. **金手指/能力体系与之结合方式**：
   - 他的能力如何放大或制约他的性格？每次使用代价是什么？
4. **代表性台词对白（3句）**：
   - 日常轻松时的台词
   - 谈判施压时的台词
   - 绝境逆风反杀时的台词`
  },
  {
    id: 'novel_combat_sensory',
    title: '高张力战斗动作与五感环境描写',
    titleEn: 'High-Tension Combat & Sensory Scene Builder',
    category: 'novel',
    description: '告别回合制报菜名！融入听觉、视觉、风声、肌肉紧绷感与心理博弈的高燃打斗。',
    descriptionEn: 'Dynamic action choreography generator with sensory details and psychological beats.',
    tags: ['动作打斗', '环境氛围', '高燃对决', '五感沉浸'],
    variables: [
      { key: 'scene_location', label: '对决场地', placeholder: '如：暴雨倾盆的废弃高架桥 / 剑气纵横的绝峰祭坛', defaultValue: '雷雨交加的霓虹废弃钟楼顶层' },
      { key: 'fighters', label: '交战双方与能力', placeholder: '如：主角（雷系快刀）vs 妖魔宿主（重铠巨斧）', defaultValue: '主角（单手短刃+刹那加速）vs 机械重装改造暴徒（双管重力炮+合金骨骼）' },
      { key: 'turning_point', label: '战局逆转点', placeholder: '如：故意硬抗一记重击诱敌深入，借雷电反向过载对手', defaultValue: '借暴雨水幕传导高压电流，引爆钟楼发条机械完成绝杀' }
    ],
    prompt: `你是一位善于描写高能动作场面的畅销网文大师（文风兼具紧凑动感与视听画面张力）。
请为以下场景撰写一段 600-800 字的极具张力的动作对决高潮正文：

【场景设定】：
- 对决环境：[scene_location]
- 交手双方：[fighters]
- 核心逆转/绝杀逻辑：[turning_point]

【写作指导规范】：
1. **短句为主，节奏如鼓点**：战斗开始时用短促紧凑的句式营造压迫感。
2. **五感沉浸描写**：强化金属撕裂声、雨水蒸发白汽、骨骼撞击闷响与神经痛觉等感官细节，拒绝干瘪报招式名。
3. **博弈与微表情**：写出出招时的假动作试探、瞳孔收缩、呼吸节奏与电光石火的生死博弈。
4. **高潮终结一击**：将镜头感拉满，慢镜头特写绝杀瞬间，带来纯粹极致的宣泄感。`
  },

  // ==================== 2. AI 编程与架构重构 ====================
  {
    id: 'code_review_expert',
    title: '资深全栈架构师 Code Review 与隐患排查',
    titleEn: 'Principal Engineer Deep Code Review',
    category: 'code',
    description: '严格从安全性、并发死锁、内存泄露、边界异常与 Clean Code 5 个维度审查代码。',
    descriptionEn: 'Rigorous 5-dimension code inspection for security, concurrency, leaks and clean code.',
    tags: ['代码审查', '性能优化', '安全审计', 'CleanCode'],
    variables: [
      { key: 'language', label: '编程语言/框架', placeholder: '如：TypeScript / React 19 / Go / Rust', defaultValue: 'TypeScript / React' },
      { key: 'code_snippet', label: '待审查代码段', placeholder: '粘贴你的代码...', defaultValue: '// 粘贴您的核心代码逻辑' }
    ],
    prompt: `你是一位拥有 15 年大厂经验的 Principal Software Engineer 与全栈架构师。
请对以下【[language]】代码进行全面、严苛且具备高建设性的 Code Review。

待审查代码：
\`\`\`[language]
[code_snippet]
\`\`\`

请按以下 5 个维度输出结构化审查报告：
1. 🚨 **高危与边界缺陷（Bug & Edge Cases）**：
   - 空指针/未捕获异常/未处理的 Promise rejection
   - 边界值溢出、竞态条件 (Race condition) 或状态不同步
2. ⚡ **性能与资源泄漏（Performance & Memory）**：
   - 不必要的二次渲染、大内存对象未回收、O(n²) 及以上的低效计算
3. 🔒 **安全性（Security）**：
   - 注入漏洞、XSS、敏感数据暴露、输入未过滤
4. 📐 **架构设计与可维护性（Clean Code & Best Practices）**：
   - 是否符合 SOLID 原则？命名与抽象是否精准？函数职责是否单一？
5. 💡 **重构优化后的完整代码方案（Refactored Solution）**：
   - 给出重构后的完整代码，并用注释标明关键改进点。`
  },
  {
    id: 'code_debug_root_cause',
    title: '系统级复杂 Bug 根因剖析与诊断',
    titleEn: 'System-level Root Cause Bug Diagnosis',
    category: 'code',
    description: '根据报错堆栈、异常行为与上下文，推演 Bug 产生的根本诱因并提供彻底根治方案。',
    descriptionEn: 'Deep causal diagnosis for complex runtime crashes, async issues and logic flaws.',
    tags: ['Bug排查', '根因分析', '堆栈诊断', '故障排查'],
    variables: [
      { key: 'tech_stack', label: '技术栈与运行环境', placeholder: '如：Node.js 20 + Electron / Next.js SSR', defaultValue: 'Next.js 15 / Electron' },
      { key: 'error_log', label: '报错堆栈或异常现象', placeholder: '粘贴报错日志...', defaultValue: 'TypeError / EPERM / 页面白屏报错' }
    ],
    prompt: `你是一位擅长处理复杂系统级故障与疑难杂症的 Debug 专家。
我的项目运行在【[tech_stack]】环境下，遇到了以下严重异常：

【错误日志 / 异常现象】：
\`\`\`
[error_log]
\`\`\`

请按以下逻辑分层剖析：
1. **根本原因判定（Root Cause）**：直截了当指出问题的本质机理（如生命周期错序、异步时序竞态、权限被锁、类型收窄失败等）。
2. **触发链路推演**：从入口到崩溃点的数据流/执行流链路。
3. **修复方案对比**：
   - 临时止血方案（Quick Fix）
   - 架构级根治方案（Best Practice Solution）
4. **防复发保障**：如何通过单测或类型系统在编译期杜绝此类问题再次发生。`
  },
  {
    id: 'code_unit_test_generator',
    title: '生产级全覆盖单元测试生成器',
    titleEn: 'Production-Grade Unit Tests with Edge Cases',
    category: 'code',
    description: '采用 Arrange-Act-Assert 模式，自动覆盖正常路径、异常分支、极值与 Mock 依赖。',
    descriptionEn: 'Automated test suite generator with AAA pattern, boundary cases and mocks.',
    tags: ['单元测试', 'Jest', 'Vitest', '边界覆盖'],
    variables: [
      { key: 'test_framework', label: '测试框架', placeholder: '如：Vitest / Jest / pytest / Go test', defaultValue: 'Vitest + Testing Library' },
      { key: 'target_code', label: '待测函数或模块', placeholder: '粘贴待测函数代码...', defaultValue: '// 待测试函数代码' }
    ],
    prompt: `你是一位严谨的软件质量工程专家与 TDD 大师。
请为以下代码编写高覆盖率、工业级的【[test_framework]】单元测试套件。

【待测试目标代码】：
\`\`\`
[target_code]
\`\`\`

【编写规范要求】：
1. **结构清晰**：每个测试用例均严格遵循 \`Arrange -> Act -> Assert (准备-执行-断言)\` 三段式结构。
2. **全场景覆盖**：
   - 🟢 Happy Path（标准正常业务流）
   - 🟡 边界极值（空值 null/undefined、空数组、超大数、特殊字符）
   - 🔴 异常与错误流（抛出指定 Error、网络失败超时、权限拒绝）
3. **依赖隔离**：合理 Mock 外部网络 I/O、时间定时器与系统环境。
4. **用例可读性**：测试用例描述 (\`it('should ...')\`) 必须语义明确，能作为活文档使用。`
  },

  // ==================== 3. AI 绘画与设计咒语 ====================
  {
    id: 'art_cinematic_portrait',
    title: 'Midjourney 电影级光影大师人像咒语',
    titleEn: 'Midjourney Cinematic Portrait Mastery',
    category: 'art',
    description: '结合伦勃朗光、哈苏中画幅质感、85mm 浅景深与细腻毛孔细节的顶级摄影 Prompt。',
    descriptionEn: 'Photorealistic portrait prompt with Rembrandt lighting, Hasselblad look and 85mm bokeh.',
    tags: ['Midjourney', '人像摄影', '电影光影', '质感大片'],
    variables: [
      { key: 'subject', label: '画面主体人物', placeholder: '如：戴金丝眼镜的冷峻东方女学者 / 银发赛博黑客少年', defaultValue: '身着复古风衣、眼神坚毅的东亚女侦探' },
      { key: 'lighting', label: '光影与氛围', placeholder: '如：雨夜霓虹逆光 / 伦勃朗侧光与暖金丁达尔', defaultValue: '阴雨天窗边漫射光，微弱的冷蓝色侧光轮廓' },
      { key: 'aspect_ratio', label: '画幅比例', placeholder: '如：--ar 16:9 / --ar 3:4 / --ar 9:16', defaultValue: '--ar 3:4' }
    ],
    prompt: `请将以下摄影构想翻译并扩写为高质量的 Midjourney v6 / SDXL 专业英文提示词（Prompt）：

【输入构想】：
- 主体人物：[subject]
- 光影与氛围：[lighting]
- 画幅参数：[aspect_ratio]

【扩写公式】：
[Subject Description], Shot on Hasselblad H6D-100c, 85mm f/1.4 lens, Rembrandt lighting, delicate skin texture, visible pores, atmospheric mood, cinematic color grading, photorealistic, 8k resolution, ultra-detailed, depth of field [aspect_ratio] --v 6.0 --style raw

请输出：
1. 完整的 **英文 Midjourney Prompt**（可直接一键复制到 Discord/Web）。
2. 对应的 **负向提示词 (Negative Prompt)**（用于 SD/Flux）。
3. 关键摄影词汇解析（镜头、灯光与色调说明）。`
  },
  {
    id: 'art_3d_glassmorphism_icon',
    title: '3D 拟物毛玻璃与粘土风格应用图标咒语',
    titleEn: '3D Glassmorphism & Clay App Icon Prompt',
    category: 'art',
    description: '适用于现代应用 Logo、UI 资产的 3D C4D/Blender 渲染风提示词。',
    descriptionEn: '3D clay & translucent frosted glass icon prompt for modern UI design.',
    tags: ['UI图标', '毛玻璃', '3D渲染', 'Blender质感'],
    variables: [
      { key: 'icon_theme', label: '图标主体元素', placeholder: '如：带有齿轮与火箭的立体万能工具箱 / 发光的 AI 脑图大脑', defaultValue: '浮空发光的立体全能魔方工具箱，带有半透明亚克力与流金微光' },
      { key: 'color_palette', label: '配色方案', placeholder: '如：薄荷绿与曜石黑 / 渐变暖橙与深空灰', defaultValue: '渐变琥珀橙、薄荷绿与柔和奶白' }
    ],
    prompt: `请为以下 UI 图标概念生成用于 Midjourney / DALL-E 3 的专业 3D 渲染提示词：

【设计元素】：
- 图标主题：[icon_theme]
- 配色方案：[color_palette]

【输出英文 Prompt】：
A modern 3D app icon representing [icon_theme], frosted glassmorphism texture, smooth matte clay material, translucent acrylic elements, [color_palette], soft studio lighting, ambient occlusion, rendered in Blender and Cinema 4D, clean gradient minimalist background, rounded squircle base, vibrant raytracing details, ultra-clean UI design, 8k --ar 1:1 --v 6.0

请输出：
1. **直接可用的 Midjourney 英文咒语**。
2. **DALL-E 3 / GPT-4o 图像生成中文增强描述**。`
  },

  // ==================== 4. 职场办公与高效写作 ====================
  {
    id: 'office_star_weekly_report',
    title: 'STAR 原则高情商结构化工作周报/述职',
    titleEn: 'STAR Method High-Impact Weekly Report',
    category: 'office',
    description: '将琐碎日常工作转换为“情境-任务-行动-量化成果-下周规划”的亮眼汇报。',
    descriptionEn: 'Transform daily tasks into quantified STAR achievements and strategic weekly summaries.',
    tags: ['工作周报', 'STAR法则', '量化成果', '职场汇报'],
    variables: [
      { key: 'raw_tasks', label: '本周琐碎工作记录', placeholder: '列出本周做了啥（可以口语化随便写）...', defaultValue: '1. 修复了客户端图标加载慢的问题，加了本地缓存；2. 新增了小说创作分类并收录了12个工具；3. 重构了发布脚本支持自动部署。' },
      { key: 'role_title', label: '你的岗位角色', placeholder: '如：前端研发工程师 / 产品经理 / 运营主管', defaultValue: '高级全栈工程师 / 独立开发者' }
    ],
    prompt: `你是一位深谙大厂职场沟通艺术与管理视角的资深总监。
请根据我提供的本周口语化工作备忘录，为我润色并重构一份兼具【技术深度、业务价值与清晰量化成果】的高情商周报。

【我的岗位】：[role_title]
【本周原始工作流水】：
[raw_tasks]

【重构输出规格】：
1. 🌟 **本周核心价值产出（STAR 结构化亮点）**：
   - 将每项工作提炼为：【背景难题】->【破局策略/技术方案】->【实际业务/性能收益（带预估量化指标）】
2. 📊 **进度与质量数据看板**（已上线/测试中/灰度百分比）。
3. 💡 **技术沉淀与流程赋能**（复盘经验、封装组件或自动化提效）。
4. 🚀 **下周重点攻坚规划（OKR 锚定）**。`
  },
  {
    id: 'office_viral_copywriter',
    title: '爆款社交媒体文案架构师（小红书/公众号）',
    titleEn: 'Viral Social Media Copywriting Master',
    category: 'office',
    description: '黄金前3秒抓人标题、痛点共情、干货价值与引导互动四步爆款模型。',
    descriptionEn: 'Viral social media copy generator with hook headlines, emotional empathy and value delivery.',
    tags: ['爆款文案', '小红书', '公众号', '痛点转化'],
    variables: [
      { key: 'product_topic', label: '分享主题/产品功能', placeholder: '如：一款免费无广告的 Windows AI 万能工具箱', defaultValue: '一款聚合了100+主流大模型与离线格式转换的超级桌面工具箱' },
      { key: 'target_audience', label: '目标受众', placeholder: '如：学生党 / 程序员 / 网文作者 / 办公白领', defaultValue: '经常用 AI 工具提效的打工人与学生党' }
    ],
    prompt: `你是一位拥有千万级爆款操盘经验的社交媒体内容主理人。
请针对以下主题，为我撰写 2 套不同风格的爆款文案（【小红书种草风】+【知乎/公众号干货深度风】）：

【推广主题】：[product_topic]
【目标读者】：[target_audience]

【输出要求】：
1. **小红书版本**：
   - 5 个极具点击欲望的爆款标题（善用情绪词、痛点数字、反常识对比）
   - 正文：痛点引入（太扎心了）-> 惊喜发现 -> 核心神器亮点（Emoji分点排版）-> 互动钩子
   - 热门爆款标签 Tags
2. **知乎/公众号干货版本**：
   - 深度价值切入，排版干净高级，突出实用主义与工具解决的本质痛点。`
  },

  // ==================== 5. 学术研究与深度思考 ====================
  {
    id: 'study_feynman_technique',
    title: '费曼学习法：将晦涩技术概念转化为白话人话',
    titleEn: 'Feynman Technique: Explain Complex Concepts Simply',
    category: 'study',
    description: '用生动日常比喻、降维解释与核心本质，把任何高深术语讲给中学生也能听懂。',
    descriptionEn: 'Explain complicated scientific or technical concepts with vivid everyday analogies.',
    tags: ['费曼学习法', '通俗讲解', '概念拆解', '比喻教学'],
    variables: [
      { key: 'concept', label: '待拆解的复杂概念', placeholder: '如：Transformer 自注意力机制 / 区块链共识算法 / 量子纠缠', defaultValue: '大语言模型的“注意力机制 (Attention Mechanism)”与“上下文窗口”' }
    ],
    prompt: `你是一位兼具顶级学术造诣与极强科普表达能力的现代费曼导师。
请运用“费曼学习法 (Feynman Technique)”，为我把【[concept]】这个复杂概念解释得透彻生动。

【拆解框架】：
1. 💡 **一句话本质定性**：用不超过 30 个字，直击该技术/概念解决的核心矛盾。
2. 🍎 **绝妙的日常生活大白话类比**：用一个中学生都能理解的日常事物（如餐厅点餐、图书管理员找书、交通十字路口等）进行完全映射。
3. ⚙️ **核心运转机理 3 步走**：剥离所有生硬学术黑话，用通俗逻辑拆解其第一性原理。
4. ⚠️ **常见认知误区纠偏**：大家最容易想错/误解的一个关键点是什么？`
  },
  {
    id: 'study_paper_polisher',
    title: '顶会/SCI 论文级学术英文润色与逻辑重构',
    titleEn: 'Top-tier Conference / SCI Academic Paper Polisher',
    category: 'study',
    description: '剔除中式英文 (Chinglish)，增强学术严谨度、因果递进与学术词汇丰富度。',
    descriptionEn: 'Professional academic English polishing for Nature/IEEE/ACM style papers.',
    tags: ['学术润色', 'SCI论文', '顶会论文', '英文学术'],
    variables: [
      { key: 'raw_abstract', label: '待润色的中文或草稿英文', placeholder: '粘贴待润色的学术段落...', defaultValue: 'We proposed a new method to solve the memory problem in AI models. Experiments show our method is faster than baseline.' }
    ],
    prompt: `你是一位顶级学术期刊（Nature/IEEE/ACM/ICLR）的资深审稿人兼学术英语母语编辑。
请对以下学术段落进行专业级润色与逻辑重塑：

【待润色原文】：
\`\`\`
[raw_abstract]
\`\`\`

【润色原则】：
1. **地道学术表达**：消除中式英语搭配，使用精确且符合顶会规范的学术动词（如 \`mitigate\`, \`alleviate\`, \`demonstrate\`, \`outperform\`）。
2. **严密因果逻辑**：增强句子之间的过渡衔接（Coherence & Cohesion），强化论证的说服力。
3. **输出要求**：
   - 🌟 **润色后终稿 (Polished Version)**（可直接用于论文正文）
   - 🔍 **关键改动点对比与解析 (Key Improvements)**（指出原句表达薄弱点及为何修改）
   - 🎯 **备选句式（2 种不同语调：偏保守严谨 vs 偏突破性创新）**`
  }
]
