# 主题投稿指南

## 一、本地开发

```bash
git clone https://github.com/WhiteMoon319/blog_for_WhiteMoon319 blog
cd blog && pnpm install
# 把你的主题目录放进主仓（复制或 Windows mklink /J）：
#   src/themes/<slug>/
BLOG_THEME=<slug> pnpm dev      # 实时预览调试
```

契约与目录规范见同目录 [THEME_DEVELOPMENT.md](./THEME_DEVELOPMENT.md)，要点：

```
<slug>/
├─ theme.json          # name/slug/version/engine_version="1"/author/license
├─ templates/          # home/collection/post/standalone/archive/search/not-found/tag-index/tag-detail（软必需）
│                      # login/register/account/logout/verify-email 可选覆盖
├─ layouts/BaseLayout.astro   # 硬必需
├─ components/ styles/ scripts/   # 可选；缺失文件自动回退 classic
└─ README.md           # 随包说明
```

红线：模板内禁止访问 DB/env（一切经 props 的 SiteContext）；禁止 import `lib/db`、`lib/auth`、`astro:env`、`node:*`；纯函数用 `@core/utils`。

## 二、打包自检

```bash
pnpm theme:pack src/themes/<slug>
# 产物 dist/themes/<slug>.zip，附校验报告；报告全绿再投稿
```

硬限制：zip ≤4MB、条目 ≤200、单文件 ≤512KB、扩展名白名单（.astro/.ts/.json/.css/.png/.jpg/.svg/.webp/.woff/.woff2/.md）、slug `^[a-z0-9][a-z0-9-]{1,30}$` 且不得为保留字（classic/modern）。

## 三、提交 PR（三件套）

1. fork 本仓库，新增 `<slug>/` 文件夹：
   - `<slug>.zip` —— theme:pack 产物
   - `README.md` —— 必需小节：截图、特性介绍、安装方法、许可证、更新日志（CI 校验这些标题存在）
   - `shots/` —— 预览图，至少一张，README 引用（CI 强制存在）
2. 在 theme.json 中写好 `description`（一句话简介，供一览表自动生成）；根 README 一览表由 CI 合入后自动重建，无需手改；
3. PR 描述附效果截图与契约版本声明。

**版本更新** = 替换同文件夹内 zip，且 theme.json 的 `version` 必须递增（CI 强制）。

## 四、审核标准（Reviewer Checklist）

- [ ] CI 绿：结构校验 / 硬限制 / 敏感导入扫描 / 构建冒烟 / 版本递增
- [ ] 契约完整性：BaseLayout 存在、必需模板齐备或明示回退清单
- [ ] 无混淆、无压缩过的代码；一切源码可见
- [ ] 许可证 AGPL-3.0-or-later 或兼容
- [ ] 截图真实反映当前版本
- [ ] 查看解包 diff artifact 无可疑改动（更新场景）

合入即上架。任何一项存疑 → 要求作者澄清后再合。
