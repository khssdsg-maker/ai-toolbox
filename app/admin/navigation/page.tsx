'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem } from '@/types/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog"
import { NavigationCard } from './components/NavigationCard'
import { AddCategoryForm } from './components/AddCategoryForm'

interface AddNavigationValues {
  title: string
  icon: string
}

export default function NavigationManagement() {
  const [items, setItems] = useState<NavigationItem[]>([])
  const { toast } = useToast()
  
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/navigation')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(data.navigationItems || [])
    } catch (error) {
      toast({
        title: "错误",
        description: "加载数据失败",
        variant: "destructive"
      })
    }
  }

  const addItem = async (values: AddNavigationValues) => {
    try {
      const newItem: NavigationItem = {
        id: Date.now().toString(),
        title: values.title,
        icon: values.icon,
        items: [],
        subCategories: []
      }

      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navigationItems: [...items, newItem]
        })
      })

      if (!response.ok) throw new Error('Failed to save')

      setItems(prev => [...prev, newItem])
      toast({
        title: "成功",
        description: "添加成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">导航管理</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              添加导航
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加导航</DialogTitle>
            </DialogHeader>
            <AddCategoryForm onSubmit={addItem} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items.map(item => (
          <NavigationCard
            key={item.id}
            item={item}
            onUpdate={fetchItems}
          />
        ))}
      </div>
    </div>
  )
} 