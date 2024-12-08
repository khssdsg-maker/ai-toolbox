import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'

async function getData() {
  try {
    const [navigationRes, siteRes] = await Promise.all([
      fetch('http://localhost:3000/api/home/navigation'),
      fetch('http://localhost:3000/api/home/site')
    ])

    if (!navigationRes.ok || !siteRes.ok) {
      throw new Error('Failed to fetch data')
    }

    const [navigationData, siteData] = await Promise.all([
      navigationRes.json(),
      siteRes.json()
    ])

    return { navigationData, siteData }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      navigationData: { navigationItems: [] },
      siteData: {
        basic: {
          title: 'NavSphere',
          description: '',
          keywords: ''
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        }
      }
    }
  }
}

export default async function HomePage() {
  const { navigationData, siteData } = await getData()

  return (
    <div className="flex h-screen">
      {/* 左侧边栏 */}
      <Sidebar className="w-60 shrink-0" navigationData={navigationData} siteInfo={siteData} />
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-8">
          {navigationData.navigationItems.map((category) => (
            <section key={category.id} id={category.id}>
              {/* 分类标题 */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {category.title}
                </h2>
              </div>

              {/* 子分类 */}
              {category.subCategories && category.subCategories.length > 0 ? (
                category.subCategories.map((subCategory) => (
                  <div key={subCategory.id} id={subCategory.id} className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {subCategory.title}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {subCategory.items?.map((item) => (
                        <NavigationCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.items?.map((item) => (
                    <NavigationCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
