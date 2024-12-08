'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { Textarea } from "@/registry/new-york/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"

const formSchema = z.object({
  title: z.string().min(2, { message: "标题至少需要2个字符" }),
  titleEn: z.string().min(2, { message: "英文标题至少需要2个字符" }),
  description: z.string().min(10, { message: "描述至少需要10个字符" }),
  descriptionEn: z.string().min(10, { message: "英文描述至少需要10个字符" }),
  icon: z.string().min(1, { message: "请输入图标" }),
  href: z.string().min(1, { message: "请输入链接" })
})

interface AddItemFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  defaultValues?: Partial<z.infer<typeof formSchema>>
}

export function AddItemForm({ onSubmit, defaultValues }: AddItemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      titleEn: "",
      description: "",
      descriptionEn: "",
      icon: "",
      href: ""
    }
  })

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
                <Input placeholder="输入标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="titleEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>英文标题</FormLabel>
              <FormControl>
                <Input placeholder="输入英文标题" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描���</FormLabel>
              <FormControl>
                <Textarea placeholder="输入描述" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descriptionEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>英文描述</FormLabel>
              <FormControl>
                <Textarea placeholder="输入英文描述" {...field} />
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
              <FormLabel>图标</FormLabel>
              <FormControl>
                <Input placeholder="输入图标URL或类名" {...field} />
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
              <FormLabel>链接</FormLabel>
              <FormControl>
                <Input placeholder="输入链接地址" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">保存</Button>
        </div>
      </form>
    </Form>
  )
} 