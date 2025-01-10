import { useState, useCallback } from 'react'
import { Input } from '@/registry/new-york/ui/input'
import { Icons } from '@/components/icons'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/registry/new-york/ui/command'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  navigationData: NavigationData
  onSearch: (query: string) => void
  searchResults: Array<{
    category: NavigationItem
    items: NavigationItem[]
    subCategories: Array<{
      title: string
      items: NavigationItem[]
    }>
  }>
  searchQuery: string
}

export function SearchBar({ navigationData, onSearch, searchResults, searchQuery }: SearchBarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> : part
    )
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="搜索导航..." 
          value={searchQuery}
          onValueChange={onSearch}
        />
        <CommandList className="max-h-[400px] overflow-y-auto">
          {searchQuery && searchResults.length === 0 && (
            <CommandEmpty>未找到相关导航</CommandEmpty>
          )}
          {searchResults.map((result) => (
            <CommandGroup key={result.category.id} heading={result.category.title}>
              {result.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => router.push(item.href)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex-shrink-0 w-8 h-8">
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt={`${item.title} icon`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <span className="text-base font-medium">
                      {highlightText(item.title)}
                    </span>
                    {item.description && (
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {highlightText(item.description)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
              {result.subCategories.map((sub) => (
                <CommandGroup key={sub.title} heading={`${result.category.title} / ${sub.title}`}>
                  {sub.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => router.push(item.href)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8">
                        {item.icon && (
                          <img
                            src={item.icon}
                            alt={`${item.title} icon`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 gap-1">
                        <span className="text-base font-medium">
                          {highlightText(item.title)}
                        </span>
                        {item.description && (
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {highlightText(item.description)}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>

      <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  )
}
