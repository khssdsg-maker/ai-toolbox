import asyncio
import os
import sys
import edge_tts

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VOICE = "zh-CN-YunxiNeural"
RATE = "+10%"
PITCH = "+0Hz"

SCRIPTS = {
    "01-arena": "欢迎来到 AI万能工具箱的大模型分屏对比台！在这里，你可以一键唤醒 DeepSeek R1、ChatGPT、Claude 和 Kimi 等十多款顶流大模型。支持双栏、三栏与四宫格自由切换，内置沙箱底层反风控技术，彻底消除网页拦截与频繁登录，让多模型同台竞技从未如此丝滑！",
    "02-judgment": "这就是 v1.5.2 独家重磅上线的双区研判协同架构！左侧主屏原始答卷池，自动提取各大模型的回答全文与实时字数；右侧独立总审官大模型视窗，专职深度剖析并裁决回答冲突，更支持一键派发第二轮定向攻坚，彻底终结多模型比对的混乱！",
    "03-prompts": "告别提示词枯竭！AI 提示词灵感宝典汇聚全球 11 大顶尖 Prompt 平台与 5 大高频场景。无论是小说创作、代码重构还是绘画咒语，只需动态填空，点击分屏对比按钮，即可一键将提示词秒级直传到对比台，效率直接拉满！",
    "04-translate": "全网首创常驻全自动网页翻译引擎！深度监听单页应用动态 DOM，无论切换 Tab 还是向下滚动加载，新出现的英文内容毫秒级自动汉化；跨页面切页自动继承翻译状态，彻底告别每次手动点击翻译的繁琐体验！",
    "05-ecosystem": "一站式超级生产力中枢！内置 Convertio 全能文件转换中心，文档、音视频即拖即转；集成驱动官方下载与精选网络工具；搭载免翻墙高速 CDN 与本地零闪烁缓存，开箱即用，全面重塑你的日常工作流！"
}

async def generate_audio():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "videos", "audio")
    os.makedirs(output_dir, exist_ok=True)
    
    print("[TTS] Starting Microsoft Edge Neural TTS voiceover generation...")
    
    for key, text in SCRIPTS.items():
        out_path = os.path.join(output_dir, f"{key}.mp3")
        print(f"  -> Generating [{key}]...")
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(out_path)
        print(f"  [OK] Saved: {out_path}")
        
    print("\n[SUCCESS] All 5 voiceovers generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate_audio())
