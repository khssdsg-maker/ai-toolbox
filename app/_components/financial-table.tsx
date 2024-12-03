"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AutoRefreshToggle } from "@/components/auto-refresh-toggle"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { fetchFinancialData, type FinancialData } from '@/app/actions/fetch-financial-data'
import { formatNumber, formatPercentage, formatCurrency, formatDate } from '@/lib/utils'
import { CaretSortIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingSpinner } from "@/components/ui/loading"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const columns: ColumnDef<FinancialData>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <div className="whitespace-nowrap">代码</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="whitespace-nowrap">名称</div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="whitespace-nowrap"
      >
        价格
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "increase_rt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="whitespace-nowrap"
      >
        涨幅
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("increase_rt") as string
      const num = parseFloat(value)
      return (
        <div className={num >= 0 ? "text-green-600" : "text-red-600"}>
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "navDate",
    header: ({ column }) => (
      <div className="whitespace-nowrap">净值日期</div>
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue("navDate") as string
      if (!dateStr || dateStr === '-') return '-'
      
      try {
        const date = new Date(dateStr)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}-${day}`
      } catch {
        return dateStr
      }
    },
  },
  {
    accessorKey: "discount_rt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="whitespace-nowrap flex items-center relative group"
        >
          T-1溢价率
          <div className="absolute -right-3 -top-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center">
                *
              </span>
            </span>
          </div>
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const value = row.getValue("discount_rt") as string
      const num = parseFloat(value)
      return (
        <div className={num >= 0 ? "text-green-600" : "text-red-600"}>
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="whitespace-nowrap"
      >
        成交(万)
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("volume"),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="whitespace-nowrap"
      >
        场内份额(万份)
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("amount"),
  },
  {
    accessorKey: "index_nm",
    header: ({ column }) => (
      <div className="whitespace-nowrap">相关标的</div>
    ),
  },
  {
    accessorKey: "mt_fee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="whitespace-nowrap"
      >
        管托费
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("mt_fee") as string
      const tips = row.original.mt_fee_tips as string

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {value === '-' ? value : `${value}%`}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tips || '暂无说明'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "issuer_nm",
    header: ({ column }) => (
      <div className="whitespace-nowrap">基金公司</div>
    ),
    cell: ({ row }) => {
      const issuerName = row.getValue("issuer_nm") as string
      const issuerUrl = row.original.issuer_url as string
      
      return (
        <a
          href={issuerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {issuerName}
        </a>
      )
    },
  },
]

export default function FinancialTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const queryClient = useQueryClient()
  const [selectedTarget, setSelectedTarget] = React.useState<string>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['financialData'],
    queryFn: fetchFinancialData,
    refetchInterval: false,
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const uniqueTargets = React.useMemo(() => {
    if (!data) return []
    
    // 计算每个标的的出现次数
    const targetCounts = data.reduce((acc, item) => {
      const target = item.index_nm
      acc[target] = (acc[target] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // 按出现次数降序排列，只保留出现次数大于1的标的
    const multipleTargets = Object.entries(targetCounts)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => {
        // 首先按数量降序
        const countDiff = b[1] - a[1]
        // 如果数量相同，按名称升序
        if (countDiff === 0) {
          return a[0].localeCompare(b[0])
        }
        return countDiff
      })
      .map(([target]) => target)
    
    return multipleTargets
  }, [data])

  const filteredData = React.useMemo(() => {
    if (!data) return []
    if (selectedTarget === 'all') return data
    return data.filter(item => item.index_nm === selectedTarget)
  }, [data, selectedTarget])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="text-sm text-destructive">
        加载失败，请稍后重试
      </div>
    </div>
  )
  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索代码或名称..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("code")?.setFilterValue(event.target.value)
          }
          className="w-[200px]"
        />
        <Select
          value={selectedTarget}
          onValueChange={setSelectedTarget}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择相关标的" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部标的</SelectItem>
            {uniqueTargets.map((target) => (
              <SelectItem key={target} value={target}>
                {target}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AutoRefreshToggle onRefresh={() => {
          table.resetColumnFilters()
          setSelectedTarget('all')
          queryClient.invalidateQueries({ queryKey: ['financialData'] })
        }} />
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              显示列
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnName = {
                  code: "代码",
                  name: "名称",
                  price: "价格",
                  increase_rt: "涨跌幅",
                  discount_rt: "T-1溢价率",
                  volume: "成交(万元)",
                  amount: "场内份额(万份)",
                  index_nm: "相关标的",
                  mt_fee: "管托费",
                  issuer_nm: "基金公司",
                  navDate: "净值日期",
                }[column.id] || column.id

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnName}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

