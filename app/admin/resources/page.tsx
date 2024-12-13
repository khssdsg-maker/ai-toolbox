'use client'
export const runtime = 'edge'

import React, { useEffect, useState } from 'react'
import { ResourceSection } from '@/types/navigation'

export default function ResourceManagement() {
  const [resources, setResources] = useState<ResourceSection[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resource')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        console.log(data)
        if (data.metadata && Array.isArray(data.metadata)) {
          setResources(data.metadata)
        } else {
          throw new Error('Metadata is not available or is not an array')
        }
      } catch (error) {
        setError(error.message)
      }
    }

    fetchResources()
  }, [])

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

  const uploadResource = (sectionId: string) => {
    console.log(`上传资源到分类: ${sectionId}`);
  }

  const deleteResource = (sectionId: string, index: number) => {
    const newResources = resources.map(section => {
      if (section.id === sectionId) {
        const newItems = section.items.filter((_, i) => i !== index);
        return { ...section, items: newItems };
      }
      return section;
    });
    setResources(newResources);
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="admin-page">
      <h1>资源管理</h1>
      {error && <div>Error: {error}</div>}
      <button onClick={addSection}>添加分类</button>
      {resources.map(section => (
        <div key={section.id} className="resource-section">
          <h2>{section.title}</h2>
          <button onClick={() => addResource(section.id)}>添加资源</button>
          <button onClick={() => uploadResource(section.id)}>上传资源</button>
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
                <button onClick={() => deleteResource(section.id, index)}>删除</button>
                {/* 其他资源字段 */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 