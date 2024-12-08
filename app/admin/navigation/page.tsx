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
import { Input } from "@/registry/new-york/ui/input"
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface AddNavigationValues {
  title: string
  icon: string
}

export default function NavigationManagement() {
  const [items, setItems] = useState<NavigationItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

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

  const moveItem = async (fromIndex: number, toIndex: number) => {
    const newItems = arrayMove(items, fromIndex, toIndex)
    setItems(newItems)

    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navigationItems: newItems
        })
      })

      if (!response.ok) throw new Error('Failed to save order')
    } catch (error) {
      toast({
        title: "错误",
        description: "保存顺序失败",
        variant: "destructive"
      })
      // 恢复原始顺序
      setItems(items)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(item => item.id === active.id)
    const newIndex = items.findIndex(item => item.id === over.id)
    
    moveItem(oldIndex, newIndex)
  }

  const moveToTop = async (id: string) => {
    const index = items.findIndex(item => item.id === id)
    if (index > 0) {
      moveItem(index, 0)
    }
  }

  const moveToBottom = async (id: string) => {
    const index = items.findIndex(item => item.id === id)
    if (index < items.length - 1) {
      moveItem(index, items.length - 1)
    }
  }

  // 过滤导航项
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索导航..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1 h-7 w-7 p-0"
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredItems}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-2">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="group relative">
                <NavigationCard
                  item={item}
                  onUpdate={fetchItems}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 hidden group-hover:flex items-center gap-1">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveToTop(item.id)}
                      title="置顶"
                    >
                      <Icons.chevronLeft className="h-4 w-4 -rotate-90" />
                    </Button>
                  )}
                  {index < items.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveToBottom(item.id)}
                      title="置底"
                    >
                      <Icons.chevronRight className="h-4 w-4 rotate-90" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                {items.length === 0 ? (
                  <p>暂无导航项目</p>
                ) : (
                  <p>未找到匹配的导航项目</p>
                )}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}