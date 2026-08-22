import { Metadata } from 'next/types'
import { Container } from '@/components/ui/container'
import { SubmissionForm } from '@/components/submission-form'
import navigationData from '@/navsphere/content/navigation.json'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/registry/new-york/ui/button'
import { NavigationData } from '@/types/navigation'

export const metadata: Metadata = {
    title: '网站投稿 - AI万能工具箱',
    description: '向 AI万能工具箱 投稿优质网站，分享好资源'
}

export default function SubmitPage() {
    return (
        <Container>
            <div className="min-h-screen bg-background py-10 px-4">
                {/* 返回按钮 */}
                <div className="max-w-2xl mx-auto mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 hover:bg-muted/50 -ml-2">
                            <ArrowLeft className="h-4 w-4" />
                            返回首页
                        </Button>
                    </Link>
                </div>

                {/* 投稿表单 */}
                <SubmissionForm navigationData={navigationData as unknown as NavigationData} />

                {/* 投稿说明 */}
                <div className="max-w-2xl mx-auto mt-10 p-6 rounded-xl bg-muted/30 border border-border/30">
                    <h3 className="font-semibold mb-3 text-sm tracking-wide uppercase text-muted-foreground">投稿须知</h3>
                    <ul className="space-y-2.5 text-sm text-muted-foreground">
                        <li className="flex gap-2.5">
                            <span className="text-primary mt-1 text-xs">●</span>
                            <span>请确保提交的网站内容合法、健康、有价值</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="text-primary mt-1 text-xs">●</span>
                            <span>网站地址请填写完整的 URL（包含 https://）</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="text-primary mt-1 text-xs">●</span>
                            <span>网站描述请简洁明了，突出网站的核心功能和特点</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="text-primary mt-1 text-xs">●</span>
                            <span>投稿提交后将通过 GitHub Issues 进行管理</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="text-primary mt-1 text-xs">●</span>
                            <span>我们会尽快审核您的投稿，审核通过后将添加到导航列表</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Container>
    )
}
