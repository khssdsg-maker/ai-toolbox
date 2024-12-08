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

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "标题至少需要2个字符" }),
  href: z.string().url({ message: "请输入有效的URL" }),
  description: z.string().optional(),
  icon: z.string().optional(),
})

interface AddItemFormProps {
  onSubmit: (values: NavigationSubItem) => Promise<void>
  defaultValues?: NavigationSubItem
}

export function AddItemForm({ onSubmit, defaultValues }: AddItemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      id: String(Date.now()),
      title: "",
      href: "",
      description: "",
      icon: "",
    }
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="输入项目标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站图标</FormLabel>
              <FormControl>
                <Input placeholder="输入网站图标URL" {...field} />
              </FormControl>
              <FormDescription>
                支持 URL 或 Base64 格式的图标
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Input placeholder="输入项目描述" {...field} />
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
                <Input placeholder="输入项目链接" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : defaultValues ? "更新" : "添加"}
        </Button>
      </form>
    </Form>
  )
}