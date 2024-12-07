import { cn } from "@/lib/utils"
import Image from "next/image"

interface ResourceCardProps {
  title: string
  description: string
  icon: string
  url: string
  className?: string
}

export default function ResourceCard({
  title,
  description,
  icon,
  url,
  className
}: ResourceCardProps) {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 flex items-center justify-center">
          <Image 
            src={icon} 
            alt={title}
            width={48}
            height={48}
            className="rounded-xl"
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 text-lg">{title}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
      </div>
    </a>
  )
} 