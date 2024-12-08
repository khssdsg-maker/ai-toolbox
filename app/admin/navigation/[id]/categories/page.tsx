'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem, NavigationCategory } from '@/types/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/registry/new-york/ui/dialog"
import { AddCategoryForm } from '../../components/AddCategoryForm'
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

export default function CategoriesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [navigation, setNavigation] = useState<NavigationItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCategory, setEditingCategory] = useState<NavigationCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<NavigationCategory | null>(null)

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
    fetchNavigation()
  }, [params.id])

  const fetchNavigation = async () => {
    try {
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setNavigation(data)
    } catch (error) {
      toast({
        title: "错误",
        description: "加载数据失败",
        variant: "destructive"
      })
    }
  }

  const addCategory = async (values: { title: string, icon: string }) => {
    if (!navigation) return

    try {
      const newCategory: NavigationCategory = {
        id: Date.now().toString(),
        title: values.title,
        icon: values.icon,
        items: []
      }

      const updatedNavigation: NavigationItem = {
        ...navigation,
        subCategories: [...(navigation.subCategories || []), newCategory]
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      const updatedData = await response.json()
      setNavigation(updatedData)
      
      toast({
        title: "成功",
        description: "添加成功"
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "保存失败",
        variant: "destructive"
      })
    }
  }

  const editCategory = async (values: { title: string, icon: string }) => {
    if (!navigation || !editingCategory) return

    try {
      const updatedCategories = navigation.subCategories?.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, title: values.title, icon: values.icon }
          : cat
      ) || []

      const updatedNavigation: NavigationItem = {
        ...navigation,
        subCategories: updatedCategories
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save')

      const updatedData = await response.json()
      setNavigation(updatedData)
      setEditingCategory(null)
      
      toast({
        title: "成功",
        description: "更新成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive"
      })
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!navigation) return

    try {
      const updatedNavigation: NavigationItem = {
        ...navigation,
        subCategories: navigation.subCategories?.filter(cat => cat.id !== categoryId) || []
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to delete')

      const updatedData = await response.json()
      setNavigation(updatedData)
      
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

  const moveCategory = async (fromIndex: number, toIndex: number) => {
    if (!navigation?.subCategories) return

    const newCategories = arrayMove(navigation.subCategories, fromIndex, toIndex)
    const updatedNavigation = {
      ...navigation,
      subCategories: newCategories
    }

    try {
      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save order')

      const updatedData = await response.json()
      setNavigation(updatedData)
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
    
    if (!over || active.id === over.id || !navigation?.subCategories) return

    const oldIndex = navigation.subCategories.findIndex(cat => cat.id === active.id)
    const newIndex = navigation.subCategories.findIndex(cat => cat.id === over.id)
    
    moveCategory(oldIndex, newIndex)
  }

  const moveToTop = async (id: string) => {
    if (!navigation?.subCategories) return
    const index = navigation.subCategories.findIndex(cat => cat.id === id)
    if (index > 0) {
      moveCategory(index, 0)
    }
  }

  const moveToBottom = async (id: string) => {
    if (!navigation?.subCategories) return
    const index = navigation.subCategories.findIndex(cat => cat.id === id)
    if (index < (navigation.subCategories.length - 1)) {
      moveCategory(index, navigation.subCategories.length - 1)
    }
  }

  const filteredCategories = navigation?.subCategories?.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {navigation?.title || '加载中...'}
          </h2>
          <div className="relative flex-1 max-w-sm">
            <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索分类..."
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
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加分类</DialogTitle>
            </DialogHeader>
            <AddCategoryForm onSubmit={addCategory} />
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredCategories}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-2">
            {filteredCategories.map((category, index) => (
              <div key={category.id} className="group relative">
                <div
                  className="flex items-center justify-between py-2 px-4 bg-card rounded-lg border shadow-sm transition-colors hover:bg-accent/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      {(() => {
                        const IconComponent = category.icon ? Icons[category.icon as keyof typeof Icons] : Icons.folder;
                        return IconComponent ? <IconComponent className="h-4 w-4 text-primary" /> : <Icons.folder className="h-4 w-4 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-medium leading-none mb-1">{category.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.items?.length || 0} 个项目
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/admin/navigation/${params.id}/categories/${category.id}/items`)}
                      title="项目管理"
                    >
                      <Icons.list className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingCategory(category)}
                      title="编辑"
                    >
                      <Icons.edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeletingCategory(category)}
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
                      onClick={() => moveToTop(category.id)}
                      title="置顶"
                    >
                      <Icons.chevronLeft className="h-4 w-4 -rotate-90" />
                    </Button>
                  )}
                  {index < (navigation?.subCategories?.length || 0) - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveToBottom(category.id)}
                      title="置底"
                    >
                      <Icons.chevronRight className="h-4 w-4 rotate-90" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                {navigation?.subCategories?.length === 0 ? (
                  <p>暂无分类</p>
                ) : (
                  <p>未找到匹配的分类</p>
                )}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          <AddCategoryForm
            defaultValues={{ title: editingCategory?.title || '', icon: editingCategory?.icon || '' }}
            onSubmit={editCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除确认</DialogTitle>
            <DialogDescription>
              确定要删除分类 "{deletingCategory?.title}" 吗？此操作无法撤销，分类下的所有项目也将被删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeletingCategory(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingCategory) {
                  deleteCategory(deletingCategory.id)
                  setDeletingCategory(null)
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