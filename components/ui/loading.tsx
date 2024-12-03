import { ReloadIcon } from "@radix-ui/react-icons"

export function LoadingSpinner() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="flex items-center gap-2">
        <ReloadIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>
  )
} 