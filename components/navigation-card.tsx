import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/registry/new-york/ui/card'
import { Icons } from '@/components/icons'
import type { NavigationItem } from '@/types/navigation'

interface NavigationCardProps {
  item: NavigationItem
}

export function NavigationCard({ item }: NavigationCardProps) {
  const isExternalIcon = item.icon?.startsWith('http')
  const isLocalIcon = item.icon?.startsWith('/')

  return (
    <Card className="overflow-hidden">
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 shrink-0">
              {isExternalIcon || isLocalIcon ? (
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                  <Icons.placeholder className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-medium leading-none">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
