import { Metadata } from 'next/types'
import { DriversCenter } from '@/components/drivers-center'

export const metadata: Metadata = {
    title: '驱动工具中心 - AI万能工具箱',
    description: '官方驱动下载入口汇总：联想戴尔惠普华为华硕、NVIDIA AMD Intel、驱动管理工具',
    keywords: '驱动下载,显卡驱动,官方驱动,驱动精灵,NVIDIA,AMD',
}

export default function DriversPage() {
    return <DriversCenter />
}
