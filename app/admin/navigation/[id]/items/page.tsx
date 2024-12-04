'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem, NavigationSubItem } from '@/types/navigation'

interface SubCategory {
  id: string
  title: string
  items: NavigationSubItem[]
}

export default function ItemsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<NavigationItem | null>(null)
  const [items, setItems] = useState<NavigationSubItem[]>([])

  const subCategoryId = searchParams.get('subId')

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCategory(data)

      if (subCategoryId) {
        const subCategory = data.subCategories?.find((s: SubCategory) => s.id === subCategoryId)
        if (subCategory) {
          setItems(subCategory.items || [])
        }
      } else {
        setItems(data.items || [])
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '加载数据失败',
        variant: 'destructive'
      })
      router.back()
    }
  }

  // ... rest of component code
}