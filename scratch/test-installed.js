const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const psScript = `
  [Console]::OutputEncoding = [Text.Encoding]::UTF8
  $ProgressPreference = 'SilentlyContinue'
  $keys = @(
    'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
  )
  foreach ($k in $keys) {
    Get-ChildItem $k -ErrorAction SilentlyContinue | ForEach-Object {
      $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
      if ($p.DisplayName -like 'AI万能工具箱*') {
        $loc = $p.InstallLocation
        if (-not $loc -and $p.DisplayIcon) { $loc = Split-Path ($p.DisplayIcon -replace ',0$','') }
        if (-not $loc -and $p.UninstallString) { $loc = Split-Path (($p.UninstallString -replace '"','') -replace ' /currentuser.*','') }
        $ver = $p.DisplayVersion
        if (-not $ver -and $p.DisplayName -match 'AI万能工具箱\\s*([\\d.]+)') { $ver = $Matches[1] }
        if ($loc) { Write-Output ($loc.TrimEnd('\\') + '|' + $ver) }
      }
    }
  }`

const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
const out = execSync(`powershell -NoProfile -EncodedCommand ${encoded}`, { encoding: 'utf8' })
console.log('OUTPUT RAW:')
console.log(out)

for (const line of out.split(/\r?\n/)) {
  const m = line.match(/^(.+)\|(\d[\w.\-]*)\s*$/)
  if (!m) continue
  const exe = path.join(m[1], 'AI万能工具箱.exe')
  console.log('Found:', exe, 'exists:', fs.existsSync(exe), 'version:', m[2])
  if (fs.existsSync(exe)) {
    const stats = fs.statSync(exe)
    console.log('Stats mtime:', stats.mtime)
  }
}
