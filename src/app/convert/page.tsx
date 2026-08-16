import { Metadata } from 'next/types'
import { ConvertCenter } from '@/components/convert-center'

export const metadata: Metadata = {
    title: '文件转换 - AI万能工具箱',
    description: 'Convertio 在线文件转换 - 支持 300+ 种文件格式互转：PDF、Word、Excel、图片、音视频等',
    keywords: '文件转换,格式转换,Convertio,PDF转换,Word转换',
}

export default function ConvertPage() {
    return <ConvertCenter />
}
