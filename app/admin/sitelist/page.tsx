'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { Input } from "@/registry/new-york/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/registry/new-york/ui/dialog"
import { da } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table"
import { Checkbox } from "@/registry/new-york/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york/ui/alert-dialog"

interface NavigationItem {
  id: string
  title: string
  href: string
  description?: string
  icon?: string
}

interface SubCategory {
  id: string
  title: string
  icon?: string
  items: NavigationItem[]
}

interface Category {
  id: string
  title: string
  icon?: string
  items: NavigationItem[]
  subCategories?: SubCategory[]
}

interface Site {
  id: string
  name: string
  url: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function SiteListPage() {
  console.log('Component rendering')

  const router = useRouter()
  const { toast } = useToast()
  const [sites, setSites] = useState<Site[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  

  useEffect(() => {
    console.log('useEffect triggered')
    fetchSites()
  }, [])

  const extractSites = (navigationItems: Category[]): Site[] => {
    let allSites: Site[] = [];
    
    navigationItems.forEach((category: Category) => {
      // Add sites from main category items
      if (category.items && Array.isArray(category.items)) {
        const sites: Site[] = category.items.map((item: NavigationItem): Site => ({
          id: item.id,
          name: item.title,
          url: item.href,
          description: item.description,
          createdAt: '', 
          updatedAt: '', 
        }));
        allSites = [...allSites, ...sites];
      }

      // Add sites from subcategories
      if (category.subCategories && Array.isArray(category.subCategories)) {
        category.subCategories.forEach((subCategory: SubCategory) => {
          if (subCategory.items && Array.isArray(subCategory.items)) {
            const subSites: Site[] = subCategory.items.map((item: NavigationItem): Site => ({
              id: item.id,
              name: item.title,
              url: item.href,
              description: item.description,
              createdAt: '', 
              updatedAt: '', 
            }));
            allSites = [...allSites, ...subSites];
          }
        });
      }
    });

    return allSites;
  };

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      console.log('Making API request');
      const response = await fetch('/api/navigation');
      console.log('API response received:', response.status);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('Received data:', data);
      
      // Extract all sites from the navigation structure
      const allSites = extractSites(data.navigationItems);
      console.log('Extracted sites:', allSites);
      setSites(allSites);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "错误",
        description: "获取数据失败",
        variant: "destructive"
      });
      setSites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAll = (checked: boolean | string) => {
    if (checked === true) {
      setSelectedSites(filteredSites.map(site => site.id))
    } else {
      setSelectedSites([])
    }
  }

  const handleSelectOne = (checked: boolean | string, siteId: string) => {
    if (checked === true) {
      setSelectedSites([...selectedSites, siteId])
    } else {
      setSelectedSites(selectedSites.filter(id => id !== siteId))
    }
  }

  const handleBatchDelete = async () => {
    try {
      // Add your API call here
      const response = await fetch('/api/sites/batch-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedSites }),
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast({
        title: "成功",
        description: "已删除选中的站点",
      })
      
      // Refresh the sites list
      fetchSites()
      setSelectedSites([])
    } catch (error) {
      toast({
        title: "错误",
        description: "删除失败",
        variant: "destructive"
      })
    }
    setShowDeleteDialog(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            站点管理
          </h2>
          <p className="text-sm text-muted-foreground">
            管理所有站点列表
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedSites.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="whitespace-nowrap"
            >
              <Icons.trash className="mr-2 h-4 w-4" />
              删除选中 ({selectedSites.length})
            </Button>
          )}
          <Button onClick={() => router.push('/admin/sitelist/new')}>
            <Icons.plus className="mr-2 h-4 w-4" />
            添加站点
          </Button>
        </div>
      </div>

      <div>
        <Input
          placeholder="搜索站点..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Icons.loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filteredSites.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      filteredSites.length > 0 &&
                      selectedSites.length === filteredSites.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>名称</TableHead>
                <TableHead>链接</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSites.includes(site.id)}
                      onCheckedChange={(checked) => handleSelectOne(checked, site.id)}
                      aria-label={`Select ${site.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>
                    <a 
                      href={site.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      {site.url}
                    </a>
                  </TableCell>
                  <TableCell>{site.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(site.url, '_blank')}
                        title="访问站点"
                      >
                        <Icons.globe className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.push(`/admin/sitelist/${site.id}`)}
                        title="编辑"
                      >
                        <Icons.pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {sites.length === 0 ? "暂无站点" : "未找到匹配的站点"}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedSites.length} 个站点吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 