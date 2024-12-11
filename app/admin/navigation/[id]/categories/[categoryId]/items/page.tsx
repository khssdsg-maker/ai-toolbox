'use client'

export const runtime = 'edge'

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
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import { Badge } from "@/registry/new-york/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select"

interface EditingItem {
  index: number
  item: NavigationSubItem
}

interface NavigationSubItem {
  id: string
  title: string
  href: string
  icon?: string
  description?: string
  enabled: boolean
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
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all')

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
      setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (values: NavigationSubItem) => {
    if (!params?.id || !navigation || !category) return

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
    if (!params?.id || !navigation || !category) return

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
    if (!params?.id || !navigation || !category) return

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
    if (!params?.id || !navigation || !category || !category.items) return

    const newItems = [...category.items]
    const [removed] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, removed)

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    moveItem(result.source.index, result.destination.index)
  }

  const moveToTop = async (index: number) => {
    if (!category?.items || index <= 0) return
    moveItem(index, 0)
  }

  const moveToBottom = async (index: number) => {
    if (!category?.items || index >= category.items.length - 1) return
    moveItem(index, category.items.length - 1)
  }

  const filteredItems = category?.items?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ? true : filter === 'enabled' ? item.enabled : !item.enabled
    return matchesSearch && matchesFilter
  }) || []

  return (
    <div className="space-y-4">
      {loading ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-64" />
            </div>
          </div>
          
          <div className="grid gap-2">
            {[...Array(5)].map((_, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-2 px-4 bg-card rounded-lg border shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
                title="返回"
              >
                <Icons.arrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {navigation?.title} 
                  {category?.parentId && navigation?.subCategories?.find(cat => cat.id === category.parentId)?.title && (
                    <>
                      {' > '}{navigation.subCategories.find(cat => cat.id === category.parentId)?.title}
                    </>
                  )}
                  {' > '}{category?.title}
                </div>
              </div>
              <div className="relative flex-1 max-w-sm">
                <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索站点..."
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
              <Select
                value={filter}
                onValueChange={(value: 'all' | 'enabled' | 'disabled') => setFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="按状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="enabled">已启用</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  添加站点
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加站点</DialogTitle>
                </DialogHeader>
                <AddItemForm 
                  onSubmit={addItem} 
                  onCancel={() => {
                    const dialog = document.querySelector('dialog')
                    if (dialog) {
                      dialog.close()
                    }
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-2">
                  {filteredItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="group relative"
                        >
                          <div className="flex items-center justify-between py-2 px-4 bg-card rounded-lg border shadow-sm transition-colors hover:bg-accent/10">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                {item.icon ? (
                                  <img src={item.icon} alt={item.title} className="w-4 h-4 object-contain" />
                                ) : (
                                  <Icons.link className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium leading-none">{item.title}</span>
                                  {!item.enabled && (
                                    <Badge variant="secondary" className="text-xs">已禁用</Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
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
                      )}
                    </Draggable>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      {category?.items?.length === 0 ? (
                        <p>暂无站点</p>
                      ) : (
                        <p>未找到匹配的站点</p>
                      )}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑站点</DialogTitle>
              </DialogHeader>
              <AddItemForm
                defaultValues={editingItem?.item}
                onSubmit={(values) => {
                  if (editingItem) {
                    return updateItem(editingItem.index, values)
                  }
                  return Promise.resolve()
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
                  确定要删除站点 "{deletingItem?.item.title}" 吗？此操作无法撤销。
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
        </>
      )}
    </div>
  )
}
