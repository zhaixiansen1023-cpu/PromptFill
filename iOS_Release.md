# iOS App Store 审核材料备忘录

> 状态：待完善（晚上详细修改）
> 对应指南：Guideline 2.1 - Information Needed - New App Submission

---

## 需要提交到 App Store Connect 的 6 项信息

### 1. 屏幕录制（待录制）

需在真机上录制，从启动 App 开始，展示核心功能流程：
- [ ] 启动 App → 显示系统模板列表
- [ ] 选择一个模板 → 变量下拉选择
- [ ] 填写变量 → 自动生成 Prompt
- [ ] 复制结果
- [ ] AI 智能扩词功能演示（选择变量后点击 AI 扩展）
- [ ] AI 智能拆词功能演示（输入原始 Prompt → 一键拆分为模板）
- [ ] 模板分享功能演示（生成短链接）
- **无需录制**：注册/登录（App 无账号系统）、付费流程（无订阅/内购）

---

### 2. App 用途描述（草稿）

**中文版：**
Prompt Fill 是一款专为 AI 图像/视频生成设计的结构化提示词管理工具（支持 Midjourney、Stable Diffusion 等平台）。通过可视化"填空"交互方式，帮助用户快速构建、管理和复用复杂的 Prompt。

**英文版（用于填写 Notes）：**
Prompt Fill is a structured AI prompt management tool for AI image/video generation platforms (e.g., Midjourney, Stable Diffusion). It helps users build, manage, and reuse complex prompts through a visual fill-in-the-blank interface with variable templates and word banks.

---

### 3. 功能访问说明

- **无需账号/登录**，启动即可使用所有功能
- 核心使用流程：
  1. 启动 App → 浏览系统内置模板（几十个）
  2. 点击模板 → 变量位置渲染为下拉菜单
  3. 选择各变量选项 → 底部实时生成完整 Prompt
  4. 点击复制 → 粘贴到 AI 绘图工具使用
- AI 功能入口：在变量填写界面点击"AI 扩展"按钮（智能扩词）；在创建模板时使用"智能拆分"

---

### 4. 外部服务列表（完整版）

| 服务 | 用途 | 数据传输内容 |
|------|------|-------------|
| **Zhipu AI (GLM)** - bigmodel.cn | AI 智能扩词 + AI 智能拆词（两步：标注 + 翻译） | 仅用户输入的 Prompt 文本，无个人信息 |
| **Alibaba Cloud ECS**（中国区） | 后端 API 服务器，承载：① 短链分享存储 ② AI 请求中转代理 | 分享功能仅存模板 JSON + 6位码 + 时间戳，90天自动清理，无用户身份信息 |
| **Vercel** | 前端/Web 版 CDN 托管 | 无用户数据 |
| **静态图床（CDN）** | 系统模板预览图的只读资源分发 | 无用户数据 |

**AI 功能技术细节：**
- **智能扩词**（generate-terms）：用户选择变量后，将变量名+模板上下文+已有词条发送给 GLM-4-Flash，返回 5 个新词条建议
- **智能拆词**（polish-and-split-lite）：用户输入原始 Prompt，分两步处理：
  1. GLM-4.7 标注变量位置（`{{变量名::原词}}` 格式）
  2. GLM-4.7 翻译为双语版本（中英互译）
  - 全程通过自有后端中转，不直接暴露 API Key

---

### 5. 地区差异说明

App 在所有地区功能一致，无地区锁定。界面支持中英双语。AI 服务（Zhipu AI）通过自有后端代理，全球可用。

---

### 6. 行业资质

不涉及受监管行业（非医疗/金融/法律），无需提供资质文件。

---

## 关于各 Guideline 的说明

### Guideline 3.1.2 - 订阅
**一次买断制，无订阅，无内购，无付费墙。** 在 Notes 中注明即可。

### Guideline 2.3.3 - 截图
- 截图必须展示真实使用界面（模板列表、填空交互、AI 功能），不能只放启动图
- 待补充：[ ] 确认当前提交截图是否符合要求

### Guideline 5.1.1 - 权限说明（Purpose Strings）
- 目前 App 不请求敏感权限（无相机/麦克风/位置/通讯录）
- 待确认：[ ] 是否有图片上传功能需要相册权限？如有，需在 Info.plist 填写清晰的说明文字

---

## UGC 问题的说明

模板分享属于**点对点链接分享**（类似 Google Docs 链接），不是公开内容广场：
- 无用户发现机制，无公开内容流
- 接收方必须持有具体链接才能访问
- 后端不存储任何用户身份，仅存模板 JSON
- **结论**：无需实现内容举报/屏蔽机制，但需在审核备注中主动说明分享模式

---

## 系统模板更新机制说明

- **方式一**：打包时内置 `public/data/` 目录（templates.json / banks.json / version.json）
- **方式二**：App 启动时对比版本号，若后端有新版本则拉取（目前有 Bug，仅影响增量更新，不影响已打包模板的正常使用）
- **审核策略**：重新打包一次，使内置模板与后端一致，Bug 不影响审核；后续再修复动态更新功能

---

## 待完成事项（晚上处理）

- [ ] 录制屏幕录制视频（真机）
- [ ] 确认 App Store Connect 截图是否合规
- [ ] 检查是否有相册权限，确认 Purpose String 已填写
- [ ] 将上方"4. 外部服务列表"英文化，整理为最终 Notes 版本粘贴到 App Store Connect
- [ ] 重新打包一次，保证内置模板与后端同步
