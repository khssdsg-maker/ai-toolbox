'use client'
export const runtime = 'edge'

import { useState } from 'react'
import { ResourceSection } from '@/types/navigation'

export default function ResourceManagement() {
  const [resources, setResources] = useState<ResourceSection[]>([])

  const addSection = () => {
    setResources([...resources, {
      id: Date.now().toString(),
      title: '新分类',
      items: []
    }])
  }

  const addResource = (sectionId: string) => {
    const newResources = resources.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [...section.items, {
            title: '新资源',
            description: '',
            icon: '',
            url: ''
          }]
        }
      }
      return section
    })
    setResources(newResources)
  }

  return (
    <div className="admin-page">
      <h1>资源管理</h1>
      <button onClick={addSection}>添加分类</button>
      {resources.map(section => (
        <div key={section.id} className="resource-section">
          <h2>{section.title}</h2>
          <button onClick={() => addResource(section.id)}>添加资源</button>
          <div className="resource-list">
            {section.items.map((item, index) => (
              <div key={index} className="resource-item">
                <input
                  value={item.title}
                  onChange={e => {
                    const newResources = resources.map(s => {
                      if (s.id === section.id) {
                        const newItems = [...s.items]
                        newItems[index] = {...item, title: e.target.value}
                        return {...s, items: newItems}
                      }
                      return s
                    })
                    setResources(newResources)
                  }}
                />
                {/* 其他资源字段 */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 