import asyncio
import os
import sys
import edge_tts

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VOICE = "zh-CN-YunxiNeural"
RATE = "+0%"  # 保持标准沉稳自然的解说语速，不急不躁
PITCH = "+0Hz"

MASTER_SCRIPT = """
欢迎来到 AI万能工具箱的完整功能深度精讲教程。在 AI 工具爆炸的今天，开发者和日常用户往往要在几十个网页书签和窗口之间反复横跳，不仅割裂了工作流，更浪费了大量的深度心流时间。AI万能工具箱正是为了彻底解决这一痛点而诞生的超级中枢。

首先，让我们看到首页的超级工具生态矩阵。这里清晰划分了 AI 对话、AI 编程、AI 绘画、AI 写作与小说生成等七大核心分类。不仅涵盖全球主流大厂的顶尖服务，更深度收录了数万星标的高口碑开源项目，例如热门小说生成器 SillyTavern 等。配合免翻墙高速 CDN 与本地零闪烁缓存技术，无论何时打开，所有图标与卡片都是首帧秒级渲染。顶部的全局搜索框支持极速关键词检索，输入即筛选，瞬间定位所需工具。

接下来，进入左侧悬浮胶囊栏的【AI 提示词灵感宝典】。优质的 Prompt 是释放大模型潜力的关键钥匙。本模块精选整合了全球十一大顶尖提示词平台，并针对网文写作、代码重构、Midjourney 咒语、小红书文案与学术思考五大高频场景，提炼了开箱即用的结构化模板。最强大的是动态参数填空功能：我们只需在模板中输入具体的业务参数，比如高并发订单中台重构，然后点击卡片上的【分屏对比】按钮，整个提示词就会带着参数一键秒级直传到大模型对比台，彻底告别繁琐的手动复制粘贴！

现在，我们来到了重头戏——【AI 大模型分屏对比台】。面对复杂的工程与创作任务，单一模型往往存在局限甚至幻觉。在这里，您可以同时唤醒 DeepSeek R1、ChatGPT、Claude 以及 Kimi 等十多款主流顶流大模型。界面支持双栏自由无级拖拽、三栏竞速并排以及四宫格全开矩阵。更值得一提的是底层技术创新：内置独立沙箱与反自动化风控绕过机制，伪装纯净原生 Chrome 桌面版，彻底消除了 ChatGPT 和豆包等平台的防嵌套拦截与警告，免登录物理持久化会话，让多模型同台竞技真正做到丝滑无阻！

紧接着，为您展示 v1.5.2 独家重磅上线的【双区多模型研判协同中枢】！在多模型比对时，最怕答卷混乱冲刷。我们独创了双区研判架构：左侧为主屏原始答卷池，自动提取各家模型的完整回答正文，并实时统计字数；右侧则常驻独立的【总审官大模型视窗】，专职对各家回答进行深度剖析与冲突裁决，快速提炼共识与优劣，更能一键生成并动态派发第二轮定向攻坚指令，带领各大模型实现协同进化与终极成果交付！

除了强大的 AI 矩阵，工具箱还提供了全方位的一站式实用生态。内置 Convertio 全能文件转换中心，文档、图片、音视频即拖即转；集成驱动官方下载与精选网络站长工具；点击底部的设置按钮，更可随时切换深色与浅色主题，全量配置永久保存在本地磁盘。

从工具聚合、提示词灵感，到多模型分屏对比与智能协同研判，AI万能工具箱以极致的工程质感与完全开源免费的初心，重塑您的日常生产力。立即前往 GitHub 下载体验，开启您的十倍效率时代！
"""

async def generate():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "videos", "audio")
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "master-full-tutorial-voiceover.mp3")
    
    print("[TTS] Starting Microsoft Edge Neural TTS generation for Master Tutorial...")
    communicate = edge_tts.Communicate(MASTER_SCRIPT.strip(), VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(out_path)
    print(f"[OK] Master Voiceover saved to: {out_path}")

if __name__ == "__main__":
    asyncio.run(generate())
