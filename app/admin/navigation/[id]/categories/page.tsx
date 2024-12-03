'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem } from '@/types/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface SubCategory {
  id: string
  title: string
  items: {
    title: string
    href: string
  }[]
}

export default function CategoriesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<NavigationItem | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCategory()
    }
  }, [params.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCategory(data)
    } catch (error) {
      toast({
        title: '错误',
        description: '加载分类数据失败',
        variant: 'destructive'
      })
    }
  }

  // ... rest of the component code
} 