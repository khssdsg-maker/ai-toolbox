import { getFileContent } from '@/lib/github'
import type { NavigationData } from '@/types/navigation'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'

async function getData() {
  try {
    const data = await getFileContent('navsphere/content/navigation.json') as NavigationData
    return data
  } catch (error) {
    console.error('Error fetching navigation data:', error)
    return { navigationItems: [] }
  }
}

export default async function HomePage() {
  const data = await getData()

  return (
    <div className="flex h-screen">
      {/* 左侧边栏 */}
      <Sidebar className="w-60 shrink-0" />
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-8">
          {data.navigationItems.map((category) => (
            <section key={category.id}>
              {/* 分类标题 */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className={category.icon} />
                  {category.title}
                </h2>
              </div>

              {/* 导航卡片网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.items.map((item) => (
                  <NavigationCard key={item.id} item={item} />
                ))}
              </div>

              {/* 子分类 */}
              {category.subCategories?.map((subCategory) => (
                <div key={subCategory.id} className="mt-6">
                  <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                    <span className={subCategory.icon} />
                    {subCategory.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {subCategory.items.map((item) => (
                      <NavigationCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
