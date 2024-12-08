'use client'

import { useState } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { Label } from "@/registry/new-york/ui/label"
import { NavigationItem } from '@/types/navigation'
import { IconPicker } from './IconPicker'

interface EditNavigationFormProps {
  item: NavigationItem
  onSubmit: (values: { title: string; icon: string }) => Promise<void>
}

export function EditNavigationForm({ item, onSubmit }: EditNavigationFormProps) {
  const [title, setTitle] = useState(item.title)
  const [icon, setIcon] = useState(item.icon)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ title, icon })
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
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">图标</Label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "保存中..." : "保存"}
      </Button>
    </form>
  )
}
