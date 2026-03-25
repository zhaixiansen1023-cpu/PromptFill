@echo off
echo [*] 保存本地修改 (Stashing local fixes for iframe embedding)...
git add .
git stash save "Local fixes for iframe embedding"

echo [*] 拉取官方最新代码 (Pulling upstream updates)...
git pull origin main

echo [*] 恢复本地修改 (Re-applying local changes)...
git stash pop

echo [*] 重新打包编译前端 (Rebuilding application)...
npm run build

echo [*] 同步编译产物到主项目静态目录 (Syncing to static/promptfill)...
powershell -Command "Copy-Item 'dist\*' '..\static\promptfill\' -Recurse -Force"

echo [✓] 同步并打包完成！你可以刷新主页面查看。
pause
