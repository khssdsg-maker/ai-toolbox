'use client'

export const runtime = 'edge'

import * as React from "react"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem } from '@/types/navigation'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot
} from '@hello-pangea/dnd'
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SubCategoriesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<NavigationItem | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategory()
  }, [])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCategory(data)
    } catch (error) {
      toast({
        title: '错误',
        description: '加载分类数据失败',
        variant: 'destructive'
      })
    }
  }

  const handleSave = async () => {
    if (!category) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      toast({
        title: '成功',
        description: '子分类数据已保存',
      })
    } catch (error) {
      toast({
        title: '错误',
        description: '保存子分类数据失败',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSubCategory = () => {
    if (!category) return
    setCategory({
      ...category,
      subCategories: [
        ...(category.subCategories || []),
        {
          id: Date.now().toString(),
          title: '新子分类',
          items: []
        }
      ]
    })
  }

  const deleteSubCategory = (index: number) => {
    if (!category || !category.subCategories) return
    const newSubCategories = [...category.subCategories]
    newSubCategories.splice(index, 1)
    setCategory({
      ...category,
      subCategories: newSubCategories
    })
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !category?.subCategories) return

    const items = Array.from(category.subCategories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setCategory({
      ...category,
      subCategories: items
    })
  }

  

  if (!category) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">子分类管理 - {category.title}</h3>
          <p className="text-sm text-muted-foreground">
            管理导航菜单的子分类
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <Icons.back className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button
            onClick={addSubCategory}
            variant="outline"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            添加子分类
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
        <Droppable droppableId="subcategories">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">排序</TableHead>
                      <TableHead>子分类名称</TableHead>
                      <TableHead>子项目数</TableHead>
                      <TableHead className="text-right w-[200px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.subCategories?.map((subCategory, index) => (
                      <Draggable
                        key={subCategory.id}
                        draggableId={subCategory.id}
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
                              {editingId === subCategory.id ? (
                                <Input
                                  value={subCategory.title}
                                  onChange={(e) => {
                                    const newSubCategories = [...(category.subCategories || [])]
                                    newSubCategories[index].title = e.target.value
                                    setCategory({
                                      ...category,
                                      subCategories: newSubCategories
                                    })
                                  }}
                                  className="max-w-[200px]"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm">
                                  {subCategory.title}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">

                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                {editingId === subCategory.id ? (
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
                                        fetchCategory()
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
                                    onClick={() => setEditingId(subCategory.id)}
                                    className="text-blue-500 hover:text-blue-600"
                                  >
                                    <Icons.edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="text-purple-500 hover:text-purple-600"
                                >
                                  <Link href={`/admin/navigation/${category.id}/items?subId=${subCategory.id}`}>
                                    <Icons.list className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSubCategory(index)}
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