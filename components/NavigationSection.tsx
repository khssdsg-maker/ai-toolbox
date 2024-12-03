"use client"

import Link from 'next/link'
import { useState } from 'react'
import navigationData from '@/app/data/db/navigation.json'
import resourcesData from '@/app/data/db/resources.json'
import ResourceCard from './ResourceCard'

interface NavigationItem {
  id: string
  title: string
  icon: string
  items?: Array<{
    title: string
    href: string
  }>
}

interface ResourceSection {
  id: string
  title: string
  items: Array<{
    title: string
    description: string
    icon: string
    url: string
  }>
}

export function NavigationSection() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="page-container">
      <div className="sidebar-menu">
        <div className="sidebar-menu-inner">
          <ul className="main-menu">
            {navigationData.navigationItems.map((item: NavigationItem) => (
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
      
      <div className="main-content">
        {resourcesData.resourceSections.map((section: ResourceSection) => (
          <section key={section.id} id={section.id}>
            <div className="section-header">
              <h2>
                <i className="linecons-tag mr-2" />
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {section.items.map(item => (
                <ResourceCard
                  key={item.url}
                  {...item}
                />
              ))}
            </div>
            <div className="mb-12"></div>
          </section>
        ))}
      </div>
    </div>
  )
} 