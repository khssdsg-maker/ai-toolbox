'use client'

export const runtime = 'edge'

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york/ui/card"
import { Input } from "@/registry/new-york/ui/input"
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs"
import { Icons } from "@/components/icons"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"
import { ResourceMetadata } from "@/types/resource-metadata" // Ensure this path is correct
import { Toaster } from "@/registry/new-york/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/registry/new-york/ui/dialog"
import { ResourceService } from "@/services/ResourceService"; // Adjust the path based on your project structure

const formSchema = z.object({
  resource: z.object({
    path: z.string().url({
      message: "请输入有效的URL地址",
    }),
    image: z.instanceof(File).refine(file => {
      if (!file) return false; // Check if file is provided
      return file.size <= 5 * 1024 * 1024; // Check file size
    }, {
      message: "文件大小不能超过 5MB",
    }),
  }),
})

// 假设 ResourceMetadataItem 是 metadata 中每个项的类型
interface ResourceMetadataItem {
    hash: string;
    path: string; // 根据实际结构添加其他属性
}

// Rename the local declaration
interface LocalResourceMetadata {
    id: string;
    title: string;
    items: Array<{
        title: string;
        description: string;
        icon: string;
        url: string;
    }>;
}

export default function ResourceManagement() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resource: {
        path: "",
        image: undefined,
      },
    },
  })

  const [resources, setResources] = useState<LocalResourceMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [uploadProgress, setUploadProgress] = useState(0); // State to track upload progress

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resource');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        if (data.metadata && Array.isArray(data.metadata)) {
          const transformedResources: LocalResourceMetadata[] = data.metadata.map((item: ResourceMetadataItem, index: number) => ({
            id: item.hash,
            title: `Resource ${index + 1}`,
            items: [{
              title: item.path,
              description: '',
              icon: '',
              url: item.path
            }]
          }));
          setResources(transformedResources);
        } else {
          throw new Error('Metadata is not available or is not an array');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchResources();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const resourceService = new ResourceService();
      await resourceService.addResource({ path: values.resource.path }); // Adjust based on your service method
      toast({
        title: "成功",
        description: "资源已添加",
      });
      setIsDialogOpen(false); // Close the dialog after successful submission
      form.reset(); // Reset the form
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "错误",
          description: error.message || "添加资源失败",
          variant: "destructive",
        });
      } else {
        toast({
          title: "错误",
          description: "添加资源失败",
          variant: "destructive",
        });
      }
    }
  }

  const handleImageChange = async (file: File) => {
    try {
      const base64Image = await toBase64(file); // Convert file to Base64
      const response = await uploadImageWithProgress(base64Image); // Upload with progress tracking
     
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "错误",
          description: error.message || "上传图片失败",
          variant: "destructive",
        });
      } else {
        toast({
          title: "错误",
          description: "上传图片失败",
          variant: "destructive",
        });
      }
    }
  };

  const uploadImageWithProgress = (base64Image: string) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/resource", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete); // Update progress state
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));

      // Send the request with the Base64 image
      xhr.send(JSON.stringify({ image: base64Image }));
    });
  };

  // Helper function to convert file to Base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string); // Return Base64 string
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "成功",
        description: "链接已复制到剪贴板",
      });
    }).catch((error) => {
      toast({
        title: "错误",
        description: "复制链接失败",
        variant: "destructive",
      });
    });
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">资源管理</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="mb-4">
          <Icons.plus className="mr-2 h-4 w-4" />
          添加资源
        </Button>
        <Tabs defaultValue="resource" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resource">资源管理</TabsTrigger>
          </TabsList>
          <TabsContent value="resource">
            <Card>
              <CardHeader>
                <CardTitle>现有资源</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-500">{error}</div>}
                {resources.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border-b">图片</th>
                          <th className="py-2 px-4 border-b">路径</th>
                          <th className="py-2 px-4 border-b">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map((resource, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                  
                            <td className="py-2 px-4 border-b">
                              <a href={resource.items[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {resource.items[0].url}
                              </a>
                            </td>
                            <td className="py-2 px-4 border-b">
                              <Button 
                                variant="outline" 
                                onClick={() => copyToClipboard(resource.items[0].url)}
                                className="text-sm"
                              >
                                复制链接
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500">没有可用的资源。</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for adding resources */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加资源</DialogTitle>
            <DialogDescription>
              请填写以下信息以添加新资源。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="resource.path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>资源路径</FormLabel>
                    <FormControl>
                      <Input placeholder="输入资源路径" {...field} />
                    </FormControl>
                    <FormDescription>
                      请输入资源的有效URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resource.image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上传图片</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const files = e.target.files; // Get the files
                          if (files && files.length > 0) { // Check if files is not null and has at least one file
                            const file = files[0];
                            handleImageChange(file); // Upload image immediately
                          }
                        }} 
                      />
                    </FormControl>
                    <FormDescription>
                      请选择要上传的图片（最大 5MB）
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  添加资源
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Toaster />

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </>
  )
} 