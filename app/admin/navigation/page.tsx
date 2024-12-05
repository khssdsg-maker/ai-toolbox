'use client'

import * as React from "react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { NavigationItem } from '@/types/navigation'
import { cn } from '@/lib/utils'
import { SearchInput } from "@/components/ui/search-input"

export default function NavigationManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [filteredItems, setFilteredItems] = useState<NavigationItem[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchNavigationItems()
  }, [])

  useEffect(() => {
    // 根据搜索词过滤导航项
    const filtered = navigationItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [searchQuery, navigationItems])

  const fetchNavigationItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/navigation')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setNavigationItems(data.navigationItems || [])
      setFilteredItems(data.navigationItems || [])
    } catch (error) {
      toast({
        title: '错误',
        description: '加载导航数据失败',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 加载状态的骨架屏组件
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="搜索导航..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {/* 添加导航的处理函数 */}}
            variant="outline"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            添加导航
          </Button>
          <Button
            onClick={() => {/* 保存处理函数 */}}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Icons.save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <DragDropContext onDragEnd={() => {}}>
          <Droppable droppableId="navigation">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">排序</TableHead>
                        <TableHead>导航名称</TableHead>
                        <TableHead>图标</TableHead>
                        <TableHead>子分类数</TableHead>
                        <TableHead>子项目数</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            {searchQuery ? (
                              <div className="text-muted-foreground">
                                <Icons.empty className="mx-auto h-12 w-12 opacity-50" />
                                <p className="mt-2">没有找到匹配的导航</p>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                <Icons.empty className="mx-auto h-12 w-12 opacity-50" />
                                <p className="mt-2">暂无导航数据</p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(snapshot.isDragging && "bg-muted")}
                              >
                                <TableCell>
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex items-center justify-center cursor-move"
                                  >
                                    <Icons.grip className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>
                                  <i className={item.icon} />
                                </TableCell>
                                <TableCell>
                                  {item.subCategories?.length || 0}
                                </TableCell>
                                <TableCell>{item.items?.length || 0}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {/* 编辑处理 */}}
                                  >
                                    <Icons.edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {/* 删除处理 */}}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Icons.trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
} 