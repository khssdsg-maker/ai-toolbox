"use client"

import { Suspense } from 'react'
import { NavMenu } from '@/components/nav-menu'
import FinancialTable from './_components/financial-table'
import { AutoRefreshToggle } from '@/components/auto-refresh-toggle'
import { useQueryClient } from "@tanstack/react-query"

export default function Home() {
  const queryClient = useQueryClient()
  
  const handleRefresh = () => {
    // 手动触发数据刷新
    queryClient.invalidateQueries({ queryKey: ['financialData'] })
  }

  return (
    <div className="min-h-screen bg-background">
      <NavMenu />
      <main className="container mx-auto px-4 py-8">
      
        <Suspense fallback={<div>加载中...</div>}>
          <FinancialTable />
        </Suspense>
      </main>
    </div>
  )
}

