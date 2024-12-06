'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/registry/new-york/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { useToast } from '@/registry/new-york/hooks/use-toast'
import { Icons } from '@/components/icons'
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/registry/new-york/ui/dropdown-menu"
import { 
  MoreHorizontal,
  FolderTree,
  Edit,
  Trash2,
  ChevronLeft,
  Plus,
  Search,
  Inbox
} from "lucide-react"

export default function NavigationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [searchQuery, items])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/navigation/${params.id}/items`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(data)
      setFilteredItems(data)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">导航管理</h3>
          <p className="text-sm text-muted-foreground">
            管理网站的导航菜单
          </p>
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button
            onClick={() => {/* 添加处理函数 */}}
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加导航
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <SearchInput
          placeholder="搜索导航..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
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
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">排序</TableHead>
                <TableHead>导航名称</TableHead>
                <TableHead>分类数</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {searchQuery ? (
                      <div className="text-muted-foreground">
                        <Search className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">没有找到匹配的导航</p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <Inbox className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">暂无导航数据</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.categories?.length || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">打开菜单</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/navigation/${item.id}/categories`)}
                          >
                            <FolderTree className="mr-2 h-4 w-4" />
                            分类管理
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {/* 编辑处理 */}}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            编辑导航
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {/* 删除处理 */}}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除导航
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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