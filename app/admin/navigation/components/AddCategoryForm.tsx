'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/registry/new-york/ui/form"
import { Input } from "@/registry/new-york/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select"
import { navigationIcons } from "@/lib/icons"

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  icon: z.string().min(1, "请选择图标")
})

interface AddCategoryFormProps {
  defaultValues?: {
    title: string
    icon: string
  }
  onSubmit: (values: z.infer<typeof formSchema>) => void
  onCancel: () => void
}

export function AddCategoryForm({ defaultValues, onSubmit, onCancel }: AddCategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
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
                <Input placeholder="输入分类标题" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择图标" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(navigationIcons).map(([key, Icon]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {key}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit">
            保存
          </Button>
        </div>
      </form>
    </Form>
  )
}