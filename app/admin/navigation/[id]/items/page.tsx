'use client'

export const runtime = 'edge'

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
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Skeleton } from "@/registry/new-york/ui/skeleton"

interface EditingItem {
  index: number
  item: NavigationSubItem
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <div className="grid gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div>
                <Skeleton className="h-4 w-[200px] mb-2" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ItemsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [navigation, setNavigation] = useState<NavigationItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<EditingItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
      if (!params?.id) {
        throw new Error('Navigation ID not found')
      }

      const navigationId = params?.id
      if (!navigationId) {
        throw new Error('Navigation ID is missing')
      }
      const response = await fetch(`/api/navigation/${navigationId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setNavigation(data)
    } catch (error) {
      toast({
        title: "错误",
        description: "获取数据失败",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (values: NavigationSubItem) => {
    try {
      if (!params?.id || !navigation) {
        throw new Error('Navigation ID or data not found')
      }

      const navigationId = params?.id
      if (!navigationId) {
        throw new Error('Navigation ID is missing')
      }
      const response = await fetch(`/api/navigation/${navigationId}/items`, {
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
      if (!params?.id || !navigation) {
        throw new Error('Navigation ID or data not found')
      }

      const navigationId = params?.id
      if (!navigationId) {
        throw new Error('Navigation ID is missing')
      }
      const items = [...(navigation.items || [])]
      items[index] = values

      const updatedNavigation: NavigationItem = {
        id: navigation.id || navigationId,
        title: navigation.title || '',
        description: navigation.description || '',
        items,
        subCategories: navigation.subCategories || []
      }

      const response = await fetch(`/api/navigation/${navigationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save')

      setNavigation(updatedNavigation)
      toast({
        title: "成功",
        description: "保存成功"
      })
      setEditingItem(null)
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive"
      })
    }
  }

  const deleteItem = async (index: number) => {
    try {
      if (!params?.id || !navigation) {
        throw new Error('Navigation ID or data not found')
      }

      const navigationId = params?.id
      if (!navigationId) {
        throw new Error('Navigation ID is missing')
      }
      const items = [...(navigation.items || [])]
      items.splice(index, 1)

      const updatedNavigation: NavigationItem = {
        id: navigation.id || navigationId,
        title: navigation.title || '',
        description: navigation.description || '',
        items,
        subCategories: navigation.subCategories || []
      }

      const response = await fetch(`/api/navigation/${navigationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to delete')

      setNavigation(updatedNavigation)
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

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(navigation?.items || [])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    try {
      const navigationId = params?.id
      if (!navigationId) {
        throw new Error('Navigation ID is missing')
      }
      const response = await fetch(`/api/navigation/${navigationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...navigation,
          items
        })
      })

      if (!response.ok) throw new Error('Failed to save order')

      await fetchNavigation() // Refresh data
      toast({
        title: "成功",
        description: "项目顺序已更新"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "保存顺序失败",
        variant: "destructive"
      })
    }
  }

  const moveToTop = async (index: number) => {
    if (index > 0) {
      const items = Array.from(navigation?.items || [])
      const [reorderedItem] = items.splice(index, 1)
      items.unshift(reorderedItem)

      try {
        const navigationId = params?.id
        if (!navigationId) {
          throw new Error('Navigation ID is missing')
        }
        const response = await fetch(`/api/navigation/${navigationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...navigation,
            items
          })
        })

        if (!response.ok) throw new Error('Failed to save order')

        await fetchNavigation() // Refresh data
        toast({
          title: "成功",
          description: "项目顺序已更新"
        })
      } catch (error) {
        toast({
          title: "错误",
          description: "保存顺序失败",
          variant: "destructive"
        })
      }
    }
  }

  const moveToBottom = async (index: number) => {
    if (!navigation?.items) return
    if (index < navigation.items.length - 1) {
      const items = Array.from(navigation?.items || [])
      const [reorderedItem] = items.splice(index, 1)
      items.push(reorderedItem)

      try {
        const navigationId = params?.id
        if (!navigationId) {
          throw new Error('Navigation ID is missing')
        }
        const response = await fetch(`/api/navigation/${navigationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...navigation,
            items
          })
        })

        if (!response.ok) throw new Error('Failed to save order')

        await fetchNavigation() // Refresh data
        toast({
          title: "成功",
          description: "项目顺序已更新"
        })
      } catch (error) {
        toast({
          title: "错误",
          description: "保存顺序失败",
          variant: "destructive"
        })
      }
    }
  }

  const filteredItems = navigation?.items?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!navigation) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">导航不存在</p>
      </div>
    )
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
              <Icons.plus className="mr-2 h-4 w-4" />
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

      {navigation?.items && navigation.items.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-2">
                {filteredItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors ${
                          snapshot.isDragging ? 'bg-gray-50' : ''
                        }`}
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
                            <Icons.pencil className="h-4 w-4" />
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
                    )}
                  </Draggable>
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
            onSubmit={async (values) => {
              if (editingItem) {
                await updateItem(editingItem.index, values)
              }
            }}
            onCancel={() => setEditingItem(null)}
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