import { Metadata } from 'next/types'
import { FavoritesCenter } from '@/components/favorites-center'

export const metadata: Metadata = {
    title: '我的收藏 - AI万能工具箱',
    description: '收藏你喜欢的视频，随时观看',
}

export default function FavoritesPage() {
    return <FavoritesCenter />
}
