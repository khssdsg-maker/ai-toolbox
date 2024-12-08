'use client'

import Image from 'next/image'
import Link from 'next/link'
import ResourceCard from '../components/ResourceCard'
import { useState, useEffect } from 'react'
import { resolveIconPath } from '@/types/navigation'

interface NavigationItem {
  id?: string
  title: string
  icon?: string
  description?: string
  href?: string
}

interface NavigationCategory {
  id?: string
  title: string
  items: NavigationItem[]
}

interface Navigation {
  id?: string
  title: string
  categories?: NavigationCategory[]
  items?: NavigationItem[]
}

export default function Home() {
  const [navigations, setNavigations] = useState<Navigation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/home/navigation', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        console.log('Raw navigation data:', data)
        console.log('Data type:', typeof data)
        console.log('Is array:', Array.isArray(data))

        const navigationData: Navigation[] = [{
          id: 'default',
          title: '导航',
          items: data.navigationItems || [],
          categories: []
        }]

        console.log('Processed navigation data:', navigationData)
        
        setNavigations(navigationData)
        setError(navigationData[0].items.length === 0 ? '未找到有效的导航数据' : null)
      } catch (err) {
        console.error('Error fetching navigation data:', err)
        setError(err instanceof Error ? err.message : '获取导航数据时发生未知错误')
        setNavigations([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center bg-white dark:bg-gray-700 p-10 rounded-xl shadow-2xl">
          <div role="status" className="flex justify-center mb-4">
            <svg 
              aria-hidden="true" 
              className="inline w-12 h-12 text-blue-500 animate-spin" 
              viewBox="0 0 100 101" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" 
                fill="currentColor"
                className="text-blue-100 dark:text-gray-600"
              />
              <path 
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" 
                fill="currentColor"
                className="text-blue-500 dark:text-blue-300"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">正在加载导航数据...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center bg-white dark:bg-gray-700 p-10 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">
            数据加载错误
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {navigations.length === 0 ? (
          <div className="text-center text-muted-foreground py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">暂无导航数据</h2>
            <p className="text-gray-500 dark:text-gray-500">请检查数据源或稍后再试</p>
          </div>
        ) : (
          navigations.map((navigation, navIndex) => (
            <div 
              key={navigation.id || `nav-${navIndex}`} 
              className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="section-header mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {navigation.title || `导航 ${navIndex + 1}`}
                </h1>
              </div>

              {/* 默认分类的项目 */}
              {navigation.items && navigation.items.length > 0 && (
                <section className="mb-12">
                  <div className="section-header mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">默认分类</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {navigation.items.map((item, itemIndex) => (
                      <ResourceCard
                        key={item.id || `item-${itemIndex}`}
                        title={item.title || '未命名项目'}
                        description={item.description || ""}
                        icon={resolveIconPath(item.icon)}
                        url={item.href || '#'}
                        className="transition-transform hover:scale-105"
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 子分类的项目 */}
              {navigation.categories && navigation.categories.length > 0 && (
                navigation.categories.map((category, categoryIndex) => (
                  <section 
                    key={category.id || `category-${categoryIndex}`} 
                    className="mb-12"
                  >
                    <div className="section-header mb-6">
                      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                        {category.title || `分类 ${categoryIndex + 1}`}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {category.items.map((item, itemIndex) => (
                        <ResourceCard
                          key={item.id || `category-item-${itemIndex}`}
                          title={item.title || '未命名项目'}
                          description={item.description || ""}
                          icon={resolveIconPath(item.icon)}
                          url={item.href || '#'}
                          className="transition-transform hover:scale-105"
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
