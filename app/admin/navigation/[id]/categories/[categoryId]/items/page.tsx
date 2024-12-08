'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem, NavigationCategory, NavigationSubItem } from '@/types/navigation'
import { AddItemForm } from "../../../../components/AddItemForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/registry/new-york/ui/dialog"
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

interface EditingItem {
  index: number
  item: NavigationSubItem
}

export default function CategoryItemsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [navigation, setNavigation] = useState<NavigationItem | null>(null)
  const [category, setCategory] = useState<NavigationCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<EditingItem | null>(null)

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
    if (!params?.id || !params?.categoryId) {
      router.push('/admin/navigation')
      return
    }
    fetchData()
  }, [params?.id, params?.categoryId])

  const fetchData = async () => {
    if (!params?.id || !params?.categoryId) return

    try {
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setNavigation(data)
      
      const foundCategory = data.subCategories?.find(
        (cat: NavigationCategory) => cat.id === params.categoryId
      )
      if (!foundCategory) throw new Error('Category not found')
      setCategory(foundCategory)
    } catch (error) {
      toast({
        title: "错误",
        description: "加载数据失败",
        variant: "destructive"
      })
    }
  }

  const addItem = async (values: NavigationSubItem) => {
    if (!navigation || !category) return

    try {
      const updatedCategory = {
        ...category,
        items: [...(category.items || []), values]
      }

      const updatedNavigation = {
        ...navigation,
        subCategories: navigation.subCategories?.map(cat =>
          cat.id === category.id ? updatedCategory : cat
        )
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save')

      const data = await response.json()
      setNavigation(data)
      setCategory(updatedCategory)
      
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

  const updateItem = async (index: number, values: NavigationSubItem) => {
    if (!navigation || !category) return

    try {
      const updatedItems = [...(category.items || [])]
      updatedItems[index] = values

      const updatedCategory = {
        ...category,
        items: updatedItems
      }

      const updatedNavigation = {
        ...navigation,
        subCategories: navigation.subCategories?.map(cat =>
          cat.id === category.id ? updatedCategory : cat
        )
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to update')

      const data = await response.json()
      setNavigation(data)
      setCategory(updatedCategory)
      setEditingItem(null)
      
      toast({
        title: "成功",
        description: "更新成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "更新失败",
        variant: "destructive"
      })
    }
  }

  const deleteItem = async (index: number) => {
    if (!navigation || !category) return

    try {
      const updatedItems = [...(category.items || [])]
      updatedItems.splice(index, 1)

      const updatedCategory = {
        ...category,
        items: updatedItems
      }

      const updatedNavigation = {
        ...navigation,
        subCategories: navigation.subCategories?.map(cat =>
          cat.id === category.id ? updatedCategory : cat
        )
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to delete')

      const data = await response.json()
      setNavigation(data)
      setCategory(updatedCategory)
      setDeletingItem(null)
      
      toast({
        title: "成功",
        description: "删除成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "删除失败",
        variant: "destructive"
      })
    }
  }

  const moveItem = async (fromIndex: number, toIndex: number) => {
    if (!navigation || !category || !category.items) return

    const newItems = arrayMove(category.items, fromIndex, toIndex)
    const updatedCategory = {
      ...category,
      items: newItems
    }

    const updatedNavigation = {
      ...navigation,
      subCategories: navigation.subCategories?.map(cat =>
        cat.id === category.id ? updatedCategory : cat
      )
    }

    try {
      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save order')

      const data = await response.json()
      setNavigation(data)
      setCategory(updatedCategory)
    } catch (error) {
      toast({
        title: "错误",
        description: "保存顺序失败",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id || !category?.items) return

    const oldIndex = category.items.findIndex(item => item.id === active.id)
    const newIndex = category.items.findIndex(item => item.id === over.id)
    
    moveItem(oldIndex, newIndex)
  }

  const moveToTop = async (index: number) => {
    if (index > 0) {
      moveItem(index, 0)
    }
  }

  const moveToBottom = async (index: number) => {
    if (!category?.items) return
    if (index < category.items.length - 1) {
      moveItem(index, category.items.length - 1)
    }
  }

  const filteredItems = category?.items?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.href.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
            title="返回"
          >
            <Icons.back className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              {navigation?.title} {category?.parentId && navigation?.subCategories?.find(cat => cat.id === category.parentId)?.title && (
                <>
                  / {navigation.subCategories.find(cat => cat.id === category.parentId)?.title}
                </>
              )}
            </div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {category?.title || '加载中...'} - 项目管理
            </h2>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索项目..."
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
                <Icons.close className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              添加项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加项目</DialogTitle>
            </DialogHeader>
            <AddItemForm onSubmit={addItem} />
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
                <div
                  className="flex items-center justify-between py-2 px-4 bg-card rounded-lg border shadow-sm transition-colors hover:bg-accent/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      {item.icon ? (
                        <img src={item.icon} alt={item.title} className="w-4 h-4 object-contain" />
                      ) : (
                        <Icons.link className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium leading-none mb-1">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(item.href, '_blank')}
                      title="访问链接"
                    >
                      <Icons.globe className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingItem({ index, item })}
                      title="编辑"
                    >
                      <Icons.edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeletingItem({ index, item })}
                      title="删除"
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 hidden group-hover:flex items-center gap-1">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveToTop(index)}
                      title="置顶"
                    >
                      <Icons.chevronLeft className="h-4 w-4 -rotate-90" />
                    </Button>
                  )}
                  {index < (category?.items?.length || 0) - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveToBottom(index)}
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
                {category?.items?.length === 0 ? (
                  <p>暂无项目</p>
                ) : (
                  <p>未找到匹配的项目</p>
                )}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
          </DialogHeader>
          <AddItemForm
            defaultValues={editingItem?.item}
            onSubmit={(values) => editingItem && updateItem(editingItem.index, values)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除确认</DialogTitle>
            <DialogDescription>
              确定要删除项目 "{deletingItem?.item.title}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeletingItem(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingItem) {
                  deleteItem(deletingItem.index)
                }
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
