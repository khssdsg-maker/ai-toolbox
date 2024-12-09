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
          <div className="flex items-start gap-4">
            {item.icon && (
              <div className="flex-shrink-0 w-11 h-11">
                <img
                  src={item.icon}
                  alt={`${item.title} icon`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
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
