const fs = require('fs')
const path = require('path')

const navPath = path.join(__dirname, '../src/navsphere/content/navigation.json')
const navData = JSON.parse(fs.readFileSync(navPath, 'utf8'))

// Check if category 11 already exists
const existingIdx = navData.navigationItems.findIndex(i => i.id === '11')
if (existingIdx !== -1) {
  navData.navigationItems.splice(existingIdx, 1)
}

const novelCategory = {
  "id": "11",
  "title": "AI写作与小说生成",
  "icon": "BookOpen",
  "description": "收录 GitHub 高 Star 热门开源 AI 小说生成器、角色扮演引擎与主流大厂文本创作平台",
  "items": [
    {
      "id": "11_1",
      "title": "SillyTavern",
      "titleEn": "SillyTavern",
      "href": "https://github.com/SillyTavern/SillyTavern",
      "description": "GitHub 3.1万Star！全网最火爆的开源 LLM 角色扮演与故事/小说交互写作前端",
      "descriptionEn": "Top-starred 30.9k★ open-source LLM roleplay & interactive story writing UI",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_2",
      "title": "AI Dungeon",
      "titleEn": "AI Dungeon",
      "href": "https://github.com/latitudegames/AIDungeon",
      "description": "GitHub 3200+Star，经典开源无限分支 AI 故事与小说探索创作引擎",
      "descriptionEn": "3.2k★ open-source infinite branch AI story exploration engine",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_3",
      "title": "RecurrentGPT",
      "titleEn": "RecurrentGPT",
      "href": "https://github.com/aiwaves-cn/RecurrentGPT",
      "description": "GitHub 1000+Star，基于长文本记忆循环机制的互动式 AI 小说生成器",
      "descriptionEn": "1k★ interactive long-text & novel generator with recurrent memory",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_4",
      "title": "inkos",
      "titleEn": "inkos",
      "href": "https://github.com/Narcooo/inkos",
      "description": "开源多语言 AI 小说创作 Agent，支持章节规划、世界观状态与对话交互改写",
      "descriptionEn": "Open-source AI novel writing Agent with chapter planning and world status",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_5",
      "title": "StoryMoss (草苔)",
      "titleEn": "StoryMoss",
      "href": "https://github.com/91zgaoge/StoryMoss",
      "description": "Tauri+Rust 驱动的专业网文 AI 写作桌面环境，集成知识图谱与伏笔追踪",
      "descriptionEn": "AI-powered novel IDE with knowledge graphs and plot foreshadowing",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_6",
      "title": "Vela",
      "titleEn": "Vela",
      "href": "https://github.com/heider-x/vela",
      "description": "专为网文作者设计的本地优先 AI 创作 IDE，集成大纲规划与 RAG 局部润色",
      "descriptionEn": "Local-first AI writing IDE for fiction authors with RAG & outline tools",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_7",
      "title": "Sudowrite",
      "titleEn": "Sudowrite",
      "href": "https://www.sudowrite.com/",
      "description": "全球知名的专业 AI 小说创作平台，支持章节扩展、情节推演与场景描述",
      "descriptionEn": "Premier AI novel writing platform for authors with scene expansion",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_8",
      "title": "NovelAI",
      "titleEn": "NovelAI",
      "href": "https://novelai.net/",
      "description": "全球大火的 AI 小说故事生成与叙事助手，具备出色的文学语境模仿能力",
      "descriptionEn": "Leading AI storytelling and fiction generation assistant",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_9",
      "title": "秘塔写作猫",
      "titleEn": "Metaso Cat Writer",
      "href": "https://xiezuocat.com/",
      "description": "秘塔科技 AI 长文本写作平台，支持小说大纲生成、文本改写与文章润色",
      "descriptionEn": "AI long-form text & novel writing platform by Metaso",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_10",
      "title": "讯飞奇妙文",
      "titleEn": "iFlytek Qimiaowen",
      "href": "https://qimiaowen.xinghuo.xfyun.cn/",
      "description": "科大讯飞 AI 长文写作助手，支持小说大纲、故事创作与智能续写",
      "descriptionEn": "AI long-form writing assistant by iFlytek",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_11",
      "title": "彩云小文",
      "titleEn": "Caiyun Xiaowen",
      "href": "https://if.caiyunai.com/",
      "description": "彩云科技 AI 小说续写与平行世界剧情推演工具",
      "descriptionEn": "AI story continuation & parallel world plot engine",
      "icon": "",
      "enabled": true
    },
    {
      "id": "11_12",
      "title": "Kimi 长文本写作",
      "titleEn": "Kimi Writer",
      "href": "https://kimi.moonshot.cn/",
      "description": "月之暗面 Kimi 大模型小说创作辅助，擅长超长设定记忆与大纲推演",
      "descriptionEn": "Ultra-long context AI novel outline and story generation assistant",
      "icon": "",
      "enabled": true
    }
  ]
}

// Insert after Category '10' (AI编程Agent)
const idx = navData.navigationItems.findIndex(i => i.id === '10')
if (idx !== -1) {
  navData.navigationItems.splice(idx + 1, 0, novelCategory)
} else {
  navData.navigationItems.push(novelCategory)
}

fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf8')
console.log('✅ Added category 11: AI写作与小说生成 into navigation.json!')
