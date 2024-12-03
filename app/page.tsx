"use client"

import Image from 'next/image'
import Link from 'next/link'
import { navigationItems } from './data/navigation'
import { resourceSections } from './data/resources'
import ResourceCard from './components/ResourceCard'
import { useState } from 'react'

export default function Home() {
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
            {navigationItems.map(item => (
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
        {resourceSections.map(section => (
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

