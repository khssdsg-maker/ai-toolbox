# ============================================================
# AI万能工具箱 - 一键静默更新脚本
# 功能：重新构建 → 生成安装包 → 静默覆盖安装 → 更新桌面快捷方式
# 用法：powershell -WindowStyle Hidden -File update-app.ps1
# ============================================================
$ErrorActionPreference = "Stop"
Set-Location D:\Projects\ai-toolbox

# 1. 关闭正在运行的应用（只关闭本项目的进程，不影响其他程序）
$running = Get-Process -Name "AI万能工具箱" -ErrorAction SilentlyContinue
if ($running) { $running | Stop-Process -Force }
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "D:\Projects\ai-toolbox*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. 清理旧构建缓存
try { Remove-Item ".next" -Recurse -Force -ErrorAction Stop } catch {}

# 3. 临时移走服务端文件（静态导出不支持）
$moved = @()
if (Test-Path "src\app\api") { Rename-Item "src\app\api" "_api_disabled"; $moved += "api" }
if (Test-Path "src\app\middleware.ts") { Rename-Item "src\app\middleware.ts" "middleware-disabled.ts"; $moved += "middleware" }
if (Test-Path "src\app\admin") { Rename-Item "src\app\admin" "_admin_disabled"; $moved += "admin" }

try {
    # 4. 静态导出构建前端（样式打包时固定）
    $env:BUILD_EXPORT = "true"
    & node node_modules\next\dist\bin\next build --no-lint | Out-Null
    if (-not (Test-Path "out\index.html")) { throw "前端构建失败" }
}
finally {
    # 5. 恢复文件
    if ($moved -contains "api") { Rename-Item "src\app\_api_disabled" "api" }
    if ($moved -contains "middleware") { Rename-Item "src\app\middleware-disabled.ts" "middleware.ts" }
    if ($moved -contains "admin") { Rename-Item "src\app\_admin_disabled" "admin" }
}

# 6. 打包安装程序
& node node_modules\electron-builder\out\cli\cli.js --win | Out-Null
$installer = "dist-electron\AI万能工具箱-安装程序.exe"
if (-not (Test-Path $installer)) { throw "打包失败" }

# 7. 静默安装（覆盖旧版本，无弹窗）
$p = Start-Process -FilePath (Resolve-Path $installer) -ArgumentList "/S" -Wait -PassThru -WindowStyle Hidden

# 8. 确保桌面快捷方式存在
$installDir = Join-Path $env:LOCALAPPDATA "Programs\navsphere"
$appExe = Join-Path $installDir "AI万能工具箱.exe"
if (Test-Path $appExe) {
    $desktop = [Environment]::GetFolderPath("Desktop")
    $lnk = Join-Path $desktop "AI万能工具箱.lnk"
    if (-not (Test-Path $lnk)) {
        $ws = New-Object -ComObject WScript.Shell
        $s = $ws.CreateShortcut($lnk)
        $s.TargetPath = $appExe
        $s.WorkingDirectory = $installDir
        $s.Description = "AI万能工具箱"
        $s.Save()
    }
}

# 9. 更新完成，自动打开新版本
if (Test-Path $appExe) {
    Start-Process $appExe
}