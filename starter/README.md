# Starter 起步模板

> classic 纸墨风的可直接改造副本——新主题开发的最小起点：复制本文件夹即可开始改造。

![home](./shots/home.png)

## 特性

- 古风水墨视觉：纸纹背景、印章、毛笔标题、朱砂强调色、深色模式
- 全部 10 个核心模板（home/collection/post/author/standalone/archive/search/not-found/tag-index/tag-detail）+ BaseLayout + TagResults 覆盖
- 多作者署名：文章页与列表卡展示署名（第一位为主作者）、文集页展示集主、搜索结果分区展示作者
- 双语词表（zh-CN / en）与主题自包含资源（`assets/`）示范
- 缺失文件自动回退 classic 的继承基座

## 安装

```bash
# 博客主仓库内
pnpm theme:add starter
pnpm theme starter
```

或直装 zip：`pnpm theme:add ./starter.zip`

## 契约

engine_version: **1** · 完整开发规范见本仓 `docs/THEME_DEVELOPMENT.md`

## 许可证

AGPL-3.0-or-later

## 更新日志

### 1.1.0
- 新增 `author` 作者页模板（含 ProfilePage JSON-LD、分页）
- 文章页与各类列表卡新增署名区（`authors` / `authorsByPost` props），文集页新增集主署名（`owner`）
- 搜索结果页新增作者分区（`authorHits`），账号页新增作者简介字段
- 页脚在作者登录时显示写作区入口（`ctx.user.writeHref`）

### 1.0.1
- 补充 `--ink-soft` / `--ink-faint` 变量，修复回退组件换肤

### 1.0.0
- 首个版本：classic 纸墨风最小可改造副本
