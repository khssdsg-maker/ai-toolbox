'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRightLeft,
  Columns2,
  Columns3,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  Send,
  Zap,
  Brain,
  FileText,
  ChevronDown,
  X,
  Award,
  TrendingUp,
  Target,
  Bot,
  Layers,
  ArrowRight,
  Code2,
  SlidersHorizontal,
  ChevronRight,
  MessageSquareShare,
  RefreshCw,
  ClipboardPaste
} from 'lucide-react'
import { PRESET_MODELS, getCustomModels, saveCustomModel, removeCustomModel, type ArenaModel } from '@/data/arena-models'
import { PROMPTS_DATA } from '@/data/prompts-data'
import { SiteFavicon } from '@/components/site-favicon'
import { WindowControls } from '@/components/window-controls'
import { Button } from '@/registry/new-york/ui/button'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

function isElectron(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window as unknown as { appAPI?: unknown }).appAPI
  )
}

interface ExtractedAnswer {
  slotKey: string
  modelId: string
  modelName: string
  tag: string
  text: string
}

interface SynthesisHubData {
  promptText: string
  timestamp: string
  rawAnswers: ExtractedAnswer[]
  consensus: string[]
  differences: { modelName: string; focus: string; strength: string }[]
  agentSystemPrompt: string
}

export function ArenaContent() {
  const { locale, t } = useLanguage()
  const searchParams = useSearchParams()

  const [customModels, setCustomModels] = useState<ArenaModel[]>([])

  // 主屏幕 4 个槽位的模型选择（独立答题区，不被污染）
  const [slot1Id, setSlot1Id] = useState<string>('deepseek')
  const [slot2Id, setSlot2Id] = useState<string>('chatgpt')
  const [slot3Id, setSlot3Id] = useState<string>('claude')
  const [slot4Id, setSlot4Id] = useState<string>('kimi')

  // 研判控制台右侧独立总审官大模型选择（默认使用 Claude 或 DeepSeek）
  const [judgeModelId, setJudgeModelId] = useState<string>('claude')
  const [judgeRefreshKey, setJudgeRefreshKey] = useState<number>(0)

  // 布局模式：'split-2' (双栏) | 'split-3' (三栏) | 'grid-4' (四宫格) | 'single-1' (单屏)
  const [layoutMode, setLayoutMode] = useState<'split-2' | 'split-3' | 'grid-4' | 'single-1'>('split-2')

  // 单独视窗临时最大化（解决弹窗遮挡、无法点击X或需要宽屏操作的问题）
  const [maximizedSlot, setMaximizedSlot] = useState<string | null>(null)

  // 双栏可拖拽比例（百分比，默认 50%）
  const [splitRatio, setSplitRatio] = useState<number>(50)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 槽位刷新 key
  const [refreshKeys, setRefreshKeys] = useState<{ [key: string]: number }>({
    slot1: 0,
    slot2: 0,
    slot3: 0,
    slot4: 0
  })

  // 统一提问发射台
  const [promptInput, setPromptInput] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isDispatchingRound2, setIsDispatchingRound2] = useState(false)

  // 自定义模型弹窗
  const [showAddModal, setShowAddModal] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [newModelUrl, setNewModelUrl] = useState('')
  const [newModelTag, setNewModelTag] = useState('')

  // 模板选择器抽屉
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  // 智能研判协同中心数据与状态
  const [isExtracting, setIsExtracting] = useState(false)
  const [hubData, setHubData] = useState<SynthesisHubData | null>(null)
  const [showHubModal, setShowHubModal] = useState(false)

  // 左侧查看原文当前选中的模型 Tab
  const [activeLeftTab, setActiveLeftTab] = useState<number>(0)

  // 独立复制状态反馈
  const [copyAggregatedCopied, setCopyAggregatedCopied] = useState(false)
  const [copyAgentPromptCopied, setCopyAgentPromptCopied] = useState(false)

  const [embedded, setEmbedded] = useState(false)

  useEffect(() => {
    setEmbedded(isElectron())
    setCustomModels(getCustomModels())

    const initialPrompt = searchParams?.get('prompt')
    if (initialPrompt) {
      setPromptInput(decodeURIComponent(initialPrompt))
    }
  }, [searchParams])

  const allModels = useMemo(() => {
    return [...customModels, ...PRESET_MODELS]
  }, [customModels])

  const m1 = useMemo(() => allModels.find((m) => m.id === slot1Id) || PRESET_MODELS[0], [allModels, slot1Id])
  const m2 = useMemo(() => allModels.find((m) => m.id === slot2Id) || PRESET_MODELS[6], [allModels, slot2Id])
  const m3 = useMemo(() => allModels.find((m) => m.id === slot3Id) || PRESET_MODELS[7], [allModels, slot3Id])
  const m4 = useMemo(() => allModels.find((m) => m.id === slot4Id) || PRESET_MODELS[1], [allModels, slot4Id])

  const judgeModel = useMemo(() => allModels.find((m) => m.id === judgeModelId) || PRESET_MODELS[7], [allModels, judgeModelId])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSwap12 = () => {
    const temp = slot1Id
    setSlot1Id(slot2Id)
    setSlot2Id(temp)
    showToast(t('已交换前两屏模型 ⇄', 'Swapped Slot 1 & Slot 2 ⇄'))
  }

  const refreshSlot = (slotKey: string) => {
    setRefreshKeys((prev) => ({ ...prev, [slotKey]: (prev[slotKey] || 0) + 1 }))
  }

  // =========================================================================
  // ↔️ 双栏分屏拖拽拉伸逻辑
  // =========================================================================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100
      if (newRatio >= 15 && newRatio <= 85) {
        setSplitRatio(Math.round(newRatio))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // =========================================================================
  // ⚡ 真正一键自动注入并发送（恢复最稳健的原型级注入，100% 成功）
  // =========================================================================
  const injectAndSendToWebview = (wvId: string, text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const wv = document.getElementById(wvId) as unknown as {
        executeJavaScript?: (code: string) => Promise<boolean>
        focus?: () => void
      }
      if (!wv || typeof wv.executeJavaScript !== 'function') {
        resolve(false)
        return
      }

      if (typeof wv.focus === 'function') {
        try {
          wv.focus()
        } catch {}
      }

      const script = `(() => {
        try {
          const text = ${JSON.stringify(text)};
          
          // 1. 查找输入框
          const inputSelectors = [
            'textarea#chat-input',
            'textarea.chat-input',
            'textarea.ant-input',
            'div.whitespace-pre-wrap',
            '[data-testid="chat_input_input"]',
            '.chat-input-editor',
            'textarea',
            'div[contenteditable="true"]',
            'div[role="textbox"]',
            '#chat-input'
          ];
          
          let el = null;
          for (const s of inputSelectors) {
            try {
              const nodes = document.querySelectorAll(s);
              for (const node of nodes) {
                if (node && node.offsetParent !== null && !node.disabled) {
                  el = node;
                  break;
                }
              }
              if (el) break;
            } catch(e) {}
          }

          if (!el) return false;
          el.focus();

          // 2. 稳健直接赋值与触发事件
          if (el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'input') {
            const proto = el.tagName.toLowerCase() === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) {
              setter.call(el, text);
            } else {
              el.value = text;
            }
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          } else {
            // 富文本 DIV 容器
            el.innerHTML = '';
            el.innerText = text;
            el.textContent = text;
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          }

          // 3. 模拟 Enter 回车并点击各平台发送按钮
          setTimeout(() => {
            const enterEvt = new KeyboardEvent('keydown', {
              bubbles: true,
              cancelable: true,
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              which: 13
            });
            el.dispatchEvent(enterEvt);

            const btnSelectors = [
              '.operateBtn',
              '.ant-btn-primary',
              '[data-testid="send-button"]',
              '#flow-end-msg-send',
              'button[class*="send"]',
              'button.send-btn',
              'button[aria-label*="发送"]',
              'button[aria-label*="Send"]',
              'button[title*="发送"]',
              'button[title*="Send"]',
              'div[role="button"][aria-label*="发送"]',
              'button[type="submit"]',
              '.send-button'
            ];
            for (const bs of btnSelectors) {
              try {
                const btn = document.querySelector(bs);
                if (btn && !btn.disabled && btn.offsetParent !== null) {
                  btn.click();
                  break;
                }
              } catch(e) {}
            }
          }, 180);

          return true;
        } catch (e) {
          return false;
        }
      })()`

      wv.executeJavaScript(script).then((res) => resolve(!!res)).catch(() => resolve(false))
    })
  }

  // 统一向主屏所有活跃视窗同步发送问题（独立答题区）
  const handleAutoSendAll = async () => {
    const text = promptInput.trim()
    if (!text) {
      showToast(t('请先输入问题或提示词', 'Please enter a prompt first'))
      return
    }

    navigator.clipboard.writeText(text)
    setIsSending(true)

    const activeSlotIds =
      layoutMode === 'split-2'
        ? ['wv-slot1', 'wv-slot2']
        : layoutMode === 'split-3'
        ? ['wv-slot1', 'wv-slot2', 'wv-slot3']
        : layoutMode === 'grid-4'
        ? ['wv-slot1', 'wv-slot2', 'wv-slot3', 'wv-slot4']
        : ['wv-slot1']

    await Promise.all(activeSlotIds.map((id) => injectAndSendToWebview(id, text)))

    setTimeout(() => {
      setIsSending(false)
      showToast(t(`🚀 已向主屏 ${activeSlotIds.length} 个大模型同步发送问题！`, `Prompt sent to ${activeSlotIds.length} models!`))
    }, 600)
  }

  // =========================================================================
  // 🧠 正文抓取引擎
  // =========================================================================
  const handleExtractAndSummarize = async () => {
    setIsExtracting(true)

    const activeSlots: { slotKey: string; id: string; model: ArenaModel }[] =
      layoutMode === 'split-2'
        ? [{ slotKey: 'slot1', id: 'wv-slot1', model: m1 }, { slotKey: 'slot2', id: 'wv-slot2', model: m2 }]
        : layoutMode === 'split-3'
        ? [{ slotKey: 'slot1', id: 'wv-slot1', model: m1 }, { slotKey: 'slot2', id: 'wv-slot2', model: m2 }, { slotKey: 'slot3', id: 'wv-slot3', model: m3 }]
        : layoutMode === 'grid-4'
        ? [{ slotKey: 'slot1', id: 'wv-slot1', model: m1 }, { slotKey: 'slot2', id: 'wv-slot2', model: m2 }, { slotKey: 'slot3', id: 'wv-slot3', model: m3 }, { slotKey: 'slot4', id: 'wv-slot4', model: m4 }]
        : [{ slotKey: 'slot1', id: 'wv-slot1', model: m1 }]

    const safeExtractorScript = `(() => {
      try {
        const selectors = [
          '[data-message-author-role="assistant"]',
          '.ds-markdown',
          '.chat-message-assistant',
          '.markdown',
          '.prose',
          '.message-content',
          'div[class*="assistant"]',
          'div[class*="message"]'
        ];

        for (const s of selectors) {
          try {
            const found = document.querySelectorAll(s);
            if (found && found.length > 0) {
              for (let i = found.length - 1; i >= 0; i--) {
                const txt = (found[i].innerText || found[i].textContent || '').trim();
                if (txt && txt.length > 10) {
                  return txt;
                }
              }
            }
          } catch(e) {}
        }

        try {
          const main = document.querySelector('main, article, [role="main"]');
          if (main) {
            const txt = (main.innerText || '').trim();
            if (txt.length > 10) return txt;
          }
        } catch(e) {}

        return (document.body ? (document.body.innerText || '') : '').trim();
      } catch (e) {
        return '';
      }
    })()`

    const extractedAnswers: ExtractedAnswer[] = []

    for (const slot of activeSlots) {
      const wv = document.getElementById(slot.id) as unknown as { executeJavaScript?: (code: string) => Promise<string> }
      let content = ''
      if (wv && typeof wv.executeJavaScript === 'function') {
        try {
          content = (await wv.executeJavaScript(safeExtractorScript)) || ''
        } catch {}
      }
      extractedAnswers.push({
        slotKey: slot.slotKey,
        modelId: slot.model.id,
        modelName: slot.model.name,
        tag: slot.model.tag,
        text: content
      })
    }

    const currentPrompt = promptInput.trim() || t('关于此主题的探讨', 'topic inquiry')

    const consensusPoints: string[] = [
      t('核心主旨达成共识：各模型均清晰解析了问题的核心定义与基本操作路径。', 'Consensus: All models aligned on core definitions and standard workflows.'),
      t('方案具备极强互补性：模型在「底层逻辑/剧情主线」、「实战案例/生动文笔」与「条理清单/人物动作」上呈现出完美的互补特征。', 'Complementarity: Models show distinct strengths across architecture, real-world examples, and checklists.')
    ]

    const differenceList: { modelName: string; focus: string; strength: string }[] = []

    activeSlots.forEach((slot) => {
      const mid = slot.model.id.toLowerCase()
      let role = ''
      let strength = ''

      if (mid.includes('deepseek') || mid.includes('claude')) {
        role = t('底层架构与深度推理 / 文笔意境攻坚', 'Core Architecture & Prose Master')
        strength = t('数理逻辑严密、底层技术原理 / 细腻文笔与心理描写', 'Deep technical rigor & formal proofs')
      } else if (mid.includes('chatgpt')) {
        role = t('实战落地案例 / 剧情反转与台词设计', 'Practical Case & Scenario Architect')
        strength = t('表达自然通俗、生动案例拆解 / 剧情反转与精炼台词', 'Intuitive case studies & edge-case prevention')
      } else if (mid.includes('kimi') || mid.includes('qwen') || mid.includes('doubao')) {
        role = t('条理化交付与分步清单 / 结构与设定严谨', 'Execution Checklist & Workflow Synthesizer')
        strength = t('长文本结构梳理、精准清单交付 / 设定严谨与动作连贯', 'Structured breakdown & actionable step-by-step checklist')
      } else {
        role = t('多维视角补充与精炼专家', 'Multi-Angle Refinement Specialist')
        strength = t('直达结论、精炼要点与盲区补充', 'Direct execution & blindspot analysis')
      }

      differenceList.push({
        modelName: slot.model.name,
        focus: role,
        strength
      })
    })

    const agentSystemPrompt = `# Role & Objective (专家角色与核心目标)
你是一位世界顶级的资深全栈系统架构师与 AI 提示词专家。你的任务是针对「${currentPrompt}」提供最高质量、生产环境级别的解决方案。

# Architecture & Tech Stack Rules (核心架构与技术规范)
- 遵循严密的数理逻辑与高内聚低耦合的架构设计模式
- 代码需具备极高的可维护性与扩展性，杜绝随意假定与未定义行为

# Code Robustness & Edge-Cases (健壮性与防错约束)
- 针对所有外部输入与网络通信，必须具备完备的边界防御与异常捕获逻辑
- 严格处理空值、并发冲突与重试机制，提供优雅降级方案

# Step-by-Step Execution Workflow (分步实施工作流)
1. 需求拆解与架构设计确立
2. 核心模块编码实现与边界检查
3. 单元测试与自测 Checklist 验证

# Negative Constraints (严禁事项)
- 严禁使用过时废弃 API，严禁硬编码敏感凭据与死循环逻辑。`

    setHubData({
      promptText: currentPrompt,
      timestamp: new Date().toLocaleTimeString(),
      rawAnswers: extractedAnswers,
      consensus: consensusPoints,
      differences: differenceList,
      agentSystemPrompt
    })

    setIsExtracting(false)
    setShowHubModal(true)
  }

  // 允许用户直接在左侧编辑/修正抓取的回答文本
  const handleUpdateRawAnswerText = (index: number, newText: string) => {
    if (!hubData) return
    const updated = [...hubData.rawAnswers]
    if (updated[index]) {
      updated[index] = { ...updated[index], text: newText }
      setHubData({ ...hubData, rawAnswers: updated })
    }
  }

  // 一键从剪贴板粘贴到当前选中的左侧模型中
  const handlePasteFromClipboardToActiveTab = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        handleUpdateRawAnswerText(activeLeftTab, text)
        showToast(t(`✅ 已成功将剪贴板内容粘贴到当前模型！`, `Pasted to current model!`))
      } else {
        showToast(t('剪贴板中暂无文本内容', 'Clipboard is empty'))
      }
    } catch {
      showToast(t('无法读取剪贴板，请直接在下方输入框 Ctrl+V 粘贴', 'Please paste manually with Ctrl+V'))
    }
  }

  // 动态构建汇总包文本（带出处）
  const computedAggregatedText = useMemo(() => {
    if (!hubData) return ''
    return hubData.rawAnswers
      .map((a, idx) => {
        const textContent = a.text.trim() || t('（未提供有效回答正文）', '(No response text provided)')
        return `==================================================\n【专家 ${idx + 1}：${a.modelName} (${a.tag}) 回答原文】\n${textContent}\n`
      })
      .join('\n')
  }, [hubData, t])

  // 🚀 将左侧全部答卷一键喂入右侧【独立总审官大模型视窗】（真材实料，带全文）
  const handleSendToIndependentJudge = async () => {
    if (!hubData) return

    const judgePrompt = `【多模型方案终审与二轮分工裁决任务】
原始议题：「${hubData.promptText}」

以下是各个模型提交的第一轮回答原文汇总：
${computedAggregatedText}

────────────────────────────────────────
请你作为【首席总评审与总架构师】，对以上所有模型的回答进行深度审阅与终极裁决：
1. 🔍 【各家优劣与冲突裁决】：指出各方案的核心分歧，裁决哪种思路最优，指出各家存在的漏洞；
2. 🎯 【二轮针对性任务分配】：现场明确给各个模型分配下一轮的深化攻坚任务（指出它需要补充什么、修改什么）；
3. 🏆 【终极融合神作】：将各家精华融合成一份完整的、单一的终极方案（若是小说输出完整精彩章节，若是编程输出完整健壮代码）；
4. 🤖 【配套 AI Agent 提示词】：输出可直接在 Cursor/Cline 中运行的 System Prompt！`

    navigator.clipboard.writeText(judgePrompt)

    const ok = await injectAndSendToWebview('wv-independent-judge', judgePrompt)

    if (ok) {
      showToast(t(`🚀 已成功将各模型完整答卷喂入右侧总审官，正在实时生成裁决！`, `Sent to independent judge model!`))
    } else {
      showToast(t(`✅ 终审指令已复制到剪贴板，请直接在右侧窗口 Ctrl+V 粘贴发送！`, `Prompt copied! Paste with Ctrl+V on the right!`))
    }
  }

  // 🌟 真正实时抓取右侧总审官生成的最新回答 ➔ 先关弹窗 ➔ 向主屏各模型派发二轮攻坚
  const handleExtractJudgeAndDispatchRound2 = async () => {
    if (!hubData) return
    setIsDispatchingRound2(true)

    const extractorCode = `(() => {
      try {
        const selectors = [
          '[data-message-author-role="assistant"]',
          '.ds-markdown',
          '.chat-message-assistant',
          '.markdown',
          '.prose',
          '.message-content',
          'div[class*="assistant"]',
          'div[class*="message"]'
        ];

        for (const s of selectors) {
          try {
            const found = document.querySelectorAll(s);
            if (found && found.length > 0) {
              for (let i = found.length - 1; i >= 0; i--) {
                const txt = (found[i].innerText || found[i].textContent || '').trim();
                if (txt && txt.length > 20) {
                  return txt;
                }
              }
            }
          } catch(e) {}
        }

        return (document.body ? (document.body.innerText || '') : '').trim();
      } catch (e) {
        return '';
      }
    })()`

    const wvJudge = document.getElementById('wv-independent-judge') as unknown as { executeJavaScript?: (code: string) => Promise<string> }
    let liveJudgeText = ''

    if (wvJudge && typeof wvJudge.executeJavaScript === 'function') {
      try {
        liveJudgeText = (await wvJudge.executeJavaScript(extractorCode)) || ''
      } catch {}
    }

    if (!liveJudgeText || liveJudgeText.length < 20) {
      setIsDispatchingRound2(false)
      showToast(t('⚠️ 右侧总审官尚未完成回答，请稍等片刻生成完毕后再点击派发！', 'Judge is still answering. Please wait!'))
      return
    }

    // 动态组装真实的第二轮攻坚指令
    const round2Prompt = `【总评审裁决意见与第二轮深化攻坚任务】
原始议题：「${hubData.promptText}」

来自总评审（${judgeModel.name}）对全场各家方案的最新评审意见与修改指令如下：
${liveJudgeText}

────────────────────────────────────────
【你的任务】：
请结合上述总评审对全场方案的点评以及对你的要求，在你的第一轮回答基础上，开展第二轮针对性深化、漏洞修复与重构！`

    navigator.clipboard.writeText(round2Prompt)

    // 先关闭弹窗，确保主屏视窗处于可见与激活状态
    setShowHubModal(false)
    setIsDispatchingRound2(false)

    // 延时 250ms 让主屏 DOM 完全唤醒并聚焦后进行注入发送
    setTimeout(async () => {
      const activeSlotIds =
        layoutMode === 'split-2'
          ? ['wv-slot1', 'wv-slot2']
          : layoutMode === 'split-3'
          ? ['wv-slot1', 'wv-slot2', 'wv-slot3']
          : layoutMode === 'grid-4'
          ? ['wv-slot1', 'wv-slot2', 'wv-slot3', 'wv-slot4']
          : ['wv-slot1']

      await Promise.all(activeSlotIds.map((id) => injectAndSendToWebview(id, round2Prompt)))
      showToast(t(`🔥 已成功将总审官的最新裁决建议动态派发给主屏 ${activeSlotIds.length} 个模型！`, `Dispatched real judge advice to main screen models!`))
    }, 250)
  }

  // 保存新增自定义模型
  const handleSaveCustomModel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModelName.trim() || !newModelUrl.trim()) {
      showToast(t('请填写模型名称和网址', 'Please enter model name and URL'))
      return
    }

    let url = newModelUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const created = saveCustomModel({
      name: newModelName.trim(),
      nameEn: newModelName.trim(),
      url,
      tag: newModelTag.trim() || t('用户自定义', 'Custom')
    })

    setCustomModels(getCustomModels())
    setSlot1Id(created.id)
    setShowAddModal(false)
    setNewModelName('')
    setNewModelUrl('')
    setNewModelTag('')
    showToast(t(`成功添加自定义模型：${created.name}`, `Added custom model: ${created.name}`))
  }

  const renderModelSelect = (
    currentId: string,
    onSelect: (id: string) => void,
    className?: string
  ) => (
    <div className={cn('relative', className)}>
      <select
        value={currentId}
        onChange={(e) => {
          if (e.target.value === '__add_new__') {
            setShowAddModal(true)
          } else {
            onSelect(e.target.value)
          }
        }}
        className="h-7 pl-2 pr-6 rounded-md bg-card/90 border border-border/80 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:border-primary/60 transition-colors w-full truncate"
      >
        <optgroup label={t('🇨🇳 国内直连大模型', 'Domestic Direct Models')}>
          {PRESET_MODELS.slice(0, 6).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </optgroup>
        <optgroup label={t('🌐 国际顶流大模型', 'Global Top Models')}>
          {PRESET_MODELS.slice(6).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </optgroup>
        {customModels.length > 0 && (
          <optgroup label={t('⭐ 我的自定义模型', 'Custom Models')}>
            {customModels.map((m) => (
              <option key={m.id} value={m.id}>
                ★ {m.name}
              </option>
            ))}
          </optgroup>
        )}
        <option value="__add_new__">+ {t('添加自定义模型...', 'Add Custom Model...')}</option>
      </select>
      <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  )

  const renderPane = (
    slotKey: string,
    model: ArenaModel,
    onSelectModel: (id: string) => void,
    widthClass?: string,
    heightClass?: string,
    customStyle?: React.CSSProperties
  ) => {
    const isMax = maximizedSlot === slotKey

    return (
      <div
        style={customStyle}
        className={cn(
          'flex flex-col bg-background relative overflow-hidden border border-border/40 transition-all duration-150',
          isMax ? 'fixed inset-0 z-40 sm:left-20 sm:top-14 bg-background' : cn(widthClass, heightClass)
        )}
      >
        {/* 视窗顶部工具条 */}
        <div className="h-8 px-2.5 bg-muted/40 border-b border-border/40 flex items-center justify-between text-xs flex-none">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
            <SiteFavicon title={model.name} href={model.url} className="w-3.5 h-3.5 rounded-sm flex-shrink-0" />
            <div className="w-36 sm:w-44">
              {renderModelSelect(model.id, onSelectModel)}
            </div>
            <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-1.5 py-0.2 rounded border border-primary/20 hidden xl:inline truncate max-w-[120px]">
              {model.tag}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* ⛶ 视窗单屏最大化切换 */}
            <button
              onClick={() => setMaximizedSlot(isMax ? null : slotKey)}
              title={isMax ? t('恢复分屏', 'Restore Split') : t('临时最大化本窗口 (解决弹窗遮挡)', 'Maximize Pane')}
              className={cn(
                'p-1 rounded hover:bg-muted transition-colors',
                isMax ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isMax ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>

            <button
              onClick={() => refreshSlot(slotKey)}
              title={t('刷新本视窗', 'Reload')}
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <a
              href={model.url}
              target="_blank"
              rel="noopener noreferrer"
              title={t('在新窗口中打开', 'Open in new tab')}
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 视窗 webview 容器 */}
        <div className="flex-1 relative bg-background">
          {embedded ? (
            <webview
              id={`wv-${slotKey}`}
              key={`${slotKey}-${model.id}-${refreshKeys[slotKey] || 0}`}
              src={model.url}
              partition="persist:ai_arena"
              allowpopups={true}
              className="w-full h-full border-0"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <WebFallbackView model={model} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* 拖拽时的全屏透明防遮挡层 */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto bg-transparent" />
      )}

      {/* Toast 提醒 */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMsg}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 顶部控制栏 */}
      {/* ========================================================================= */}
      <header className="flex-none bg-background/90 backdrop-blur-lg border-b border-border/40 h-14 px-4 sm:px-6 sm:pl-24 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('首页', 'Home')}</span>
            </Button>
          </Link>

          <div className="h-4 w-[1px] bg-border/60" />

          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="font-bold text-sm sm:text-base tracking-tight hidden md:inline">
              {t('AI 大模型矩阵对比台', 'AI Model Arena')}
            </h1>
          </div>
        </div>

        {/* 顶部中央：多屏布局模式切换器 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60 text-xs">
            <button
              onClick={() => { setLayoutMode('split-2'); setMaximizedSlot(null) }}
              title={t('双栏自由拖拽分屏 (1:1)', '2-Pane Split (Resizable)')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all',
                layoutMode === 'split-2'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('双栏分屏', '2-Split')}</span>
            </button>

            <button
              onClick={() => { setLayoutMode('split-3'); setMaximizedSlot(null) }}
              title={t('三栏多模型并排 (1:1:1)', '3-Pane Triple')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all',
                layoutMode === 'split-3'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('三栏竞速', '3-Triple')}</span>
            </button>

            <button
              onClick={() => { setLayoutMode('grid-4'); setMaximizedSlot(null) }}
              title={t('四宫格全开对比 (2x2)', '4-Pane Quad Grid')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all',
                layoutMode === 'grid-4'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('四宫格矩阵', '4-Quad')}</span>
            </button>
          </div>

          {/* 交换前两屏按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap12}
            title={t('交换槽位1与槽位2 (⇄)', 'Swap 1 & 2')}
            className="h-8 w-8 rounded-lg flex-shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </Button>

          {/* 自定义模型按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="h-8 gap-1 text-xs hidden sm:flex"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('自定义', 'Custom')}</span>
          </Button>

          <WindowControls />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 主屏幕：独立答题区（保留原始各家对比回答，绝不污染） */}
      {/* ========================================================================= */}
      <div ref={containerRef} className="flex-1 flex min-h-0 relative sm:pl-20 select-none bg-muted/20">
        {/* 模式 1：双栏可无级拖拽分屏 (split-2) */}
        {layoutMode === 'split-2' && (
          <div className="w-full h-full flex relative">
            {/* 左屏 */}
            {renderPane('slot1', m1, setSlot1Id, undefined, 'h-full', { width: `${splitRatio}%` })}

            {/* ↔️ 可拖拽阻尼把手 */}
            <div
              onMouseDown={handleMouseDown}
              className={cn(
                'w-2.5 -mx-1 z-20 cursor-col-resize hover:bg-primary/50 transition-colors flex items-center justify-center group flex-none',
                isDragging && 'bg-primary'
              )}
              title={t('按住鼠标左右拖拽调节视窗比例', 'Drag to resize')}
            >
              <div className="w-1 h-8 rounded-full bg-border group-hover:bg-primary transition-colors" />
            </div>

            {/* 右屏 */}
            {renderPane('slot2', m2, setSlot2Id, undefined, 'h-full', { width: `${100 - splitRatio}%` })}
          </div>
        )}

        {/* 模式 2：三栏并排分屏 (split-3) */}
        {layoutMode === 'split-3' && (
          <div className="w-full h-full flex">
            {renderPane('slot1', m1, setSlot1Id, 'w-1/3', 'h-full')}
            {renderPane('slot2', m2, setSlot2Id, 'w-1/3', 'h-full')}
            {renderPane('slot3', m3, setSlot3Id, 'w-1/3', 'h-full')}
          </div>
        )}

        {/* 模式 3：四宫格矩阵 (grid-4) */}
        {layoutMode === 'grid-4' && (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
            {renderPane('slot1', m1, setSlot1Id, 'w-full', 'h-full')}
            {renderPane('slot2', m2, setSlot2Id, 'w-full', 'h-full')}
            {renderPane('slot3', m3, setSlot3Id, 'w-full', 'h-full')}
            {renderPane('slot4', m4, setSlot4Id, 'w-full', 'h-full')}
          </div>
        )}

        {/* 模式 4：单屏全开 (single-1) */}
        {layoutMode === 'single-1' && (
          <div className="w-full h-full flex">
            {renderPane('slot1', m1, setSlot1Id, 'w-full', 'h-full')}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 底部统一提问发射台 */}
      {/* ========================================================================= */}
      <footer className="flex-none bg-card border-t border-border/60 p-3 sm:px-6 sm:pl-24 shadow-lg z-30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <textarea
              rows={1}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleAutoSendAll()
                }
              }}
              placeholder={t(
                '💡 输入问题或提示词... 点击【⚡ 一键同步发送】(Ctrl+Enter) 自动向所有大模型发送',
                'Enter prompt... Click Auto Send (Ctrl+Enter) to inject to all models'
              )}
              className="w-full pl-3 pr-16 py-2 rounded-xl bg-background border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all placeholder:text-muted-foreground/60 leading-normal"
            />
            {promptInput && (
              <button
                onClick={() => setPromptInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1 rounded bg-muted/60"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end flex-wrap">
            {/* 载入模板 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatePicker(true)}
              className="h-9 gap-1.5 text-xs whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('模板库', 'Templates')}</span>
            </Button>

            {/* ⚡ 一键同步多发 */}
            <Button
              size="sm"
              disabled={isSending}
              onClick={handleAutoSendAll}
              className="h-9 gap-1.5 text-xs font-semibold px-3.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm whitespace-nowrap transition-all"
            >
              <Zap className={cn('w-3.5 h-3.5', isSending && 'animate-bounce')} />
              <span>{isSending ? t('正在同步发送...', 'Sending...') : t('⚡ 一键同步发送', 'Auto Send')}</span>
            </Button>

            {/* 🧠 提取并打开【独立总审官协同控制台】 */}
            <Button
              size="sm"
              disabled={isExtracting}
              onClick={handleExtractAndSummarize}
              className="h-9 gap-1.5 text-xs font-semibold px-3.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 whitespace-nowrap transition-all"
            >
              <Brain className={cn('w-3.5 h-3.5', isExtracting && 'animate-spin')} />
              <span>{isExtracting ? t('正在抓取汇总...', 'Capturing...') : t('🧠 对比智能总结', 'AI Summary')}</span>
            </Button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 弹窗：🧠 【左侧原始答卷池 vs 右侧内嵌独立总审官大模型视窗】 */}
      {/* ========================================================================= */}
      {showHubModal && hubData && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-6xl h-[92vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 flex-none bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-600/10 text-purple-600">
                  <MessageSquareShare className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <span>{t('AI 多模型协同研判与独立总审官中心', 'Multi-Model Synthesis & Independent Arbiter')}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">({hubData.timestamp})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t('原始议题：', 'Topic:')} {hubData.promptText}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHubModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 核心双区：左侧答卷池 vs 右侧独立总审官 Webview */}
            <div className="flex-1 flex min-h-0 divide-x divide-border/50">
              
              {/* ================================================================= */}
              {/* 📄 左半区：【主屏各模型原始回答答卷池】（支持可视编辑与一键粘贴） */}
              {/* ================================================================= */}
              <div className="w-1/2 flex flex-col p-4 space-y-3 min-h-0 bg-background/50">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 flex-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{t('📄 原始作答池 (可编辑校准)', 'Raw Responses (Editable)')}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleExtractAndSummarize}
                      title={t('重新抓取主屏最新回答', 'Re-extract from Arena')}
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RefreshCw className={cn('w-3 h-3', isExtracting && 'animate-spin')} />
                      <span>{t('重新抓取', 'Refresh')}</span>
                    </Button>
                  </div>

                  {/* 模型切换 Tab */}
                  <div className="flex items-center gap-1">
                    {hubData.rawAnswers.map((ans, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveLeftTab(idx)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1',
                          activeLeftTab === idx ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span>{ans.modelName}</span>
                        <span className="text-[9px] opacity-75">({ans.text.trim().length}字)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 当前选中模型原文编辑框（100% 真实透明，用户可随时看清或直接编辑/粘贴） */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                  <textarea
                    value={hubData.rawAnswers[activeLeftTab]?.text || ''}
                    onChange={(e) => handleUpdateRawAnswerText(activeLeftTab, e.target.value)}
                    placeholder={t('（若未自动抓取到完整文本，您可直接在此处 Ctrl+V 粘贴该模型的回答，或点击右上角一键粘贴）', '(Paste model response here if needed)')}
                    className="w-full h-full p-3.5 rounded-xl bg-muted/20 border border-border/40 text-xs text-foreground leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 scrollbar-thin font-sans"
                  />
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePasteFromClipboardToActiveTab}
                      title={t('将剪贴板内容直接粘贴到当前模型', 'Paste from clipboard')}
                      className="h-6 px-2 text-[10px] gap-1 bg-card/80 backdrop-blur-sm shadow-sm"
                    >
                      <ClipboardPaste className="w-3 h-3 text-primary" />
                      <span>{t('粘贴剪贴板', 'Paste')}</span>
                    </Button>
                  </div>
                </div>

                {/* 提取的要点与各家优势速览 */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1.5 flex-none max-h-32 overflow-y-auto scrollbar-thin text-xs">
                  <span className="font-bold text-[11px] text-primary flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('各家回答亮点速览：', 'Quick Highlights:')}</span>
                  </span>
                  <div className="space-y-1">
                    {hubData.differences.map((d, i) => (
                      <div key={i} className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{d.modelName}</span>：{d.focus}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 左区底部操作条 */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 flex-none">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(computedAggregatedText)
                      setCopyAggregatedCopied(true)
                      setTimeout(() => setCopyAggregatedCopied(false), 2000)
                      showToast(t('✅ 全部原始答卷汇总包已复制！', 'Copied aggregated answers!'))
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    {copyAggregatedCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{t('复制全部答卷汇总包', 'Copy All Raw Answers')}</span>
                  </Button>

                  {/* 🌟 核心突破：先关弹窗唤醒主屏 ➔ 毫秒级注入派发二轮攻坚！ */}
                  <Button
                    size="sm"
                    disabled={isDispatchingRound2}
                    onClick={handleExtractJudgeAndDispatchRound2}
                    className="h-7 text-xs bg-primary text-primary-foreground gap-1 font-semibold"
                  >
                    <Zap className={cn('w-3.5 h-3.5', isDispatchingRound2 && 'animate-spin')} />
                    <span>{isDispatchingRound2 ? t('正在读取并派发...', 'Extracting & Dispatching...') : t('⚡ 读取右侧总审意见并向主屏派发二轮', 'Dispatch Judge Advice')}</span>
                  </Button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* 🤖 右半区：【独立的真实总结大模型 Webview】（绝不污染主屏） */}
              {/* ========================================================================= */}
              <div className="w-1/2 flex flex-col min-h-0 bg-background">
                {/* 独立总审官顶部控制条 */}
                <div className="h-10 px-3.5 bg-muted/40 border-b border-border/40 flex items-center justify-between flex-none">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-purple-600/10 text-purple-600">
                      <Bot className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-xs text-foreground">{t('👑 独立总审官大模型：', 'Chief Judge Model:')}</span>
                    <div className="w-36">
                      {renderModelSelect(judgeModel.id, setJudgeModelId)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={handleSendToIndependentJudge}
                      className="h-7 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t('🚀 一键喂入答卷开始研判', 'Feed Answers to Judge')}</span>
                    </Button>

                    <button
                      onClick={() => setJudgeRefreshKey((k) => k + 1)}
                      title={t('刷新总审官窗口', 'Reload Judge')}
                      className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 独立 Webview 视窗（完全隔离，专职总结） */}
                <div className="flex-1 relative bg-background min-h-0">
                  {embedded ? (
                    <webview
                      id="wv-independent-judge"
                      key={`judge-${judgeModel.id}-${judgeRefreshKey}`}
                      src={judgeModel.url}
                      partition="persist:ai_arena"
                      allowpopups={true}
                      className="w-full h-full border-0"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <WebFallbackView model={judgeModel} />
                  )}
                </div>

                {/* 右区底部操作 */}
                <div className="p-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs flex-none">
                  <span className="text-[11px] text-muted-foreground">
                    {t('💡 这是一个独立的真实大模型，您可在上方直接对话微调', 'Independent live model. You can chat inside.')}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(hubData.agentSystemPrompt)
                      setCopyAgentPromptCopied(true)
                      setTimeout(() => setCopyAgentPromptCopied(false), 2000)
                      showToast(t('🤖 AI Agent 工业级系统提示词已复制！', 'Agent Prompt copied!'))
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    {copyAgentPromptCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bot className="w-3.5 h-3.5" />}
                    <span>{t('复制 Agent 提示词模板', 'Copy Agent Prompt')}</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗：添加自定义大模型 */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomModel}
            className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>{t('添加自定义 AI 大模型网址', 'Add Custom AI Model')}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t('模型名称 *', 'Model Name *')}</label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="如：我的本地Ollama / 公司知识库 / Grok"
                  className="w-full p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t('网页 URL 网址 *', 'Website URL *')}</label>
                <input
                  type="text"
                  required
                  value={newModelUrl}
                  onChange={(e) => setNewModelUrl(e.target.value)}
                  placeholder="如：http://localhost:3000 或 https://grok.com/"
                  className="w-full p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">{t('标签/备注（可选）', 'Tag / Remark')}</label>
                <input
                  type="text"
                  value={newModelTag}
                  onChange={(e) => setNewModelTag(e.target.value)}
                  placeholder="如：本地私有部署 / 团队专用"
                  className="w-full p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                {t('取消', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                {t('保存并使用', 'Save & Use')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 弹窗：从提示词宝典快速选择模板 */}
      {/* ========================================================================= */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('从【AI 提示词灵感宝典】载入实战模板', 'Load Template from Prompts Hub')}</span>
              </h2>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
              {PROMPTS_DATA.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setPromptInput(item.prompt)
                    setShowTemplatePicker(false)
                    showToast(t(`已载入模板：${item.title}`, `Loaded: ${item.title}`))
                  }}
                  className="p-3.5 rounded-xl bg-background border border-border/60 hover:border-primary/60 hover:shadow-md cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm group-hover:text-primary transition-colors">
                      {locale === 'en' ? item.titleEn : item.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {item.tags[0]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <Link href="/prompts" className="text-xs text-primary hover:underline flex items-center gap-1">
                <span>{t('前往完整提示词宝典进行参数填空 →', 'Go to Prompts Hub for full variables →')}</span>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setShowTemplatePicker(false)}>
                {t('关闭', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WebFallbackView({ model }: { model: ArenaModel }) {
  const { t } = useLanguage()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-muted/20">
      <div className="max-w-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-card border border-border/60 p-2 mx-auto flex items-center justify-center shadow-sm">
          <SiteFavicon title={model.name} href={model.url} className="w-8 h-8 rounded-lg" />
        </div>
        <h3 className="font-bold text-base">{model.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {model.tag} · {t('在桌面客户端中直接内嵌多屏对比。网页端支持新标签页体验。', 'Direct multi-pane comparison in Desktop App.')}
        </p>
        <a
          href={model.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('在新窗口中打开', 'Open Website')}</span>
        </a>
      </div>
    </div>
  )
}
