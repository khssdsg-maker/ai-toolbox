import Image from 'next/image'
import Link from 'next/link'
import { ResourceItem } from '../types/navigation'

interface ResourceCardProps extends ResourceItem {}

export default function ResourceCard({ title, description, icon, url }: ResourceCardProps) {
  return (
    <Link 
      href={url}
      target="_blank"
      rel="noopener noreferrer" 
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="card-content">
        <Image
          src={icon}
          alt={title}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  )
} 