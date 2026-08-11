const fs = require('fs')
const path = require('path')

const navPath = path.join(__dirname, '../src/navsphere/content/navigation.json')
const navData = JSON.parse(fs.readFileSync(navPath, 'utf8'))

navData.navigationItems.forEach(cat => {
  cat.items = cat.items.filter(item => {
    // Remove TaskingAI (404)
    if (item.title === 'TaskingAI' || item.href.includes('tasking.ai')) {
      console.log(`🧹 Removing dead link: ${item.title}`)
      return false
    }
    // Remove RecurrentGPT (404 gh-pages)
    if (item.title === 'RecurrentGPT' && item.href.includes('recurrentgpt.github.io')) {
      console.log(`🧹 Removing dead link: ${item.title}`)
      return false
    }
    return true
  })
})

fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf8')
console.log('✅ Dead links cleaned!')
