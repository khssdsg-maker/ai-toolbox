'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/registry/new-york/ui/form"
import { NavigationSubItem } from "@/types/navigation"
import { Icons } from "@/components/icons"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Switch } from "@/registry/new-york/ui/switch"
import { IconUploader } from './IconUploader'

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "网站标题至少需要2个字符" }),
  href: z.string().url({ message: "请输入有效的网站链接" }),
  icon: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
})

interface AddItemFormProps {
  onSubmit: (values: NavigationSubItem) => Promise<void>
  onCancel: () => void
  defaultValues?: NavigationSubItem
}

export function AddItemForm({ onSubmit, onCancel, defaultValues }: AddItemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      id: String(Date.now()),
      title: "",
      href: "",
      icon: "",
      description: "",
      enabled: true,
    }
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        try {
          const values: NavigationSubItem = {
            id: data.id || await crypto.randomUUID(),
            title: data.title,
            href: data.href,
            description: data.description,
            icon: data.icon,
            enabled: data.enabled
          }
          await onSubmit(values)
        } catch (error) {
          console.error('保存失败:', error)
        }
      })} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站标题</FormLabel>
              <FormControl>
                <Input placeholder="输入网站标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="href"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站链接</FormLabel>
              <FormControl>
                <Input 
                  placeholder="输入网站链接" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <IconUploader 
          onChange={(icon) => form.setValue('icon', icon)}
          value={form.watch('icon')}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站描述</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="输入网站描述" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  启用状态
                </FormLabel>
                <FormDescription>
                  设置该导航项是否启用
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        </div>
      </form>
    </Form>
  )
}