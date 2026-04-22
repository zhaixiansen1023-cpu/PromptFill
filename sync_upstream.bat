@echo off
setlocal

echo [*] 保证工作区干净（未提交改动请先 commit 或 stash）...
git diff --quiet && git diff --cached --quiet
if errorlevel 1 (
    echo.
    echo [!] 工作区有未提交改动。建议先处理：
    echo     git add . ^&^& git commit -m "wip"
    echo 或临时藏起来：
    echo     git stash save "before upstream sync"
    echo.
    pause
    exit /b 1
)

echo [*] 确认 upstream remote 已配置...
git remote get-url upstream >nul 2>&1
if errorlevel 1 (
    echo [*] 首次运行：添加 upstream remote
    git remote add upstream https://github.com/TanShilongMario/PromptFill.git
)

echo [*] 拉取上游最新代码 (upstream/main)...
git fetch upstream

echo.
echo [*] 上游新增的提交：
git log --oneline main..upstream/main
echo.

echo [*] 合并上游到本地 main...
git merge upstream/main
if errorlevel 1 (
    echo.
    echo [!] 合并有冲突。请参考 PATCHES.md 逐个解决 ^<^<^<^< ==== ^>^>^>^> 标记的文件，
    echo     然后：git add ^<冲突文件^> ^&^& git commit
    echo     解决完后再手动执行：npm run build ^&^& 同步 dist 到 static/promptfill/
    pause
    exit /b 1
)

echo [*] 重新构建前端...
call npm run build
if errorlevel 1 (
    echo [!] 构建失败，请检查错误后手动执行 npm run build
    pause
    exit /b 1
)

echo [*] 同步构建产物到 ..\static\promptfill\ ...
if exist "..\static\promptfill\assets" rmdir /s /q "..\static\promptfill\assets"
powershell -Command "Copy-Item 'dist\*' '..\static\promptfill\' -Recurse -Force"

echo [*] 推送到你的 fork (origin/main)...
git push origin main

echo.
echo [OK] 上游同步、构建、部署、推送全部完成！刷新浏览器验证。
pause
