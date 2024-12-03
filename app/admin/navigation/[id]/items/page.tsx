'use client'

export const runtime = 'edge'

import * as React from "react"
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem, NavigationSubCategory, NavigationSubItem } from '@/types/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ItemsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<NavigationItem | null>(null)
  const [items, setItems] = useState<NavigationSubItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  // 获取子分类ID（如果有）
  const subCategoryId = searchParams.get('subId')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCategory(data)

      if (subCategoryId) {
        // 如果是子分类，找到对应的子分类数据
        const subCategory = data.subCategories?.find((s: NavigationSubCategory) => s.id === subCategoryId)
        if (subCategory) {
          // 确保所有项目都有完整的字段
          const completeItems = (subCategory.items || []).map((item: Partial<NavigationSubItem>) => ({
            title: item.title || '',
            titleEn: item.titleEn || '',
            description: item.description || '',
            descriptionEn: item.descriptionEn || '',
            icon: item.icon || 'linecons-link',
            href: item.href || '#'
          }))
          setItems(completeItems)
        } else {
          throw new Error('Subcategory not found')
        }
      } else {
        // 如果是父分类，直接使用其子项目
        const completeItems = (data.items || []).map((item: Partial<NavigationSubItem>) => ({
          title: item.title || '',
          titleEn: item.titleEn || '',
          description: item.description || '',
          descriptionEn: item.descriptionEn || '',
          icon: item.icon || 'linecons-link',
          href: item.href || '#'
        }))
        setItems(completeItems)
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '加载数据失败',
        variant: 'destructive'
      })
      router.back()
    }
  }

  const handleSave = async () => {
    if (!category) return
    setIsLoading(true)
    try {
      let updatedCategory = { ...category }
      
      if (subCategoryId) {
        // 更新子分类的子项目
        updatedCategory.subCategories = category.subCategories?.map(sub => {
          if (sub.id === subCategoryId) {
            return {
              ...sub,
              items: items as NavigationSubItem[]
            }
          }
          return sub
        })
      } else {
        // 更新父分类的子项目
        updatedCategory.items = items as NavigationSubItem[]
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      })
      
      if (!response.ok) throw new Error('Failed to save')
      
      toast({
        title: '成功',
        description: '子项目数据已保存',
      })
    } catch (error) {
      toast({
        title: '错误',
        description: '保存子项目数据失败',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    const newItem: NavigationSubItem = {
      title: '新项目',
      titleEn: 'New Item',
      description: '项目描述',
      descriptionEn: 'Item description',
      icon: 'linecons-link',
      href: '#'
    }
    setItems([...items, newItem])
  }

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
    } catch {
      return ''
    }
  }

  const detectIcon = async (index: number) => {
    const item = items[index]
    if (!item.href) {
      toast({
        title: '错误',
        description: '请先填写链接地址',
        variant: 'destructive'
      })
      return
    }

    try {
      // 首先尝试获取 favicon.ico
      const faviconUrl = getFaviconUrl(item.href)
      const newItems = [...items]
      newItems[index].icon = faviconUrl
      setItems(newItems)
      
      toast({
        title: '成功',
        description: '已获取网站图标',
      })
    } catch (error) {
      toast({
        title: '错误',
        description: '获取网站图标失败',
        variant: 'destructive'
      })
    }
  }

  if (!category) return null

  const title = subCategoryId 
    ? `${category.title} - ${category.subCategories?.find(s => s.id === subCategoryId)?.title} - 子项目管理`
    : `${category.title} - 子项目管理`

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            管理导航菜单的子项目
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
            onClick={addItem}
            variant="outline"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            添加项目
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目名称</TableHead>
              <TableHead>英文名称</TableHead>
              <TableHead>图标</TableHead>
              <TableHead>中文描述</TableHead>
              <TableHead>英文描述</TableHead>
              <TableHead>链接地址</TableHead>
              <TableHead className="text-right w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Icons.empty className="h-8 w-8 mb-2" />
                    <span>暂无子项目</span>
                    <Button
                      variant="link"
                      onClick={addItem}
                      className="mt-2"
                    >
                      点击添加
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {editingId === index ? (
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].title = e.target.value
                          setItems(newItems)
                        }}
                        className="max-w-[200px]"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm">
                        {item.title}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === index ? (
                      <Input
                        value={item.titleEn}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].titleEn = e.target.value
                          setItems(newItems)
                        }}
                        className="max-w-[200px]"
                      />
                    ) : (
                      <span className="text-sm">
                        {item.titleEn}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === index ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = [...items]
                            newItems[index].icon = e.target.value
                            setItems(newItems)
                          }}
                          className="max-w-[150px]"
                          placeholder="linecons-xxx"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => detectIcon(index)}
                          className="text-blue-500 hover:text-blue-600"
                          title="从链接获取图标"
                        >
                          <Icons.scan className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm flex items-center gap-2">
                        {item.icon.startsWith('http') ? (
                          <img 
                            src={item.icon} 
                            alt="icon" 
                            className="w-4 h-4"
                            onError={(e) => {
                              // 如果图片加载失败，显示默认图标
                              const target = e.target as HTMLImageElement
                              target.src = '/images/default-favicon.png'
                            }}
                          />
                        ) : (
                          <i className={item.icon} />
                        )}
                        <span className="text-muted-foreground text-xs">
                          {item.icon}
                        </span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === index ? (
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].description = e.target.value
                          setItems(newItems)
                        }}
                        className="max-w-[200px]"
                      />
                    ) : (
                      <span className="text-sm">
                        {item.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === index ? (
                      <Input
                        value={item.descriptionEn}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].descriptionEn = e.target.value
                          setItems(newItems)
                        }}
                        className="max-w-[200px]"
                      />
                    ) : (
                      <span className="text-sm">
                        {item.descriptionEn}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === index ? (
                      <Input
                        value={item.href}
                        onChange={(e) => {
                          const newItems = [...items]
                          newItems[index].href = e.target.value
                          setItems(newItems)
                        }}
                        className="max-w-[300px]"
                      />
                    ) : (
                      <span className="text-sm">
                        {item.href}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {editingId === index ? (
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
                              fetchData()
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
                          onClick={() => setEditingId(index)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 