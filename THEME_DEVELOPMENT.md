# 主题开发文档（Theme Contract v1）

> 引擎契约版本 `engine_version: "1"`。本文是第三方主题开发的完整依据；改版只增不删，废弃项标注 `deprecated` 至少两个次版本。

## 1. 目录规范

```
<slug>/
├─ theme.json                  # 必需
├─ layouts/BaseLayout.astro    # 硬必需（缺失拒绝安装）
├─ templates/                  # 核心 9 个软必需（缺失逐文件回退 classic 并警告）
│  home / collection / post / standalone / archive
│  search / not-found / tag-index / tag-detail .astro
├─ components/                 # 可选覆盖：ArticleEnhancer / Comments / Pagination / PostLike / TagResults
├─ styles/tokens.css base.css  # 随 BaseLayout 引入；变量名必须与 classic 同名（见 §5）
├─ scripts/*.ts                # 主题自有脚本
└─ README.md                   # 截图 / 特性 / 安装 / 许可证 / 更新日志
```

认证五页 `login/register/account/logout/verify-email` 为可选模板（内含表单行为脚本，一并随模板走）。
`preview/[id]` 不设独立模板——复用 `post` 模板的 `isPreview` 分支。

## 2. theme.json

```jsonc
{
  "name": "月见草",
  "slug": "tsukimiso",          // ^[a-z0-9][a-z0-9-]{1,30}$；classic/modern 为保留字
  "version": "1.0.0",           // semver，更新必须递增
  "engine_version": "1",
  "author": "...",
  "license": "AGPL-3.0-or-later"
}
```

## 3. 数据纯净层（红线）

- 模板/组件 **禁止**：访问 D1、`envOf`、`resolveUser`、import `lib/db|lib/auth`、`astro:env`、`node:*`、`cloudflare:*`
- 允许 import：`@core/*`、`@theme/*`、主题内相对路径、`astro:` 公开 API
- 一切数据由页面壳经 `getSiteContext()` 组装后以 props 下传

## 4. SiteContext（每模板第一个 prop）

| 字段 | 类型 | 说明 |
|---|---|---|
| siteName / siteUrl | string | 站点名 / 规范化 URL |
| slogan / footerLine / tagline | string | 口号 / 页脚文案行 / 默认 meta 描述 |
| searchPlaceholder / heroNote | string | 搜索占位 / 首页题记（空串不展示） |
| locale | `"zh-CN" \| "en"` | 站点语言 |
| user | `{loggedIn,name,isAdmin,emailVerified}` | 会话摘要 |
| nav | `{key:'home'\|'archive'\|'tags'\|'search'\|'about', href}[]` | 路由键+地址，词汇由主题翻译 |
| r2Base | string | R2 公开基址（评论图片用） |

## 5. 核心能力（@core/*）

| 导入 | 内容 |
|---|---|
| `@core/SiteHead.astro` | CSP/canonical/og/twitter/noindex/RSS 封装。Props：`ctx,title?,description?,keywords?,noindex?,image?,faviconHref?,rssTitle?`。**主题不得自行拼装安全头** |
| `@core/utils` | `postHref(slug, collectionSlug?)`、`fmtDate(iso)`、`yearOf(iso)` |
| `@core/i18n` | `makeT(locale, dicts)`、`LOCALES`、`isLocale`、`ogLocale` |

### i18n 模式

```ts
// themes/<slug>/i18n.ts
import { makeT, type Locale } from '@core/i18n';
const dicts: Record<Locale, Record<string, string>> = { 'zh-CN': {...}, en: {...} };
export const myT = (locale: Locale) => makeT(locale, dicts);
```

词汇归主题所有：导航标签等一切界面文字由主题词典决定，核心不预置文案。站长可在后台覆盖的四个文案位（tagline/footer_line/search_placeholder/hero_note）经 ctx 直出，主题不得写死。

## 6. 模板 Props 一览

| 模板 | 关键 Props（除 ctx 外） |
|---|---|
| home | `siteName,slogan,poem,collections,pinnedPosts,latestPosts` |
| collection | `jsonLd,collection,posts,total,page,totalPages` |
| post | `postId,title,summary?,coverUrl?,keywords?,createdAt,updatedAt,viewCount,html,toc,tags?,prev?/next?,accentColor,backHref,backLabel,kicker` + 可选 `ogImage,noindex,jsonLd,likes,liked,showComments,isPreview,previewBadgeText,publishedHref` |
| standalone | `title,description?,hero?:{kicker,lead},html,fallbackHtml?` |
| archive | `total,page,totalPages,groups` |
| search | `q,tagMode,tagNotFound,results` |
| tag-index | `selected,keyword,tags,collections,posts,collectionPosts` |
| tag-detail | `name,keyword,collectionsCount,postsCount,collections,posts,collectionPosts` |
| not-found / login / register / account / logout / verify-email | 仅 `ctx` |

行对象形态照抄 `themes/classic/templates/` 内同名 interface（CollectionRow/PostRow/TocItem/AdjacentLink…），新主题直接复制类型定义即可。

## 7. 语义锚点（e2e 与功能组件依赖，不可改名）

- section id：`top/portals/pinned/latest/about/epigraph`
- 文章：`.article-body`、toc 锚点 id、`data-views="{n}"`（阅读数钩子）
- 评论：`#comments[data-post-id][data-r2]` 及 `comments-*` 类族
- 表单 action/name：`/search/?q`、`/tags/?t&q`、评论与点赞接口路径
- 回退组件（Comments/Pagination/PostLike/ArticleEnhancer）依赖 tokens 变量名换肤——变量名即契约

## 8. 解析与回退链

`@theme/X` 解析顺序：激活主题 → `classic` → 报错。因此新主题可只带 BaseLayout + 少量模板即可运行，其余自动继承 classic。切换工具：主仓 `pnpm theme <slug>`（写 `.env` + 同步 tsconfig paths/exclude）。

## 9. 打包与投稿

```bash
pnpm theme:pack src/themes/<slug>   # 自检报告全绿 → dist/themes/<slug>.zip
```

投稿三件套与本仓 CI 审查项见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
