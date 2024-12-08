'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { IconPicker } from "@/components/ui/icon-picker"
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
  icon: z.string().min(1, { message: "请选择图标" })
})

interface AddNavigationFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
}

export function AddNavigationForm({ onSubmit }: AddNavigationFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      icon: ""
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
                <Input placeholder="输入导航标题" {...field} />
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
                <IconPicker {...field} />
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