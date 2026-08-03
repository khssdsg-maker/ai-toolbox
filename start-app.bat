@echo off
title 台队万能工匠渭
cd /d D:\Projects\ai-toolbox
netstat -ano | findstr :3000 >nul
if errorlevel 1 (
  start "AI-Toolbox-Server" /min cmd /c "node node_modules\next\dist\bin\next dev -p 3000"
  echo 止牧动信夏和，请用杝...
  timeout /t 10 /nobreak >nul
)
set NODE_ENV=development
start "" node node_modules\electron\cli.js .
exit