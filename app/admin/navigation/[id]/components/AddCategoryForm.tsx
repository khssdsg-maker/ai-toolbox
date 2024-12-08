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
} from "@/registry/new-york/ui/form"

const formSchema = z.object({
  title: z.string().min(2, { message: "标题至少需要2个字符" })
})

interface AddCategoryFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
}

export function AddCategoryForm({ onSubmit }: AddCategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ""
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
              <FormLabel>分类名称</FormLabel>
              <FormControl>
                <Input placeholder="输入分类名称" {...field} />
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