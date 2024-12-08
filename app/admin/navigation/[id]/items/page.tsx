'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem, NavigationSubItem } from '@/types/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog"
import { AddItemForm } from '../components/AddItemForm'

interface EditingItem {
  index: number
  item: NavigationSubItem
}

export default function ItemsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [navigation, setNavigation] = useState<NavigationItem | null>(null)
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) {
      router.push('/admin/navigation')
      return
    }
    fetchNavigation()
  }, [params?.id, router])

  const fetchNavigation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/navigation/${params!.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setNavigation(data)
    } catch (error) {
      toast({
        title: "错误",
        description: "加载数据失败",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (values: NavigationSubItem) => {
    if (!navigation?.id) return

    try {
      const updatedNavigation: NavigationItem = {
        ...navigation,
        items: [...(navigation.items || []), values]
      }

      const response = await fetch(`/api/navigation/${params!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save')

      setNavigation(updatedNavigation)
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

  const handleEdit = (item: any) => {
    setEditingItem(item)
  }

  const handleDelete = async (index: number) => {
    if (!navigation?.id || !params?.id) return

    try {
      const updatedItems = [...navigation.items]
      updatedItems.splice(index, 1)

      const updatedNavigation: NavigationItem = {
        ...navigation,
        items: updatedItems
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to delete')

      setNavigation(updatedNavigation)
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

  const handleUpdate = async (values: NavigationSubItem) => {
    if (!navigation?.id || !params?.id || !editingItem) return

    try {
      const updatedItems = navigation.items.map((item, i) => {
        if (i === editingItem.index) {
          return values
        }
        return item
      })

      const updatedNavigation: NavigationItem = {
        ...navigation,
        items: updatedItems
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to update')

      setNavigation(updatedNavigation)
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

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (!navigation) {
    return <div>导航不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{navigation?.title} - 子项目管理</h2>
          <p className="text-muted-foreground">管理导航的子项目</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              添加子项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加子项目</DialogTitle>
            </DialogHeader>
            <AddItemForm onSubmit={addItem} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>英文标题</TableHead>
              <TableHead>链接</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {navigation?.items?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.titleEn}</TableCell>
                <TableCell>{item.href}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit({ index, item })}
                  >
                    <Icons.edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="text-red-500"
                  >
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑子项目</DialogTitle>
          </DialogHeader>
          <AddItemForm 
            onSubmit={handleUpdate}
            defaultValues={editingItem?.item}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}