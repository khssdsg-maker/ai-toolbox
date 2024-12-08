'use client'

import { useState } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { Label } from "@/registry/new-york/ui/label"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Icons } from "@/components/icons"
import { IconPicker } from "./IconPicker"
import { NavigationItem } from '@/types/navigation'

interface EditNavigationFormProps {
  item: NavigationItem
  onSubmit: (values: { title: string; description: string; icon: string }) => Promise<void>
}

export function EditNavigationForm({ item, onSubmit }: EditNavigationFormProps) {
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [icon, setIcon] = useState(item.icon || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        title,
        description,
        icon
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">图标</Label>
        <IconPicker
          value={icon}
          onChange={setIcon}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          保存
        </Button>
      </div>
    </form>
  )
}
