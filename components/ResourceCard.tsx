import { cn } from "@/lib/utils"

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
      className={cn(
        "block p-4 bg-card text-card-foreground rounded-lg shadow hover:shadow-lg transition-shadow",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted">
          <img 
            src={icon} 
            alt={title}
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium leading-none">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </a>
  )
} 