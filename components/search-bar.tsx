import { useState } from 'react'
import { Input } from '@/registry/new-york/ui/input'
import { Icons } from '@/components/icons'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative w-64">
      <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="搜索导航..."
        value={query}
        onChange={handleSearch}
        className="w-full pl-9 py-1.5 text-sm"
      />
    </div>
  )
}
