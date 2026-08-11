const fs = require('fs')
const path = require('path')

const navPath = path.join(__dirname, '../src/navsphere/content/navigation.json')
const navData = JSON.parse(fs.readFileSync(navPath, 'utf8'))

navData.navigationItems.forEach(cat => {
  cat.items.forEach(item => {
    if (item.title === 'NovelAI' || item.id === '11_8') {
      item.icon = 'https://icon.horse/icon/novelai.net'
      console.log('✅ Set explicit icon for NovelAI')
    }
  })
})

fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf8')
