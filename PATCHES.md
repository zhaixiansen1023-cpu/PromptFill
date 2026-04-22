# PATCHES

本文档记录 `zhaixiansen1023-cpu/PromptFill` fork 相对上游 `TanShilongMario/PromptFill` 的所有定制改动。每次 `git merge upstream/main` 前先通读一遍，对照本清单预判冲突点。

最后同步上游版本：**v1.1.2**（2026-04-20）

---

## 定制理念

1. **能放宿主就不放 fork** —— 主题色、activity-bar 等都在 Flask 宿主的 `static/css/*.css`，跟 PromptFill 源码解耦。
2. **新建文件优先，改动上游文件其次** —— 新文件永不冲突；改动上游文件是冲突的主要来源。
3. **路径问题用 `import.meta.env.BASE_URL`** —— 不要硬编码 `/images/...`，否则在嵌入模式（`/static/promptfill/`）下会 404。

---

## 一、新增的文件（基本无冲突风险）

| 文件 | 用途 |
|---|---|
| `src/components/EmbeddedToolbar.jsx` | 嵌入模式下的导航工具条（Home/Detail/Sort/Refresh） |
| `src/components/icons/LogoIcon.jsx` | 自定义品牌 Logo（替代上游品牌） |
| `src/components/icons/TitleIcon.jsx` | 自定义 Title（亮色） |
| `src/components/icons/TitleDarkIcon.jsx` | 自定义 Title（暗色） |
| `src/assets/Logo_icon.svg` | Logo 源文件 |
| `src/assets/icons/Title.svg` | Title 源文件（亮色） |
| `src/assets/icons/Title_Dark.svg` | Title 源文件（暗色） |
| `src/hooks/useServiceWorker.js` | 自定义 Service Worker 注册逻辑 |
| `scripts/convert-svg-to-jsx.cjs` | 把 SVG 转成 React 组件的辅助脚本 |
| `scripts/clean-dist.js` | 清理 dist 的辅助脚本（当前为空） |
| `scripts/sync-dist.ps1` | 同步 dist 的 PowerShell 脚本（当前为空） |
| `sync_upstream.bat` | 一键上游同步脚本（见 README 使用说明） |
| `remote_templates.json` | 本地测试用的远程模板数据 |
| `lint.txt`, `lint8.txt` | 开发时 lint 输出，非运行时文件（可考虑 gitignore） |

---

## 二、修改的上游文件（**合并时重点盯这些**）

按冲突风险从高到低排序。

### 🔴 高风险 —— 上游常改、我们也改了很多

| 文件 | 我们改了什么 | 合并提示 |
|---|---|---|
| `src/App.jsx` | ① `?reset=1` 强制清缓存逻辑 ② 嵌入模式下的条件渲染（SettingsView 等） ③ promptfill-active 类广播 | 必冲突。保留我们的 `?reset=1` useEffect；嵌入条件要与上游合并。 |
| `src/components/TagSidebar.jsx` | 标签栏改用 PromptFill 风格橙色渐变 + 深灰渐变 | 上游如果重写标签样式必冲突。 |
| `src/components/Sidebar.jsx` | 嵌入模式的布局与 Morandi 配色 | 上游如果改布局必冲突。 |
| `src/components/AppFooter.jsx` | ① 嵌入模式 footer 改为右侧竖排贴底 ② 返回主页按钮改为纯图标 + Tooltip | 上游如果调整 footer 结构必冲突。 |

### 🟡 中风险 —— 小范围定制

| 文件 | 我们改了什么 |
|---|---|
| `src/components/SettingsView.jsx` | ① 删除嵌入设置页内的 76px 侧边栏包装 ② `<img>` 微信 QR 用 `${import.meta.env.BASE_URL}images/Wechat.jpg` |
| `src/components/MobileSettingsView.jsx` | 同上（微信 QR 路径） |
| `src/components/modals/SponsorModal.jsx` | `LemonJuice.png` 路径修复（同上 BASE_URL 处理） |
| `src/components/OptimizedImage.jsx` | ① 拦截 imgur.org 防盗链 ② 自定义"暂无预览"占位 UI |
| `src/components/Tooltip.jsx` | Tooltip 视觉风格调整 |
| `src/components/DiscoveryView.jsx` | 嵌入模式的滚动/布局微调 |
| `src/components/RootLayout.jsx` | 嵌入模式的布局参数 |
| `src/context/RootContext.jsx` | 嵌入模式下的主题/语言广播 |
| `src/components/index.js` | 导出新增的 `EmbeddedToolbar` 等 |
| `src/components/VisualEditor.jsx` | 小调整 |
| `src/main.jsx` | Service Worker 注册入口 |
| `src/index.css` | 嵌入模式的全局样式覆盖 |
| `vite.config.js` | `base: '/static/promptfill/'`（关键，**千万不能被上游覆盖**） |

### 🟢 低风险 —— 自动生成 / 删除

| 文件 | 状态 |
|---|---|
| `public/data/banks.json` | 自动生成，每次 `npm run sync-data` 重建。冲突直接采上游，再跑构建 |
| `public/data/templates.json` | 同上 |
| `public/data/version.json` | 自动生成 |
| `public/version.json` | 自动生成 |
| `src/components/DarkModeLamp.jsx` | **已删除**。上游如果改这个文件，merge 会重新引入 —— 要手动再删。 |
| `src/pages/UITestPage.jsx` | 微调（-1 行） |

---

## 三、合并冲突速查表

遇到冲突时的默认选择（多数情况下适用）：

| 文件类型 | 冲突时默认选 |
|---|---|
| `vite.config.js` 的 `base` 字段 | **必须保留我们的** `/static/promptfill/`，不然嵌入会坏 |
| `public/data/*.json` / `public/version.json` | 选上游，合完后 `npm run build` 会重新生成 |
| `src/assets/*.svg`、`src/components/icons/*` | 选我们的（品牌资产） |
| `src/App.jsx` 的 `?reset=1` useEffect | 保留我们的 |
| `src/App.jsx` 的启动 `fetchAndApplyRemoteData` useEffect | **已经按 v1.1.2 删掉，别再加回来**（否则切换存储模式会丢数据） |
| 主题 / 渐变 / 配色相关 | 选我们的 |
| 新功能 / 新 API / 新组件 | 选上游 |
| 两边都改了 + 不是上面任一 | 合并（同时保留两边意图） |

---

## 四、上游同步流程（简版）

```bash
cd src_promptfill
# 工作区清干净
git add . && git commit -m "wip" || git stash
# 拉上游
git fetch upstream
git log --oneline main..upstream/main   # 看看上游更新了啥
# 合并
git merge upstream/main
# 有冲突就按本文档第三节逐个处理，然后：
# git add <冲突文件> && git commit
# 构建并部署
npm run build
rm -rf ../static/promptfill/assets && cp -rf dist/* ../static/promptfill/
# 推到 fork
git push origin main
```

或者直接运行 `sync_upstream.bat`（Windows），它把上面全串起来了。

---

## 五、定制 commit 历史（查阅用）

> 这些是我们相对上游的本地提交，按时间倒序。需要回顾"为什么当初这样改"时 `git show <hash>`。

- `d05c7f8` **2026-04** Local customizations: embedded layout polish and path fixes
  - 删设置页 76px 侧边栏、AppFooter 底部对齐 + 返回主页图标化、所有 `/images/...` 图片路径用 BASE_URL
- `8e6d03c` **2026-04** Refine embedded PromptFill layout and footer
  - AppFooter 嵌入样式、Sidebar 嵌入布局、TagSidebar PromptFill 橙色
- `7b09d5d` **2026-04** Refine PromptFill settings and discovery views
  - SettingsView/MobileSettingsView/DiscoveryView 嵌入适配
- `e90ebd9` **2026-04** Update frontend source code
  - 品牌 Logo/Title 替换、删除 DarkModeLamp、新增 OptimizedImage、`?reset=1`、sync_upstream.bat
