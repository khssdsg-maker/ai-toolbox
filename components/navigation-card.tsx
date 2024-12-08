import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/registry/new-york/ui/card'
import { Icons } from '@/components/icons'
import type { NavigationSubItem } from '@/types/navigation'

interface NavigationCardProps {
  item: NavigationSubItem
}

export function NavigationCard({ item }: NavigationCardProps) {
  const isExternalIcon = item.icon?.startsWith('http')
  const isLocalIcon = item.icon && !isExternalIcon

  // Ensure local icons start with a forward slash
  const iconPath = isLocalIcon && item.icon
    ? item.icon.startsWith('/') 
      ? item.icon 
      : `/${item.icon}`
    : item.icon || '/placeholder-icon.png'

  return (
    <Card className="overflow-hidden">
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
              {isExternalIcon || isLocalIcon ? (
                <Image
                  src={iconPath}
                  alt={item.title}
                  width={40}
                  height={40}
                  className="h-6 w-6"
                />
              ) : (
                <Icons.folderOpen className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base">{item.title}</CardTitle>
              {item.description && (
                <CardDescription className="line-clamp-1">
                  {item.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      </Link>
    </Card>
  )
}
