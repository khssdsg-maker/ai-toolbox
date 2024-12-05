"use client"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Input } from "@/components/ui/input"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        className={cn(
          "pl-10 bg-muted/50 border-muted-foreground/20 hover:border-muted-foreground/30 focus:border-muted-foreground/50",
          className
        )}
      />
    </div>
  )
} 