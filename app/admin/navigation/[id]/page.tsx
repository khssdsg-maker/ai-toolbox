'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem, NavigationSubItem } from '@/types/navigation'

export default function NavigationItemPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<NavigationItem | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchCategory()
    }
  }, [params.id])

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
    if (!category) return
    setCategory({
      ...category,
      items: [
        ...(category.items || []).map((item: Partial<NavigationSubItem>) => ({
          title: item.title || '',
          titleEn: item.titleEn || '',
          description: item.description || '',
          descriptionEn: item.descriptionEn || '',
          icon: item.icon || 'linecons-link',
          href: item.href || '#'
        })),
        {
          title: '新项目',
          titleEn: 'New Item',
          description: '项目描述',
          descriptionEn: 'Item description',
          icon: 'linecons-link',
          href: '#'
        }
      ]
    })
  }

  const deleteItem = (index: number) => {
    if (!category || !category.items) return
    const newItems = [...category.items]
    newItems.splice(index, 1)
    setCategory({
      ...category,
      items: newItems
    })
  }

  if (!category) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">子项目管理 - {category.title}</h3>
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

      <Card>
        <CardHeader>
          <CardTitle>子项目列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {category.items?.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2"
            >
              <Input
                value={item.title}
                onChange={(e) => {
                  const newItems = [...(category.items || [])]
                  newItems[index] = {
                    ...newItems[index],
                    title: e.target.value
                  }
                  setCategory({
                    ...category,
                    items: newItems
                  })
                }}
                placeholder="标题"
              />
              <Input
                value={item.href}
                onChange={(e) => {
                  const newItems = [...(category.items || [])]
                  newItems[index] = {
                    ...newItems[index],
                    href: e.target.value
                  }
                  setCategory({
                    ...category,
                    items: newItems
                  })
                }}
                placeholder="链接"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteItem(index)}
              >
                <Icons.trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 