const fs = require('fs')
const path = require('path')

const navPath = path.join(__dirname, '../src/navsphere/content/navigation.json')
const navData = JSON.parse(fs.readFileSync(navPath, 'utf8'))

const novelCat = navData.navigationItems.find(i => i.id === '11')
if (novelCat) {
  const itemIdx = novelCat.items.findIndex(i => i.id === '11_2' || i.title.includes('AI Dungeon'))
  if (itemIdx !== -1) {
    novelCat.items[itemIdx] = {
      "id": "11_2",
      "title": "AutoNovel",
      "titleEn": "AutoNovel",
      "href": "https://github.com/NousResearch/autonovel",
      "description": "开源自主 AI 小说创作 Agent 管线，支持从核心概念、世界观构建到全书章节自动撰写",
      "descriptionEn": "Autonomous AI novel generation agent pipeline for world-building and chapter writing",
      "icon": "",
      "enabled": true
    }
    console.log('✅ Replaced AI Dungeon with AutoNovel in category 11!')
  }
}

fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf8')
