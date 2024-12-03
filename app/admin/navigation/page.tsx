'use client'

import * as React from "react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot
} from '@hello-pangea/dnd'
import { NavigationItem } from '@/types/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { IconPicker } from '@/components/ui/icon-picker'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { icons } from '@/components/ui/icon-picker'

export default function NavigationManagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchNavigationItems()
  }, [])

  const fetchNavigationItems = async () => {
    try {
      const response = await fetch('/api/navigation')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      if (Array.isArray(data)) {
        setNavigationItems(data)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '加载导航数据失败',
        variant: 'destructive'
      })
      setNavigationItems([])
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(navigationItems),
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      toast({
        title: '成功',
        description: '导数据已保存',
      })
    } catch (error) {
      toast({
        title: '错误',
        description: '保存导航数据失败',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = () => {
    setNavigationItems([
      ...navigationItems,
      {
        id: Date.now().toString(),
        title: '新分类',
        icon: 'linecons-star',
        subCategories: [],
        items: []
      }
    ])
  }

  const addSubCategory = (categoryId: string) => {
    setNavigationItems(navigationItems.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subCategories: [
            ...(category.subCategories || []),
            {
              id: Date.now().toString(),
              title: '新子分类',
              items: []
            }
          ]
        }
      }
      return category
    }))
  }

  const deleteCategory = (categoryId: string) => {
    setNavigationItems(navigationItems.filter(item => item.id !== categoryId))
  }

  const deleteSubItem = (categoryId: string, index: number) => {
    setNavigationItems(navigationItems.map(category => {
      if (category.id === categoryId && category.items) {
        return {
          ...category,
          items: category.items.filter((_, i) => i !== index)
        }
      }
      return category
    }))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(navigationItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setNavigationItems(items)
  }

  const getSubCategoriesCount = (category: NavigationItem) => {
    return category.subCategories?.length || 0
  }

  const getItemsCount = (category: NavigationItem) => {
    const mainItems = category.items?.length || 0
    const subItems = category.subCategories?.reduce((sum, subCategory) => {
      return sum + (subCategory.items?.length || 0)
    }, 0) || 0
    
    return mainItems + subItems
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">导航分类管理</h3>
          <p className="text-sm text-muted-foreground">
            管理网站的导航菜单分类
          </p>
        </div>
        <div className="space-x-2">
          <Button
            onClick={addCategory}
            variant="outline"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            添加分类
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Icons.save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">排序</TableHead>
                      <TableHead>分类名称</TableHead>
                      <TableHead>图标</TableHead>
                      <TableHead>子分类数</TableHead>
                      <TableHead>子项目数</TableHead>
                      <TableHead className="text-right w-[280px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {navigationItems.map((category, index) => (
                      <Draggable
                        key={category.id}
                        draggableId={category.id}
                        index={index}
                      >
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
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
                            <TableCell>
                              {editingId === category.id ? (
                                <Input
                                  value={category.title}
                                  onChange={(e) => {
                                    const newItems = [...navigationItems]
                                    newItems[index].title = e.target.value
                                    setNavigationItems(newItems)
                                  }}
                                  className="max-w-[200px]"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm">
                                  {category.title}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingId === category.id ? (
                                <IconPicker
                                  value={category.icon}
                                  onChange={(value) => {
                                    const newItems = [...navigationItems]
                                    newItems[index].icon = value
                                    setNavigationItems(newItems)
                                  }}
                                />
                              ) : (
                                <span className="text-sm flex items-center gap-2">
                                  <i className={category.icon} />
                                  {icons.find((icon: { value: string }) => icon.value === category.icon)?.label ?? category.icon}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {getSubCategoriesCount(category)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {getItemsCount(category)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                {editingId === category.id ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingId(null)
                                        handleSave()
                                      }}
                                      className="text-green-500 hover:text-green-600"
                                    >
                                      <Icons.check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingId(null)
                                        fetchNavigationItems()
                                      }}
                                      className="text-gray-500 hover:text-gray-600"
                                    >
                                      <Icons.close className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingId(category.id)}
                                    className="text-blue-500 hover:text-blue-600"
                                  >
                                    <Icons.edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="text-yellow-500 hover:text-yellow-600"
                                >
                                  <Link href={`/admin/navigation/${category.id}/categories`}>
                                    <Icons.folder className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="text-purple-500 hover:text-purple-600"
                                >
                                  <Link href={`/admin/navigation/${category.id}/items`}>
                                    <Icons.list className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCategory(category.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Icons.trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
} 