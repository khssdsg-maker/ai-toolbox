'use client'

export const runtime = 'edge'

import { useState } from "react"
import { Button } from "@/registry/new-york/ui/button"
import { NavigationCard } from "./components/NavigationCard"
import { AddCategoryForm } from "./components/AddCategoryForm"
import { Input } from "@/registry/new-york/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import useSWR from 'swr'
import { NavigationItem } from "@/types/navigation"
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { Plus, X, AlertTriangle, Inbox } from 'lucide-react'

async function fetcher(url: string): Promise<NavigationItem[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch navigation items')
  const data = await res.json()
  return data.navigationItems || []
}

export default function NavigationPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  
  const { data: items = [], error, isLoading, mutate } = useSWR<NavigationItem[]>(
    '/api/navigation',
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  )

  const handleAdd = async (values: { title: string; icon: string }) => {
    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) throw new Error('Failed to add')

      setIsDialogOpen(false)
      mutate()
      toast({
        title: "成功",
        description: "添加成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "添加失败",
        variant: "destructive"
      })
    }
  }

  const handleMoveToTop = async (id: string) => {
    try {
      const response = await fetch(`/api/navigation/${id}/move-to-top`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to move')

      mutate()
      toast({
        title: "成功",
        description: "移动成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "移动失败",
        variant: "destructive"
      })
    }
  }

  const handleMoveToBottom = async (id: string) => {
    try {
      const response = await fetch(`/api/navigation/${id}/move-to-bottom`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to move')

      mutate()
      toast({
        title: "成功",
        description: "移动成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "移动失败",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    try {
      const response = await fetch('/api/navigation/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceIndex,
          destinationIndex,
          itemId: result.draggableId
        })
      })

      if (!response.ok) throw new Error('Failed to reorder')

      mutate()
    } catch (error) {
      toast({
        title: "错误",
        description: "排序失败",
        variant: "destructive"
      })
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-[300px]">
          <Input
            placeholder="搜索分类..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加分类
        </Button>
      </div>
      <div className="space-y-4">
        {error ? (
          <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">加载失败</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                获取导航数据时发生错误，请稍后重试。
              </p>
              <Button
                variant="outline"
                onClick={() => mutate()}
              >
                重试
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">暂无分类</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {searchQuery ? "没有找到匹配的分类。" : "还没有添加任何分类，点击上方的添加按钮开始创建。"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  清除搜索
                </Button>
              )}
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="navigation-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {filteredItems.map((item, index) => (
                    <NavigationCard
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={mutate}
                      showMoveToTop={index > 0}
                      showMoveToBottom={index < filteredItems.length - 1}
                      onMoveToTop={() => handleMoveToTop(item.id)}
                      onMoveToBottom={() => handleMoveToBottom(item.id)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加分类</DialogTitle>
          </DialogHeader>
          <AddCategoryForm
            onSubmit={handleAdd}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}