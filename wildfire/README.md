# Wildfire 野火

> 野火烧不尽，春风吹又生。暖象牙纸面之上的火焰渐变主题——琥珀→橙→红→玫红的签名渐变，配春绿点缀与切角几何。

![home](./shots/home.png)

## 特性

- **火焰渐变签名**：主按钮、kicker 文字、导航底线的 `linear-gradient(135deg, #fbbf24 → #f97316 → #ef4444 → #f43f5e)`
- **切角几何**：卡片与按钮的 clipped-corner 多边形轮廓
- **双强调色**：火焰橙为主、春绿（#65a30d）为辅的「燎原/新生」双色叙事
- **Space Grotesk / Rajdhani / Noto Sans SC** 三字体栈，数字与小标题带竞技感字距
- 暖象牙多层纸面 + 双团 radial 光晕氛围 + 细颗粒纹理；深浅双模式
- 自带 TagResults 覆盖与现代语态词典（zh-CN / en）
- **多作者署名**：文章页与列表卡署名（第一位为主作者）、文集页集主、搜索结果作者分区、独立作者页

## 安装

```bash
# 博客主仓库内
pnpm theme:add wildfire
pnpm theme wildfire
```

或直装 zip：`pnpm theme:add ./wildfire.zip`

## 契约

engine_version: **1** · 基于 classic 全量模板改写 · 认证页回退 classic

## 许可证

AGPL-3.0-or-later

## 更新日志

### 1.1.0
- 新增 `author` 作者页模板（ProfilePage JSON-LD + 分页）
- 文章页与列表卡署名区、文集页集主署名、搜索结果作者分区、账号页作者简介（回退 classic 认证页）
- 页脚在作者登录时显示写作区入口

### 1.0.1
- 修复：补充 `--ink-soft` / `--ink-faint` 变量，修复回退组件（分页/评论）在亮、暗双色板下的边框与文字色静默失效

### 1.0.0
- 首个版本：9 核心模板 + BaseLayout + TagResults 覆盖 + 双语词表
