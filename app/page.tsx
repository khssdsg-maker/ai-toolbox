"use client"

import Image from 'next/image'
import Link from 'next/link'
import { navigationItems } from './data/navigation'
import { resourceSections } from './data/resources'
import ResourceCard from './components/ResourceCard'

export default function Home() {
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
                  width={100}
                  height={40}
                  className="logo-expanded"
                />
                <Image
                  src="/assets/images/logo-collapsed@2x.png" 
                  alt="Logo"
                  width={40}
                  height={40}
                  className="logo-collapsed"
                />
              </Link>
            </div>
          </header>

          <nav>
            <ul>
              {navigationItems.map(item => (
                <li key={item.id}>
                  {item.items?.length ? (
                    <div>
                      <span>
                        <i className={item.icon}></i>
                        <span>{item.title}</span>
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
          </nav>
        </div>
      </div>
      
      <div className="main-content">
        {resourceSections.map(section => (
          <section key={section.id} id={section.id}>
            <h2 className="text-gray-700 mb-4">
              <i className="linecons-tag mr-2"></i>
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {section.items.map(item => (
                <ResourceCard
                  key={item.url}
                  {...item}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

