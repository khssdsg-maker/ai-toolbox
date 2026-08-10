# AI万能工具箱 - 自动打包发布脚本
$targetVer = $args[0]
if ($targetVer) {
    node publish-release.js $targetVer
} else {
    node publish-release.js
}
