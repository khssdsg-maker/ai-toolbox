interface ResourceCardProps {
  title: string
  description: string
  icon: string
  url: string
}

export default function ResourceCard({
  title,
  description,
  icon,
  url
}: ResourceCardProps) {
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-3">
        <i className={`${icon} text-xl text-blue-500`}></i>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </a>
  )
} 