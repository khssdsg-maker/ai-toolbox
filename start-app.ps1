# AI万能工具箱 - 应用启动器
Set-Location D:\Projects\ai-toolbox

# 检查服务器是否已在运行
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $portInUse) {
    # 后台静默启动服务器
    Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "node_modules\next\dist\bin\next", "dev", "-p", "3000"
    # 等待服务器编译完成
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 2
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200) { $ready = $true; break }
        } catch { }
    }
}

# 启动桌面应用
$env:NODE_ENV = "development"
Start-Process -FilePath "node" -ArgumentList "node_modules\electron\cli.js", "." -WorkingDirectory "D:\Projects\ai-toolbox"