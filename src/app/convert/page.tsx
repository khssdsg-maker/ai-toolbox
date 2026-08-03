import { Metadata } from 'next/types'
import { ConvertCenter } from '@/components/convert-center'

export const metadata: Metadata = {
    title: '文件转换中心 - AI万能工具箱',
    description: '在线文件格式转换工具 - 图片格式转换、JSON/CSV/YAML互转、Base64编解码、URL编解码',
    keywords: '文件转换,图片转换,JSON格式化,CSV转换,Base64,URL编码',
}

export default function ConvertPage() {
    return <ConvertCenter />
}
