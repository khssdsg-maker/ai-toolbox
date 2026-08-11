const fs = require('fs')
const path = require('path')

const navPath = path.join(__dirname, '../src/navsphere/content/navigation.json')
const navData = JSON.parse(fs.readFileSync(navPath, 'utf8'))

const updates = {
  "11_1": "https://sillytavern.app/",
  "11_2": "https://aidungeon.com/",
  "11_3": "https://recurrentgpt.github.io/"
}

let updatedCount = 0

navData.navigationItems.forEach(cat => {
  cat.items.forEach(item => {
    if (updates[item.id]) {
      console.log(`Updating ${item.title} (${item.id}): ${item.href} => ${updates[item.id]}`)
      item.href = updates[item.id]
      updatedCount++
    }
  })
})

fs.writeFileSync(navPath, JSON.stringify(navData, null, 2), 'utf8')
console.log(`✅ Successfully updated ${updatedCount} official promotional links in navigation.json!`)
