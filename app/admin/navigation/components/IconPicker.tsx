'use client'

import { useState } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Icons } from "@/components/icons"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/new-york/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// 按分类组织图标
const iconGroups = [
  {
    label: '常用',
    icons: [
      { name: 'home', icon: Icons.home },
      { name: 'folder', icon: Icons.folder },
      { name: 'file', icon: Icons.file },
      { name: 'list', icon: Icons.list },
      { name: 'search', icon: Icons.search },
      { name: 'add', icon: Icons.add },
      { name: 'save', icon: Icons.save },
      { name: 'trash', icon: Icons.trash },
      { name: 'edit', icon: Icons.edit },
    ]
  },
  {
    label: '导航',
    icons: [
      { name: 'menu', icon: Icons.menu },
      { name: 'back', icon: Icons.back },
      { name: 'chevronLeft', icon: Icons.chevronLeft },
      { name: 'chevronRight', icon: Icons.chevronRight },
      { name: 'more', icon: Icons.more },
      { name: 'panelLeft', icon: Icons.panelLeft },
      { name: 'panelRight', icon: Icons.panelRight },
    ]
  },
  {
    label: '状态',
    icons: [
      { name: 'check', icon: Icons.check },
      { name: 'close', icon: Icons.close },
      { name: 'spinner', icon: Icons.spinner },
      { name: 'empty', icon: Icons.empty },
    ]
  },
  {
    label: '系统',
    icons: [
      { name: 'dashboard', icon: Icons.dashboard },
      { name: 'settings', icon: Icons.settings },
      { name: 'database', icon: Icons.database },
      { name: 'upload', icon: Icons.upload },
      { name: 'scan', icon: Icons.scan },
    ]
  },
  {
    label: '用户',
    icons: [
      { name: 'user', icon: Icons.user },
      { name: 'users', icon: Icons.users },
      { name: 'logout', icon: Icons.logout },
      { name: 'gitHub', icon: Icons.gitHub },
    ]
  },
  {
    label: '内容',
    icons: [
      { name: 'book', icon: Icons.book },
      { name: 'bookmark', icon: Icons.bookmark },
      { name: 'library', icon: Icons.library },
      { name: 'news', icon: Icons.news },
      { name: 'mail', icon: Icons.mail },
      { name: 'message', icon: Icons.message },
      { name: 'calendar', icon: Icons.calendar },
    ]
  }
]

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // 查找当前选中的图标
  const selectedIcon = iconGroups
    .flatMap(group => group.icons)
    .find(icon => icon.name === value)
  const Icon = selectedIcon?.icon || Icons.folder

  // 过滤图标
  const filteredGroups = search
    ? [{
        label: '搜索结果',
        icons: iconGroups
          .flatMap(group => group.icons)
          .filter(icon => 
            icon.name.toLowerCase().includes(search.toLowerCase())
          )
      }]
    : iconGroups

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{value || "选择图标"}</span>
          </div>
          <Icons.chevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[240px] p-0" 
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <Command>
          <CommandInput 
            placeholder="搜索图标..." 
            value={search}
            onValueChange={setSearch}
          />
          <div className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>未找到图标</CommandEmpty>
            {filteredGroups.map((group, index) => (
              <div key={group.label}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={group.label}>
                  {group.icons.map(icon => (
                    <CommandItem
                      key={icon.name}
                      value={icon.name}
                      onSelect={(currentValue) => {
                        onChange(currentValue)
                        setOpen(false)
                        setSearch("")
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {icon.icon && <icon.icon className="h-4 w-4" />}
                        {icon.name}
                      </div>
                      {value === icon.name && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
