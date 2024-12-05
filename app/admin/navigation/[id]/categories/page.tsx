'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem } from '@/types/navigation'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CategoriesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // 根据搜索词过滤分类
    const filtered = categories.filter(category => 
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [searchQuery, categories])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/navigation/${params.id}/categories`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      toast({
        title: '错误',
        description: '加载分类数据失败',
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">导航分类管理</h3>
          <p className="text-sm text-muted-foreground">
            管理网站的导航菜单分类
          </p>
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            <Icons.back className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button
            onClick={() => {/* 添加分类的处理函数 */}}
            variant="outline"
          >
            <Icons.add className="mr-2 h-4 w-4" />
            添加分类
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索分类..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">排序</TableHead>
                <TableHead>分类名称</TableHead>
                <TableHead>子项目数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {searchQuery ? (
                      <div className="text-muted-foreground">
                        <Icons.search className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">没有找到匹配的分类</p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <Icons.empty className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">暂无分类数据</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{category.title}</TableCell>
                    <TableCell>{category.items?.length || 0}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 