'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem, NavigationSubItem } from '@/types/navigation'
import { Input } from "@/registry/new-york/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/registry/new-york/ui/dialog"
import { AddItemForm } from '../../components/AddItemForm'
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

export default function ItemsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [navigation, setNavigation] = useState<NavigationItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<EditingItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    if (!params?.id) {
      router.push('/admin/navigation')
      return
    }
    fetchNavigation()
  }, [params?.id, router])

  const fetchNavigation = async () => {
    setIsLoading(true)
    try {
      const navigationResponse = await fetch(`/api/navigation/${params!.id}`)
      if (!navigationResponse.ok) throw new Error('Failed to fetch navigation')
      const navigationData = await navigationResponse.json()
      setNavigation(navigationData)
    } catch (error) {
      toast({
        title: "错误",
        description: "加载数据失败",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (values: NavigationSubItem) => {
    try {
      const response = await fetch(`/api/navigation/${params!.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) throw new Error('Failed to save')

      await fetchNavigation()
      toast({
        title: "成功",
        description: "添加成功"
      })
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive"
      })
    }
  }

  const updateItem = async (index: number, values: NavigationSubItem) => {
    try {
      const response = await fetch(`/api/navigation/${params!.id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index,
          item: values
        })
      })

      if (!response.ok) throw new Error('Failed to update')

      await fetchNavigation()
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
    try {
      const response = await fetch(`/api/navigation/${params!.id}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index })
      })

      if (!response.ok) throw new Error('Failed to delete')

      await fetchNavigation()
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
    if (!navigation || !navigation.items) return

    try {
      const response = await fetch(`/api/navigation/${params!.id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromIndex,
          toIndex
        })
      })

      if (!response.ok) throw new Error('Failed to save order')

      await fetchNavigation() // 重新获取最新数据
    } catch (error) {
      toast({
        title: "错误",
        description: "保存���序失败",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id || !navigation?.items) return

    const oldIndex = navigation.items.findIndex(item => item.id === active.id)
    const newIndex = navigation.items.findIndex(item => item.id === over.id)
    
    moveItem(oldIndex, newIndex)
  }

  const moveToTop = async (index: number) => {
    if (index > 0) {
      moveItem(index, 0)
    }
  }

  const moveToBottom = async (index: number) => {
    if (!navigation?.items) return
    if (index < navigation.items.length - 1) {
      moveItem(index, navigation.items.length - 1)
    }
  }

  const filteredItems = navigation?.items?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (!navigation) {
    return <div>导航不存在</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {navigation?.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            管理导航项目列表
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              添加项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加导航项目</DialogTitle>
              <DialogDescription>
                添加一个新的导航项目到当前分类中
              </DialogDescription>
            </DialogHeader>
            <AddItemForm onSubmit={addItem} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Icons.spinner className="h-6 w-6 animate-spin" />
        </div>
      ) : navigation?.items && navigation.items.length > 0 ? (
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
                <div key={index} className="group relative">
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
                    {index < (navigation?.items?.length || 0) - 1 && (
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
                  {navigation?.items?.length === 0 ? (
                    <p>暂无子项目</p>
                  ) : (
                    <p>未找到匹配的子项目</p>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          暂无子项目
        </div>
      )}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑子项目</DialogTitle>
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
              确定要删除子项目 "{deletingItem?.item.title}" 吗？此操作无法撤销。
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