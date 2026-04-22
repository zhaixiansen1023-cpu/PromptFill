# 模版创作技能指南 (Prompt Template Skills Guide)

**版本**: 3.1
**作者**: Tanshilong
**更新日期**: 2026-03-31

本指南旨在规范 Prompt Fill 项目中模版的创作流程,确保模版的高质量、可维护性以及多语言支持。本项目已全面支持**图片模板**和**视频模板**两种类型。

---

## 📚 目录

- [AI Skills 库](#ai-skills-库)
- [书写规则](#1-书写规则-writing-rules)
- [书写逻辑](#2-书写逻辑-writing-logic)
- [注意事项](#3-注意事项-precautions)
- [示例代码参考](#4-示例代码参考)
- [最佳实践](#5-最佳实践)

---

## 🤖 AI Skills 库

**重要**: Prompt Fill 项目配备了一套智能 AI Skills 库,可以自动处理模板创建、分析、学习等任务。

### Skills 概览

项目包含 5 个核心 Skills（`.claude/skills/` 与 `.cursor/skills/` 语义对齐）:

1. **template-router** - 模板路由器
  - 智能分析用户请求
  - 自动判断任务类型（含「先图后文」）
  - 路由到对应的专家 skill
2. **image-to-prompt** - 图像反推提示词
  - 将参考图转为可编辑的长文本提示词草稿
  - 与「用户粘贴纯文本」等价后再交给下游 skill
3. **create-template** - 创建新模板
  - 从提示词完整创建模板（仅图时先走 image-to-prompt）
  - 自动提取变量并创建词库
  - 生成双语代码
4. **prompt-analyzer** - 提示词分析器
  - 分析提示词结构
  - 提取变量和识别领域
  - 仅图片输入时先反推再分析文本
  - 评估质量并生成建议
5. **universal-learner** - 通用学习器
  - 学习新变量和词库选项
  - 扩展现有知识库
  - 人工审核模式

### 使用方式

#### 方式1: 直接使用 Skill

通过 Skill 工具调用:

```
Skill(command="create-template")
```

#### 方式2: 自然语言请求

直接描述需求,让 AI 自动路由:

```
"创建一个模板,内容如下:..."
→ AI 自动识别为 create-template 任务
→ 自动调用对应的 skill
```

### Skills 文档位置

- 完整文档: `.claude/skills/README.md`
- Cursor Agent 技能: `.cursor/skills/*/SKILL.md`（与上表一一对应，如 `image-to-prompt/SKILL.md`）

---

## 1. 书写规则 (Writing Rules)

### 1.1 双语模式 (Bilingual Support)

模版必须支持中英双语。所有用户可见的文本(包括模版名称、模版内容、变量标签、选项等)都应遵循以下结构:

- **对象形式**: `{ cn: "中文内容", en: "English Content" }`
- **模版内容**: 在 `src/data/templates.js` 中定义常量时,使用双语对象包裹 Markdown 字符串

**示例**:

```javascript
name: { cn: "赛博朋克角色", en: "Cyberpunk Character" }
content: {
  cn: `### 角色设计\n由 {{art_style}} 大师设计...`,
  en: `### Character Design\nDesigned by {{art_style}} master...`
}
```

---

### 1.2 变量语法 (Variable Syntax)

- 使用双大括号包裹变量名: `{{variable_name}}`
- 变量名应具有描述性,建议使用小写字母和下划线
- 示例: `{{art_style}}`, `{{subject_pose}}`, `{{camera_angle}}`

**❌ 不推荐的命名**:

- 驼峰命名: `{{artStyle}}`
- 连字符: `{{art-style}}`
- 大写字母: `{{Art_Style}}`

---

### 1.3 ID 命名规范

- **模版 ID**: 必须以 `tpl_` 开头
  - 示例: `tpl_character_sheet`, `tpl_product_photography`
- **词库变量名**: 尽量简洁且具有通用性
  - 示例: `camera_angle`, `art_style`, `lighting`

---

## 2. 书写逻辑 (Writing Logic)

### 2.1 模块化创作

**步骤1: 定义内容常量**

在 `src/data/templates.js` 顶部定义模版内容的 `cn` 和 `en` 字符串:

```javascript
export const TEMPLATE_CYBERPUNK_CHARACTER = {
  cn: `### 赛博朋克角色设计

由 {{art_style}} 大师设计的 {{character_type}},{{outfit}} 风格。

**角色特征**:
- {{hair_style}}
- {{accessory}}
- {{tech_enhancement}}`,

  en: `### Cyberpunk Character Design

A {{character_type}} designed by {{art_style}} master,{{outfit}} style.

**Character Features**:
- {{hair_style}}
- {{accessory}}
- {{tech_enhancement}}`
};
```

**步骤2: 配置模版对象**

在 `INITIAL_TEMPLATES_CONFIG` 数组中添加配置,关联内容常量:

```javascript
{
  id: "tpl_cyberpunk_character",
  name: { cn: "赛博朋克角色", en: "Cyberpunk Character" },
  content: TEMPLATE_CYBERPUNK_CHARACTER,
  imageUrl: "https://example.com/image.jpg",
  selections: {
    art_style: { cn: "赛博朋克", en: "Cyberpunk" },
    character_type: { cn: "黑客", en: "Hacker" },
    // ... 其他变量的默认值
  },
  tags: ["游戏", "人物"],
  language: ["cn", "en"],
  source: [
    { type: "image", url: "https://example.com/ref.jpg", label: { cn: "参考图", en: "Reference" } },
    { type: "video", url: "https://example.com/ref.mp4", label: { cn: "视频参考", en: "Video Ref" } }
  ]
}
```

**步骤3: 设置默认值**

在 `selections` 中为每个变量指定合理的初始值。

**步骤4: 分配标签**

参考下方 2.5 标签体系，为模板选择合适的标签。注意"视频"和"图片"是**类型（Type）**，不是标签。

---

### 2.2 词库引用逻辑 (Bank Reference Logic)

**优先复用**: 在引入新变量前,务必检查 `src/data/banks.js` 中是否已有类似的词库。

**变量控制**:

- 每个模版引入的变量不宜过多,保持核心提示词的精简
- 除非是"多人多动作"等需要极高细节描述的场景,否则应尽量复用现有词库

**一致性**: 确保变量在 `banks.js` 中的 `label` 和 `options` 与模版的视觉需求匹配。

---

### 2.3 模板类型 (Template Types)

项目支持两种模板类型，通过 `type` 字段区分：

**图片模板（默认）**:

- 不设置 `type` 字段，或 `type` 不为 `"video"`
- 使用 `imageUrl` 作为预览图
- 可使用 `imageUrls` 数组支持多图预览

**视频模板**:

- **必须设置** `type: "video"`
- 使用 `videoUrl` 存放视频链接（主要预览内容）
- `imageUrl` 作为视频封面图（poster）
- 参考素材图片放在 `source` 数组中

```javascript
// 视频模板示例
{
  id: "tpl_tavern_fight_video",
  type: "video",                    // 必须！标记为视频模板
  videoUrl: "https://example.com/video.mp4",  // 视频链接
  imageUrl: "https://example.com/poster.jpg", // 封面图
  source: [
    { type: "image", url: "...", label: { cn: "开场素材", en: "Opening Frame" } },
    { type: "image", url: "...", label: { cn: "结尾素材", en: "Ending Frame" } }
  ],
  // ... 其他字段
}
```

---

### 2.4 模型与底图建议 (Model & Base Image Suggestion)

模版应提供最佳匹配模型的推荐以及是否需要自备底图的指导:

**图片模板推荐模型 (`bestModel`)**:

- `"Nano Banana Pro"`
- `"Midjourney V7"`
- `"Zimage"`

**视频模板推荐模型 (`bestModel`)**:

- `"Seedance 2.0"`
- `"Veo 3.1"`
- `"Kling 3.0"`

**自备底图 (`baseImage`)**:

- `"no_base_image"` - 无需底图
- `"recommend_base_image"` - 自备底图
- `"optional_base_image"` - 按需准备

---

### 2.5 标签体系 (Tag System)

项目采用**三层筛选体系**：素材库（Library）→ 类型（Type）→ 标签（Tags）。

#### 类型（Type）与标签（Tags）的区别

- **类型 Type**: "图片"和"视频"是**类型**,不是标签。通过 `type` 字段区分,在侧栏中作为独立的筛选层级。
- **标签 Tags**: 描述模板内容主题的分类标记,图片和视频模板共用同一套标签体系。

**⚠️ 关键规则**: 模板的 `tags` 数组中**不要**包含"视频"或"图片"标签，类型筛选由 `type` 字段自动处理。

#### 标签列表

**通用标签**（图片和视频模板均可使用）:


| 标签  | 英文           | 适用场景     |
| --- | ------------ | -------- |
| 建筑  | Architecture | 建筑、空间设计  |
| 人物  | Portrait     | 人像、角色    |
| 摄影  | Photography  | 摄影作品     |
| 产品  | Product      | 产品展示     |
| 图表  | Diagram      | 图表、数据可视化 |
| 卡通  | Cartoon      | 卡通、动漫风格  |
| 宠物  | Pets         | 动物、宠物    |
| 游戏  | Gaming       | 游戏场景、角色  |
| 创意  | Creative     | 创意、概念艺术  |
| 动作  | Action       | 动作场景、打斗  |
| 影视  | Cinematic    | 影视级画面    |


**视频偏向标签**（更常用于视频模板，但不限制使用）:


| 标签  | 英文          | 适用场景    |
| --- | ----------- | ------- |
| 纪实  | Documentary | 纪录片风格   |
| 幻想  | Fantasy     | 奇幻、魔法场景 |
| 动画  | Animation   | 动画风格    |
| 武侠  | Wuxia       | 武侠、中国功夫 |
| 现代  | Modern      | 现代都市题材  |
| 修仙  | Xianxia     | 修仙、仙侠题材 |


#### 动态标签筛选

- 当用户切换"类型"（图片/视频）筛选时，侧栏中**仅显示有对应模板的标签**
- 如果某标签在当前类型下没有任何模板，该标签会被自动隐藏
- 标签的显示/隐藏由 `App.jsx` 中 `availableTags` 计算逻辑控制

#### 新增标签

新标签需在以下位置添加:

1. `src/data/templates.js` → `TEMPLATE_TAGS` 数组
2. `src/constants/styles.js` → `TAG_STYLES`（颜色样式）和 `TAG_LABELS`（中英文标签名）

---

## 3. 注意事项 (Precautions)

### 3.1 版本号更新策略

**普通更新**: 在日常修改或本地测试模版时,**不需要**更新 `src/data/templates.js` 中的 `SYSTEM_DATA_VERSION`。

**最终发布**: 仅在准备将代码最终上传至 Git 仓库时,才需要统一更新版本号(如从 `0.8.4` 升级到 `0.8.5`)。

---

### 3.2 提示词质量

**结构化**: 使用 Markdown 的标题(#)、列表(-)和粗体(**)来增强提示词对 AI 的可读性。

**细节描写**: 模版中应包含关于摄影参数(Lens, Lighting)、材质(Texture)、构图(Composition)的专业描述。

**示例**:

```markdown
### 专业产品摄影

一个 {{product_type}},由 {{photographer}} 拍摄,{{lighting_setup}} 光线。

**技术细节**:
- 镜头: {{lens_choice}}
- 背景: {{background_style}}
- 构图: {{composition_type}}
- 色彩分级: {{color_grade}}
```

---

### 3.3 预览媒体 (Preview Media)

**图片模板**:

- 确保 `imageUrl` 指向清晰、具有代表性的预览图
- 如果支持多图展示,请使用 `imageUrls` 数组
- 临时占位符: `https://placehold.co/600x400/png?text=Template+Name`

**视频模板**:

- `videoUrl` 为主要预览内容（mp4 链接），**不是** `imageUrl`
- `imageUrl` 用于视频封面图（poster），当视频未加载时显示
- UI 会根据 `type: "video"` 自动切换为视频播放器预览
- 视频模板在编辑器预览和发现页模态中均有专门的大尺寸视频播放器布局

---

### 3.4 参考素材 (Source Assets)

本项目支持在模板中展示参考素材:

- **字段**: `source` (数组)
- **素材对象结构**:
  - `type`: 素材类型,可选 `"image"` 或 `"video"`
  - `url`: 素材的 URL 地址
  - `label`: 素材的显示名称(双语对象)
- **用途**: 用于展示生成提示词时的参考素材,如 ControlNet 的参考图、风格参考视频等

**图片模板**: `source` 中可包含图片和视频素材

**视频模板**: 视频链接放在 `videoUrl` 字段中,`source` 中仅放参考图片（如开场帧、结尾帧等素材图）。视频模板的 `source` 素材在 UI 中横向排布于视频预览下方,支持左右滚动。

**示例代码**:

```javascript
// 图片模板的 source
source: [
  { type: "image", url: "https://example.com/ref.jpg", label: { cn: "参考图", en: "Reference" } },
  { type: "video", url: "https://example.com/demo.mp4", label: { cn: "动态参考", en: "Motion Ref" } }
]

// 视频模板的 source（视频在 videoUrl，这里只放素材图）
source: [
  { type: "image", url: "https://example.com/frame1.jpg", label: { cn: "开场素材", en: "Opening Frame" } },
  { type: "image", url: "https://example.com/frame2.jpg", label: { cn: "结尾素材", en: "Ending Frame" } }
]
```

---

## 4. 示例代码参考

### 词库定义 (`src/data/banks.js`)

```javascript
export const INITIAL_BANKS = {
  my_variable: {
    label: { cn: "变量标签", en: "Variable Label" },
    category: "visual",  // 六选一: character, item, action, location, visual, other
    options: [
      { cn: "选项一", en: "Option One" },
      { cn: "选项二", en: "Option Two" },
      // ... 建议 5-15 个选项
    ]
  }
};
```

**⚠️ 关键区别**: INITIAL_BANKS vs INITIAL_DEFAULTS

- **INITIAL_BANKS** (第13-1063行): 定义词库选项列表,包含 `options` 数组
- **INITIAL_DEFAULTS** (第1064行到末尾): 定义默认选中值,只有一个双语对象

**❌ 常见错误**: 把词库定义(包含 `options`)放到 INITIAL_DEFAULTS 中,会导致下拉列表为空

---

### 模版配置 (`src/data/templates.js`)

**图片模板示例**:

```javascript
export const TEMPLATE_EXAMPLE = {
  cn: `### 示例标题\n这是一个使用了 {{my_variable}} 的模版。`,
  en: `### Example Title\nThis is a template using {{my_variable}}.`
};

// 在 INITIAL_TEMPLATES_CONFIG 中
{
  id: "tpl_example",
  name: { cn: "示例模版", en: "Example Template" },
  content: TEMPLATE_EXAMPLE,
  imageUrl: "https://placehold.co/600x400/png?text=Example",
  selections: {
    my_variable: { cn: "选项一", en: "Option One" }
  },
  tags: ["创意"],
  language: ["cn", "en"],
  bestModel: "Nano Banana Pro",
  baseImage: "optional_base_image"
}
```

**视频模板示例**:

```javascript
export const TEMPLATE_TAVERN_FIGHT_VIDEO = {
  cn: `### 酒馆武打戏\n这是一段使用 {{fight_style}} 风格拍摄的视频...`,
  en: `### Tavern Fight Scene\nA video shot in {{fight_style}} style...`
};

// 在 INITIAL_TEMPLATES_CONFIG 中
{
  id: "tpl_tavern_fight_video",
  name: { cn: "酒馆武打戏", en: "Tavern Fight Scene" },
  type: "video",                    // ⭐ 必须！标记为视频模板
  content: TEMPLATE_TAVERN_FIGHT_VIDEO,
  videoUrl: "https://example.com/video.mp4",  // ⭐ 视频链接（主预览）
  imageUrl: "https://example.com/poster.jpg", // 封面图
  author: "YangGuang (@YangGuangAI)",
  selections: {
    fight_style: { cn: "拳拳到肉", en: "Hard-hitting" }
  },
  tags: ["动作", "影视", "人物", "武侠"],    // ⭐ 不包含"视频"标签
  language: ["cn", "en"],
  bestModel: "Seedance 2.0",        // 视频生成模型
  baseImage: "recommend_base_image",
  source: [                          // ⭐ 仅参考图，视频在 videoUrl
    { type: "image", url: "https://example.com/frame1.jpg", label: { cn: "开场素材", en: "Opening Frame" } },
    { type: "image", url: "https://example.com/frame2.jpg", label: { cn: "结尾素材", en: "Ending Frame" } }
  ]
}
```

---

## 5. 最佳实践

### 5.1 使用 AI Skills 辅助创建

**推荐工作流**:

1. **准备提示词**: 整理好你的提示词内容
2. **调用 create-template skill**: 让 AI 自动处理
  - 识别变量
  - 检查现有词库
  - 创建缺失词库
  - 生成代码
3. **审核和调整**: 检查 AI 生成的结果
4. **测试**:
  ```bash
   npm run sync-data
   npm run dev
  ```

---

### 5.2 变量命名最佳实践

**✅ 推荐的命名**:

- `camera_angle` - 描述性强,小写+下划线
- `art_style` - 简洁,通用
- `lighting_setup` - 清晰,易懂

**❌ 避免的命名**:

- `CameraAngle` - 驼峰命名
- `camera-angle` - 连字符
- `ca` - 过于简短
- `this_is_the_camera_angle_variable` - 过于冗长

---

### 5.3 词库分类选择

**六个分类**:


| 分类          | 用途          | 示例        |
| ----------- | ----------- | --------- |
| `character` | 人物、角色、生物    | 发型、表情、职业  |
| `item`      | 物品、配饰、道具    | 服装、饰品、武器  |
| `action`    | 动作、姿势、行为    | 跑、跳、坐     |
| `location`  | 地点、场景、背景    | 城市、森林、室内  |
| `visual`    | 风格、光照、相机、色彩 | 摄影风格、光照效果 |
| `other`     | 其他所有内容      | 镜头类型、渲染设置 |


---

### 5.4 双语翻译质量

**原则**:

- 专业术语使用标准翻译
- 保持艺术性和描述性
- 避免机器翻译的生硬感

**示例**:

```javascript
// ✅ 好的翻译
{ cn: "电影级布光", en: "Cinematic Lighting" }
{ cn: "赛博朋克风格", en: "Cyberpunk Style" }

// ❌ 生硬的翻译
{ cn: "电影级布光", en: "Movie Grade Light" }
{ cn: "赛博朋克风格", en: "Cyber Punk Style" }
```

---

### 5.5 测试检查清单

创建新模版后,确保:

- 运行了 `npm run sync-data`
- 运行了 `npm run lint`(应通过,无警告)
- 运行了 `npm run dev` 并在浏览器中测试
- 检查模板下拉列表是否正确填充
- 测试变量选中是否持久化
- 验证双语切换是否正常
- 测试暗色模式切换
- 如有 UI 更改,检查移动端响应式

---

## 📚 相关文档

- **AI Skills 库**: `.claude/skills/README.md`
- **项目指南**: `CLAUDE.md`
- **数据结构**: `src/data/banks.js`, `src/data/templates.js`

---

## 🤝 贡献

如果你发现了问题或有改进建议,请:

1. 查阅 AI Skills 库文档
2. 检查现有规范是否满足需求
3. 提交 Issue 或 Pull Request

---

**版权所有 © 2026 Tanshilong. Prompt Fill 项目.**