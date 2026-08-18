export interface ArenaModel {
  id: string
  name: string
  nameEn: string
  url: string
  icon?: string
  tag: string
  isCustom?: boolean
}

export const PRESET_MODELS: ArenaModel[] = [
  // ================= 🇨🇳 国内直连大模型 =================
  {
    id: 'deepseek',
    name: 'DeepSeek (深度求索)',
    nameEn: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    tag: '国内顶流 · 深度思考 R1',
    icon: 'https://chat.deepseek.com/favicon.ico'
  },
  {
    id: 'kimi',
    name: 'Kimi (月之暗面)',
    nameEn: 'Kimi',
    url: 'https://kimi.moonshot.cn/',
    tag: '超长上下文 · 资料解析',
    icon: 'https://kimi.moonshot.cn/favicon.ico'
  },
  {
    id: 'qwen',
    name: '通义千问 (阿里 Qwen)',
    nameEn: 'Qwen',
    url: 'https://tongyi.aliyun.com/qianwen/',
    tag: '全能通用 · 阿里最强',
    icon: 'https://tongyi.aliyun.com/favicon.ico'
  },
  {
    id: 'doubao',
    name: '豆包 (字节跳动)',
    nameEn: 'Doubao',
    url: 'https://www.doubao.com/chat/',
    tag: '极速响应 · 字节出品',
    icon: 'https://www.doubao.com/favicon.ico'
  },
  {
    id: 'chatglm',
    name: '智谱清言 (GLM-4)',
    nameEn: 'ChatGLM',
    url: 'https://chatglm.cn/',
    tag: '清华基底 · 深度推理',
    icon: 'https://chatglm.cn/favicon.ico'
  },
  {
    id: 'metaso',
    name: '秘塔 AI 搜索',
    nameEn: 'MetaSo',
    url: 'https://metaso.cn/',
    tag: '无广告 · 结构化搜索',
    icon: 'https://metaso.cn/favicon.ico'
  },
  {
    id: 'wanxiang',
    name: '通义万相 (阿里生图/视频)',
    nameEn: 'Wanxiang',
    url: 'https://wanxiang.aliyun.com/',
    tag: '阿里官方 · AI绘画与视频',
    icon: '/icons/wanxiang.svg'
  },

  // ================= 🌐 国际顶流大模型 =================
  {
    id: 'chatgpt',
    name: 'ChatGPT (GPT-4o)',
    nameEn: 'ChatGPT',
    url: 'https://chatgpt.com/',
    tag: '全球通用标杆 · OpenAI',
    icon: 'https://chatgpt.com/favicon.ico'
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    nameEn: 'Claude',
    url: 'https://claude.ai/',
    tag: '编程最强 · 深度长文',
    icon: 'https://claude.ai/favicon.ico'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    nameEn: 'Gemini',
    url: 'https://gemini.google.com/',
    tag: '谷歌多模态 · 超大窗口',
    icon: 'https://gemini.google.com/favicon.ico'
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    nameEn: 'Perplexity',
    url: 'https://www.perplexity.ai/',
    tag: '顶尖 AI 实时联网研报',
    icon: 'https://www.perplexity.ai/favicon.ico'
  }
]

const STORAGE_KEY = 'ai_toolbox_custom_arena_models'

export function getCustomModels(): ArenaModel[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveCustomModel(model: Omit<ArenaModel, 'id' | 'isCustom'>): ArenaModel {
  const customList = getCustomModels()
  const newModel: ArenaModel = {
    ...model,
    id: 'custom-' + Date.now(),
    isCustom: true
  }
  const updated = [newModel, ...customList]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
  return newModel
}

export function removeCustomModel(id: string): void {
  const customList = getCustomModels()
  const updated = customList.filter((m) => m.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}
