'use client'

import { useState } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Icons } from "@/components/icons"
import { NavigationItem } from '@/types/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card"
import Link from 'next/link'

interface NavigationCardProps {
  item: NavigationItem
  onUpdate: () => void
}

export function NavigationCard({ item, onUpdate }: NavigationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <i className={item.icon}></i>
          {item.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/navigation/${item.id}/categories`}>
              <Icons.folder className="mr-2 h-4 w-4" />
              分类管理 ({item.subCategories?.length || 0})
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/navigation/${item.id}/items`}>
              <Icons.list className="mr-2 h-4 w-4" />
              子项目 ({item.items?.length || 0})
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            <Icons.edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {}} className="text-red-500">
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
} 