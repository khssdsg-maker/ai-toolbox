import Image from 'next/image'
import { NavigationSubItem } from '@/types/navigation'
import { cn } from '@/lib/utils'

interface NavigationCardProps {
  item: NavigationSubItem
  className?: string
}

export function NavigationCard({ item, className }: NavigationCardProps) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/10",
        className
      )}
    >
      {/* 图标 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {item.icon ? (
          <Image
            src={item.icon}
            alt={item.title}
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
          />
        ) : (
          <div className="h-5 w-5 bg-primary/20 rounded" />
        )}
      </div>

      {/* 内容 */}
      <div className="space-y-1">
        <div className="font-medium leading-none group-hover:text-primary">
          {item.title}
        </div>
        {item.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </div>
        )}
      </div>
    </a>
  )
}
