'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/registry/new-york/ui/form"
import { Input } from "@/registry/new-york/ui/input"
import { IconSelector } from "./IconSelector"

const formSchema = z.object({
  title: z.string().min(1, "请输入分类名称"),
  description: z.string().optional(),
  icon: z.string().min(1, "请选择图标")
})

type FormValues = z.infer<typeof formSchema>

interface AddCategoryFormProps {
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  defaultValues?: Partial<FormValues>
}

export function AddCategoryForm({ 
  onSubmit, 
  onCancel, 
  defaultValues: initialDefaultValues 
}: AddCategoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "Folder",
      ...initialDefaultValues
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
                <Input placeholder="输入分类名称..." {...field} />
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
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Input placeholder="输入描述..." {...field} />
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
                <IconSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            取消
          </Button>
          <Button type="submit">
            {initialDefaultValues?.title ? '更新' : '创建'}
          </Button>
        </div>
      </form>
    </Form>
  )
}