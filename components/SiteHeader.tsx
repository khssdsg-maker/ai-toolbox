import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="logo-env">
      <div className="logo">
        <Link href="/">
          <Image 
            src="/assets/images/logo@2x.png"
            alt="Logo"
            width={160}
            height={64}
            className="logo-expanded"
          />
          <Image
            src="/assets/images/logo-collapsed@2x.png" 
            alt="Logo"
            width={48}
            height={48}
            className="logo-collapsed"
          />
        </Link>
      </div>
    </header>
  )
} 