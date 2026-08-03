# 桌面应用打包脚本：临时禁用服务端功能，静态导出前端，然后恢复
Set-Location D:\Projects\ai-toolbox

# 1. 临时移走 API 路由和中间件（静态导出不支持）
$movedApi = $false
$movedAdmin = $false
$movedMiddleware = $false
try {
    if (Test-Path "src\app\api") {
        Rename-Item "src\app\api" "_api_disabled"
        $movedApi = $true
    }
    if (Test-Path "src\app\middleware.ts") {
        Rename-Item "src\app\middleware.ts" "middleware-disabled.ts"
        $movedMiddleware = $true
    }
    # 后台管理页不需要打进桌面应用
    if (Test-Path "src\app\admin") {
        Rename-Item "src\app\admin" "_admin_disabled"
        $movedAdmin = $true
    }

    # 2. 静态导出构建
    $env:BUILD_EXPORT = "true"
    node node_modules\next\dist\bin\next build --no-lint
    $buildOk = ($LASTEXITCODE -eq 0)
}
finally {
    # 3. 恢复文件
    if ($movedApi -and (Test-Path "src\app\_api_disabled")) {
        Rename-Item "src\app\_api_disabled" "api"
    }
    if ($movedMiddleware -and (Test-Path "src\app\middleware-disabled.ts")) {
        Rename-Item "src\app\middleware-disabled.ts" "middleware.ts"
    }
    if ($movedAdmin -and (Test-Path "src\app\_admin_disabled")) {
        Rename-Item "src\app\_admin_disabled" "admin"
    }
}

if (-not $buildOk) {
    Write-Host "构建失败"
    exit 1
}

# 4. 打包安装程序
node node_modules\electron-builder\out\cli\cli.js --win
Write-Host "打包完成"