const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const settingsPath = path.join(__dirname, '../src/components/settings-dialog.tsx')
const code = fs.readFileSync(settingsPath, 'utf8')

// Parse FALLBACK_RELEASE_NOTES array from code
const match = code.match(/export const FALLBACK_RELEASE_NOTES: ReleaseNote\[\] = (\[[\s\S]*?\])\s*\n\n/);

if (!match) {
  console.error('Could not find FALLBACK_RELEASE_NOTES in settings-dialog.tsx')
  process.exit(1)
}

const notesStr = match[1]
const notes = eval(notesStr)

console.log(`Found ${notes.length} release notes. Updating GitHub Releases safely via temp notes-file...`)

const tempNotesPath = path.join(__dirname, 'temp_notes_file.md')

for (const note of notes) {
  const tag = note.version
  const releaseTitle = `AI Toolbox ${tag}`
  let body = `✨ **核心功能与变更：**\n`
  for (const change of note.changes) {
    body += `- ${change}\n`
  }

  // Write exact notes content to temp file to prevent Windows CLI newline truncation
  fs.writeFileSync(tempNotesPath, body, 'utf8')

  console.log(`\nUpdating ${tag}...`)
  console.log(`Title: ${releaseTitle}`)
  console.log(`Body:\n${body}`)

  try {
    const cmd = `gh release edit ${tag} --title "${releaseTitle}" --notes-file "${tempNotesPath}"`
    execSync(cmd, { stdio: 'inherit' })
    console.log(`✅ Successfully updated ${tag}`)
  } catch (err) {
    console.error(`❌ Failed to update ${tag}:`, err.message)
  }
}

if (fs.existsSync(tempNotesPath)) {
  fs.unlinkSync(tempNotesPath)
}
console.log('\n🎉 Done updating all releases!')
