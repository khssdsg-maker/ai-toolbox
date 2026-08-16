'use client'

// 驱动工具中心：品牌官方驱动 + 硬件厂商驱动 + 驱动管理工具
import { ArrowLeft, MonitorPlay, ArrowRightLeft, Globe, Star } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import Link from 'next/link'
import { NavigationCard } from '@/components/navigation-card'
import type { NavigationSubItem } from '@/types/navigation'
import { useLanguage } from '@/lib/language-context'
import { WindowControls } from '@/components/window-controls'

interface DriverCategory {
  id: string
  title: string
  titleEn: string
  items: NavigationSubItem[]
}

const DRIVER_DATA: DriverCategory[] = [
  {
    id: 'brand-drivers',
    title: '品牌电脑驱动',
    titleEn: 'Brand PC Drivers',
    items: [
      { id: 'lenovo', title: '联想驱动', titleEn: 'Lenovo', href: 'https://newsupport.lenovo.com.cn/', description: '联想电脑官方驱动下载与自动检测', descriptionEn: 'Lenovo official driver downloads', icon: 'https://www.lenovo.com.cn/favicon.ico', enabled: true },
      { id: 'dell', title: '戴尔驱动', titleEn: 'Dell', href: 'https://www.dell.com/support/drivers/zh-cn', description: '戴尔电脑官方驱动和支持', descriptionEn: 'Dell official drivers and support', icon: 'https://www.dell.com/favicon.ico', enabled: true },
      { id: 'hp', title: '惠普驱动', titleEn: 'HP', href: 'https://support.hp.com/cn-zh/drivers', description: '惠普电脑打印机官方驱动下载', descriptionEn: 'HP official driver downloads', icon: 'https://www.hp.com/favicon.ico', enabled: true },
      { id: 'huawei', title: '华为驱动', titleEn: 'Huawei', href: 'https://consumer.huawei.com/cn/support/', description: '华为笔记本官方驱动与支持', descriptionEn: 'Huawei official support', icon: 'https://consumer.huawei.com/favicon.ico', enabled: true },
      { id: 'asus', title: '华硕驱动', titleEn: 'ASUS', href: 'https://www.asus.com.cn/support/', description: '华硕主板显卡笔记本官方驱动', descriptionEn: 'ASUS official support', icon: 'https://www.asus.com/favicon.ico', enabled: true },
      { id: 'acer', title: '宏碁驱动', titleEn: 'Acer', href: 'https://www.acer.com.cn/support', description: '宏碁电脑官方驱动下载', descriptionEn: 'Acer official support', icon: 'https://www.acer.com/favicon.ico', enabled: true },
      { id: 'msi', title: '微星驱动', titleEn: 'MSI', href: 'https://www.msi.cn/support', description: '微星主板显卡笔记本官方驱动', descriptionEn: 'MSI official support', icon: 'https://www.msi.com/favicon.ico', enabled: true },
    ],
  },
  {
    id: 'component-drivers',
    title: '硬件厂商驱动',
    titleEn: 'Component Drivers',
    items: [
      { id: 'nvidia', title: 'NVIDIA 显卡驱动', titleEn: 'NVIDIA', href: 'https://www.nvidia.cn/geforce/drivers/', description: '英伟达显卡官方驱动下载', descriptionEn: 'NVIDIA official drivers', icon: 'https://www.nvidia.cn/favicon.ico', enabled: true },
      { id: 'amd', title: 'AMD 驱动', titleEn: 'AMD', href: 'https://www.amd.com/zh-hans/support', description: 'AMD 显卡处理器官方驱动', descriptionEn: 'AMD official drivers', icon: 'https://www.amd.com/favicon.ico', enabled: true },
      { id: 'intel', title: 'Intel 驱动', titleEn: 'Intel', href: 'https://www.intel.cn/content/www/cn/zh/download-center/home.html', description: '英特尔核显芯片组网卡官方驱动', descriptionEn: 'Intel official drivers', icon: 'https://www.intel.cn/favicon.ico', enabled: true },
      { id: 'realtek', title: 'Realtek 驱动', titleEn: 'Realtek', href: 'https://www.realtek.com/zh/downloads', description: '瑞昱声卡网卡官方驱动', descriptionEn: 'Realtek official drivers', icon: 'https://www.realtek.com/favicon.ico', enabled: true },
    ],
  },
  {
    id: 'peripheral-drivers',
    title: '键鼠外设驱动',
    titleEn: 'Peripheral Drivers',
    items: [
      { id: 'eweadn', title: '前行者驱动', titleEn: 'EWEADN', href: 'http://www.eweadn.com/', description: '前行者键盘鼠标官方驱动下载', descriptionEn: 'EWEADN official drivers', icon: 'http://www.eweadn.com/favicon.ico', enabled: true },
      { id: 'mchose', title: '迈从驱动', titleEn: 'MCHOSE', href: 'https://www.mchose.com/', description: '迈从键盘鼠标官方驱动与支持', descriptionEn: 'MCHOSE official drivers', icon: 'https://www.mchose.com/favicon.ico', enabled: true },
      { id: 'inphic', title: '英菲克驱动', titleEn: 'Inphic', href: 'http://www.inphic.com/', description: '英菲克鼠标键盘官方驱动下载', descriptionEn: 'Inphic official drivers', icon: 'http://www.inphic.com/favicon.ico', enabled: true },
      { id: 'logitech', title: '罗技驱动', titleEn: 'Logitech', href: 'https://www.logitech.com.cn/', description: '罗技键鼠官方驱动（G HUB）', descriptionEn: 'Logitech G HUB drivers', icon: 'https://www.logitech.com/favicon.ico', enabled: true },
      { id: 'razer', title: '雷蛇驱动', titleEn: 'Razer', href: 'https://www.razer.com.cn/', description: '雷蛇外设官方驱动（Synapse）', descriptionEn: 'Razer Synapse drivers', icon: 'https://www.razer.com/favicon.ico', enabled: true },
      { id: 'rapoo', title: '雷柏驱动', titleEn: 'Rapoo', href: 'https://www.rapoo.com.cn/', description: '雷柏键鼠官方驱动下载', descriptionEn: 'Rapoo official drivers', icon: 'https://www.rapoo.com.cn/favicon.ico', enabled: true },
      { id: 'dareu', title: '达尔优驱动', titleEn: 'Dareu', href: 'https://www.dareu.com/', description: '达尔优外设官方驱动下载', descriptionEn: 'Dareu official drivers', icon: 'https://www.dareu.com/favicon.ico', enabled: true },
      { id: 'a4tech', title: '双飞燕驱动', titleEn: 'A4Tech', href: 'http://www.a4tech.com.cn/', description: '双飞燕键鼠官方驱动下载', descriptionEn: 'A4Tech official drivers', icon: 'http://www.a4tech.com.cn/favicon.ico', enabled: true },
    ],
  },
  {
    id: 'driver-tools',
    title: '驱动管理工具',
    titleEn: 'Driver Tools',
    items: [
      { id: 'drivergenius', title: '驱动精灵', titleEn: 'Driver Genius', href: 'http://www.drivergenius.com/', description: '自动检测并安装缺失驱动', descriptionEn: 'Auto detect and install drivers', icon: 'http://www.drivergenius.com/favicon.ico', enabled: true },
      { id: 'sysceo', title: '驱动总裁', titleEn: 'Sysceo', href: 'https://www.sysceo.com/', description: '离线驱动安装工具，装机常用', descriptionEn: 'Offline driver installer', icon: 'https://www.sysceo.com/favicon.ico', enabled: true },
      { id: 'sdi', title: 'Snappy Driver Installer', titleEn: 'SDI', href: 'https://www.snappy-driver-installer.org/', description: '开源免费的驱动安装工具', descriptionEn: 'Open source driver installer', icon: 'https://www.snappy-driver-installer.org/favicon.ico', enabled: true },
    ],
  },
]

export function DriversCenter() {
  const { locale, t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="flex items-center gap-4 px-5 sm:px-10 h-14 max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t('首页', 'Home')}
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{t('驱动工具中心', 'Driver Center')}</h1>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/tools" aria-label={t('网络工具箱', 'Network Tools')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <Globe className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <Link href="/convert" aria-label={t('文件转换', 'Convert')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <ArrowRightLeft className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <Link href="/videos" aria-label={t('视频导航', 'Videos')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <MonitorPlay className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <Link href="/favorites" aria-label={t('我的收藏', 'Favorites')}>
              <Button variant="ghost" size="icon" className="hover:bg-accent/50">
                <Star className="h-[18px] w-[18px]" />
              </Button>
            </Link>
            <div className="w-[1px] h-4 bg-border/60 mx-1" />
            <WindowControls />
          </div>
        </div>
      </header>

      <div className="px-5 sm:px-10 pt-10 pb-8">
        <div className="max-w-5xl mx-auto">
          <section className="mb-14 sm:mb-20">
            <h2 className="text-3xl sm:text-[2.5rem] font-bold leading-[1.15] tracking-tight">
              {t('驱动工具中心', 'Driver Center')}
            </h2>
            <p className="mt-2.5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
              {t('官方驱动下载入口汇总，优先使用品牌官网，安全稳定。', 'Official driver download hubs. Always prefer brand official sites.')}
            </p>
          </section>

          <div className="space-y-14 sm:space-y-20">
            {DRIVER_DATA.map((category) => (
              <section key={category.id} id={category.id} className="scroll-m-20">
                <div className="mb-5">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {locale === 'en' ? category.titleEn : category.title}
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums font-medium">
                      {category.items.length}
                    </span>
                  </div>
                  <div className="mt-3 border-b border-border/40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.items.map((item) => (
                    <NavigationCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

