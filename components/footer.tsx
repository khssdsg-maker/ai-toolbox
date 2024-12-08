import Link from 'next/link'
import { Icons } from '@/components/icons'
import type { SiteConfig } from '@/types/site'

interface FooterProps {
  siteInfo: SiteConfig
}

export function Footer({ siteInfo }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {currentYear} {siteInfo.basic.title}. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted p-2 text-muted-foreground hover:bg-muted hover:text-accent-foreground"
          >
            <Icons.github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
