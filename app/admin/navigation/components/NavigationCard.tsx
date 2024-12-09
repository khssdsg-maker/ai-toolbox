'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription, 
} from "@/registry/new-york/ui/dialog"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { EditNavigationForm } from './EditNavigationForm'
import { Draggable } from "@hello-pangea/dnd"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/registry/new-york/ui/tooltip"
import { NavigationItem } from '@/types/navigation'
import { navigationIcons, type IconType } from '@/lib/icons'
import { 
  Folder, 
  FolderOpen, 
  List, 
  Image, 
  Pencil, 
  Trash, 
  ChevronsUp, 
  ChevronsDown 
} from 'lucide-react'

interface NavigationCardProps {
  item: NavigationItem
  index: number
  onUpdate: () => void
  onMoveToTop?: () => void
  onMoveToBottom?: () => void
  showMoveToTop?: boolean
  showMoveToBottom?: boolean
}

export function NavigationCard({ 
  item, 
  index,
  onUpdate,
  onMoveToTop,
  onMoveToBottom,
  showMoveToTop,
  showMoveToBottom
}: NavigationCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const Icon = item.icon && navigationIcons[item.icon as IconType] ? navigationIcons[item.icon as IconType] : navigationIcons.Folder

  const handleEdit = async (values: { title: string; description: string; icon: string }) => {
    try {
      const response = await fetch(`/api/navigation/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          title: values.title,
          description: values.description,
          icon: values.icon
        })
      })

      if (!response.ok) throw new Error('Failed to save')

      setIsEditDialogOpen(false)
      onUpdate()
      toast({
        title: "成功",
        description: "保存成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive"
      })
    }
  }

  const deleteItem = async () => {
    try {
      const response = await fetch(`/api/navigation/${item.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')

      setIsDeleteDialogOpen(false)
      onUpdate()
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

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors ${
            snapshot.isDragging ? 'bg-gray-50' : ''
          }`}
        >
          <div className="flex items-center space-x-4">
            <Icon className="h-6 w-6 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/navigation/${item.id}/categories`)}
                    className="h-8 w-8"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>分类管理</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/admin/navigation/${item.id}/items`)}
                    className="h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>子项目</p>
                </TooltipContent>
              </Tooltip>
              {showMoveToTop && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onMoveToTop}
                      className="h-8 w-8"
                    >
                      <ChevronsUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>置顶</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {showMoveToBottom && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onMoveToBottom}
                      className="h-8 w-8"
                    >
                      <ChevronsDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>置底</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>编辑</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 w-8"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>删除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑导航</DialogTitle>
              </DialogHeader>
              <EditNavigationForm item={item} onSubmit={handleEdit} />
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  确定要删除这个导航吗？此操作无法撤消，所有相关的分类和子项目都将被删除。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={deleteItem}>
                  删除
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  )
}