"use client"

import Image from 'next/image'
import Link from 'next/link'
import ResourceCard from '../components/ResourceCard'
import { useState, useEffect } from 'react'

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  items?: {
    title: string;
    href: string;
  }[];
}

interface ResourceItem {
  url: string;
  title: string;
  description?: string;
  // 添加其他需要的属性
}

interface ResourceSection {
  id: string;
  title: string;
  items: ResourceItem[];
}

export default function Home() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [resources, setResources] = useState<ResourceSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行获取导航和资源数据
        const [navResponse, resourceResponse] = await Promise.all([
          fetch('/api/navigation'),
          fetch('/api/resources')
        ]);

        const navData = await navResponse.json();
        const resourceData = await resourceResponse.json();

        console.log('Raw navigation data:', navData);
        console.log('Raw resource data:', resourceData);

        // 处理导航数据
        if (navData.items && Array.isArray(navData.items)) {
          setNavigation(navData.items);
        } else if (Array.isArray(navData)) {
          setNavigation(navData);
        } else {
          setNavigation([]);
        }

        // 处理资源数据
        if (Array.isArray(resourceData)) {
          setResources(resourceData);
        } else if (resourceData.sections && Array.isArray(resourceData.sections)) {
          setResources(resourceData.sections);
        } else {
          setResources([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNavigation([]);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  // 渲染前确保 navigation 是数组
  const renderNavigation = Array.isArray(navigation) ? navigation : []

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="page-container">
      <div className="sidebar-menu">
        <div className="sidebar-menu-inner">
          <header className="logo-env">
            <div className="logo">
              <Link href="/">
                <Image 
                  src="/assets/images/logo@2x.png"
                  alt="Logo"
                  width={160}
                  height={64}
                  className="logo-expanded"
                />
                <Image
                  src="/assets/images/logo-collapsed@2x.png" 
                  alt="Logo"
                  width={48}
                  height={48}
                  className="logo-collapsed"
                />
              </Link>
            </div>
          </header>

          <ul className="main-menu">
            {renderNavigation.map(item => (
              <li 
                key={item.id}
                className={expandedItems.includes(item.id) ? 'expanded' : ''}
              >
                {item.items?.length ? (
                  <div>
                    <span onClick={() => toggleItem(item.id)}>
                      <div className="menu-title">
                        <i className={item.icon}></i>
                        <span>{item.title}</span>
                      </div>
                      <i className={`fas fa-angle-${expandedItems.includes(item.id) ? 'down' : 'right'} menu-arrow`}></i>
                    </span>
                    <ul>
                      {item.items.map(subItem => (
                        <li key={subItem.href}>
                          <Link href={subItem.href}>
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link href={`#${item.id}`}>
                    <i className={item.icon}></i>
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="main-content bg-gray-100">
        {resources.map(section => (
          <section key={section.id} id={section.id} className="px-8 py-6">
            <div className="section-header mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <i className="linecons-tag mr-3" />
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {section.items.map(item => (
                <ResourceCard
                  key={item.url}
                  {...item}
                />
              ))}
            </div>
            <div className="mb-16"></div>
          </section>
        ))}
      </div>
    </div>
  )
}

