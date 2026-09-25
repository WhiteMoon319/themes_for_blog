# 主题开发文档（Theme Contract v1）

> 引擎契约版本 `engine_version: "1"`。本文是第三方主题开发的完整依据；改版只增不删，废弃项标注 `deprecated` 至少两个次版本。

## 1. 目录规范

```
<slug>/
├─ theme.json                  # 必需（字段见 §2）
├─ layouts/BaseLayout.astro    # 硬必需（缺失拒绝安装）
├─ templates/                  # 核心 10 个软必需（缺失逐文件回退 classic 并警告）
│  home / collection / post / author / standalone / archive
│  search / not-found / tag-index / tag-detail .astro
├─ components/                 # 可选覆盖：ArticleEnhancer / Comments / Pagination / PostLike / TagResults
├─ styles/tokens.css base.css  # 随 BaseLayout 引入；变量名必须与 classic 同名（见 §5）
├─ assets/                     # 主题自有静态资源（图片/字体等，经 Vite 引用，见 §5.1）
├─ scripts/*.ts                # 主题自有脚本
├─ README.md                   # 必需：见下方「CI 强制项」
└─ shots/                      # 必需：至少一张预览图（README 引用）
```

认证五页 `login/register/account/logout/verify-email` 为可选模板（内含表单行为脚本，一并随模板走）。
`preview/[id]` 不设独立模板——复用 `post` 模板的 `isPreview` 分支。

**CI 强制项**（提交 PR 时硬校验，缺失即拒）：
- `README.md` 必须包含以下小节标题之一：`特性/Features`、`安装/Installation`、`许可|许可证/License`、`更新日志/Changelog`，且至少有一处图片引用 `![...](...)`
- `shots/` 目录必须存在（至少一张预览图，README 引用）

## 2. theme.json

```jsonc
{
  "name": "月见草",
  "slug": "tsukimiso",          // ^[a-z0-9][a-z0-9-]{1,30}$；classic/modern 为保留字
  "version": "1.0.0",           // semver，更新必须严格递增
  "engine_version": "1",
  "author": "...",
  "description": "一句话简介",   // 供主题仓库一览表自动生成（build-index 读取）
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
| user | `{loggedIn,name,isAdmin,emailVerified,isAuthor,authorHref,writeHref}` | 会话摘要；`isAuthor`=作者或管理员，`authorHref` 为作者页路径（无作者页时 null），`writeHref` 为写作区入口（读者为 null） |
| nav | `{key:'home'\|'archive'\|'tags'\|'search'\|'about', href}[]` | 路由键+地址，词汇由主题翻译 |
| r2Base | string | R2 公开基址（评论图片用） |

## 5. 核心能力（@core/*）

| 导入 | 内容 |
|---|---|
| `@core/SiteHead.astro` | CSP/canonical/og/twitter/noindex/RSS 封装。Props：`ctx,title?,description?,keywords?,noindex?,image?,faviconHref?,rssTitle?`。**主题不得自行拼装安全头** |
| `@core/utils` | `postHref(slug, collectionSlug?)`、`fmtDate(iso)`、`yearOf(iso)` |
| `@core/i18n` | `makeT(locale, dicts)`、`LOCALES`、`isLocale`、`ogLocale` |
| `@core/CardLink.astro` | 卡片主链接。Props：`href`。以 `::after` 铺满最近的定位祖先（卡片容器）承接整卡点击——列表卡**不要整卡套 `<a>`**，用法见 §6.2 |
| `@core/AuthorByline.astro` | 署名徽标。Props：`authors,prefix?,variant?,class?`，详见 §6.1 |

### tokens 必备变量（易踩坑）

`styles/tokens.css` 的**变量名是回退组件（Comments/Pagination/PostLike/ArticleEnhancer）换肤的契约**——它们按名引用 `var(--cinnabar)`、`--ink-deep`、`--ink-soft`、`--ink-faint` 等。**最安全的做法**：从 `classic/styles/tokens.css` 整份复制，只改色值，**不要删减任何变量**（含 `--ink-soft`/`--ink-faint` 这类软色阶——缺失会让回退组件静默降级为默认色，且不会报错）。

变量分四组，均需亮/暗双模式各给一套：
- 强调：`--cinnabar` `--cinnabar-line` `--deep-blue` `--pine` `--amber` `--sky`
- 墨色阶：`--ink-black` `--ink-deep` `--ink-mid` `--ink-light` `--ink-soft` `--ink-faint` `--hairline`
- 纸色：`--paper-warm` `--paper-card`
- 字体/圆角/阴影/动效：`--font-*` `--radius-*` `--shadow-*` `--ease*` `--duration*`

可额外新增主题私有变量（如 `--wf-flame-grad`），但不得依赖未被 classic 定义的变量名。

可选变量：`--focus-ring` 控制 `@core/CardLink` 的焦点环颜色（缺省 `currentColor`）；定义与否都不报错，未定义时焦点环用当前文字色。

### 5.1 主题自有资源（自包含）

主题的静态资源（背景图、插图、字体等）应放 **`assets/`** 目录，并在样式/模板中用**相对路径 `url()` 或 JS import** 引用——由 Vite 构建期编译发射为带 hash 的产物（如 `/_astro/hero-bg.xxx.webp`），**绝不放进主仓 `public/`**：

```css
/* styles/base.css 内——相对自身目录引用，Vite 自动发射资源 */
.hero {
  background: linear-gradient(180deg, rgba(...), rgba(...)),
    url("../assets/hero-bg.webp") center / cover no-repeat;
}
```

- ✅ 正确：`url("../assets/x.webp")`、`import x from '../assets/x.ts'`（Vite 编译期处理，产物自动 hash 化，各主题 `assets/` 互不冲突）
- ❌ 禁止：`url("/x.webp")` 站内绝对路径引用主题自有资源（全局共享、主题不自包含），以及任何经 `public/` 打进去的主题图片
- 校验器已把 `.webp` 纳入扩展名白名单（`theme:pack` 与 CI 同判）


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
| home | `siteName,slogan,poem,collections,pinnedPosts,latestPosts` + 可选 `recentReadings?`（登录用户阅读历史，空数组/未登录不渲染「历史记录」区块）、`authorsByPost?`（文章署名，按文章 id 索引）、`collectionOwners?`（文集集主，按文集 id 索引） |
| collection | `jsonLd,collection,posts,total,page,totalPages` + 可选 `owner?`（集主署名，可能为 null）、`authorsByPost?` |
| post | `postId,title,summary?,coverUrl?,keywords?,createdAt,updatedAt,viewCount,html,toc,tags?,prev?/next?,accentColor,backHref,backLabel,kicker` + 可选 `ogImage,noindex,jsonLd,likes,liked,showComments,isPreview,previewBadgeText,publishedHref,initialScrollPct?,authors?`（署名作者数组，见 §6.1） |
| author | `author`（作者徽标）、`total,page,totalPages,posts,joinedAt` + 可选 `avatarUrl?,jsonLd?`（ProfilePage） |
| standalone | `title,description?,hero?:{kicker,lead},html,fallbackHtml?` |
| archive | `total,page,totalPages,groups` + 可选 `authorsByPost?` |
| search | `q,tagMode,tagNotFound,results` + 可选 `authorHits?`（关键词命中的作者）、`authorsByPost?` |
| tag-index | `selected,keyword,tags,collections,posts,collectionPosts` + 可选 `authorsByPost?` |
| tag-detail | `name,keyword,collectionsCount,postsCount,collections,posts,collectionPosts` + 可选 `authorsByPost?` |
| not-found / login / register / account / logout / verify-email | 仅 `ctx` |

行对象形态照抄 `themes/classic/templates/` 内同名 interface（CollectionRow/PostRow/TocItem/AdjacentLink…），新主题直接复制类型定义即可。

### 6.1 多作者署名（作者徽标）

署名统一渲染为「作者徽标」数组，形态由核心给全，主题只排版：

```ts
interface AuthorBadge {
  id: number;
  name: string;        // 笔名优先，无笔名回退用户名
  username: string;
  avatarUrl: string;
  bio: string;
  href: string | null; // 作者页路径；封禁或身份不符时为 null → 署名降级为纯文本
}
```

- 有序：数组顺序即展示顺序，**第一位是主作者**。
- **封禁作者的署名必须降级为纯文本**（`href === null` 时不要渲染 `<a>`），文章与署名本身保留。
- 核心提供现成组件，主题一行接入即可（推荐，四套官方主题均如此）：

```astro
import AuthorByline from '@core/AuthorByline.astro';
<AuthorByline authors={authors} prefix={t('post.byline')} variant="post" />
```

`variant` 取值 `post | card | collection`；主题可用 `.byline*` 类覆写样式。`authorsByPost` 是以文章 id 为键的普通对象（`Record<string, AuthorBadge[]>`），列表卡里用 `authorsByPost[String(p.id)] ?? []`。


### 6.2 列表卡结构（避免 `<a>` 嵌套）

列表卡（home / collection / search / archive / author / TagResults）**容器用 `<div>`，标题用 `@core/CardLink` 承接整卡点击**：

```astro
import CardLink from '@core/CardLink.astro';
<div class="post-card reveal">
  <h3 class="post-title"><CardLink href={postHref(p.slug, col?.slug)}>{p.title}</CardLink></h3>
  <p class="post-summary">{p.summary}</p>
  <div class="post-meta">
    <AuthorByline authors={authorsByPost[String(p.id)] ?? []} variant="card" />
  </div>
</div>
```

- **不要**写成 `<a class="post-card" href=…>` 整卡包裹：卡内 `AuthorByline` 本身含作者页 `<a>`，整卡套 `<a>` 会形成 `<a>` 嵌套 `<a>`（非法 DOM，浏览器会拆解、点击行为不可预期）。
- `CardLink` 的 `::after` 以 `z-index:1` 铺满**最近的定位祖先**，因此**卡片容器必须 `position: relative`**；卡内其它链接（署名）靠 `AuthorByline` 自带的 `z-index:2` 浮在覆盖层之上，主题不得把该层压到覆盖层之下。
- 卡片焦点环由 `CardLink` 的 `:focus-visible::after` 提供（颜色可经 `--focus-ring` 定制），主题无需再为 `.post-card:focus-visible` 写 outline。

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

> **依赖顺序（易踩坑）**：主题引用的 `@core/*` 组件必须在引擎 ref（`BLOG_ENGINE_REF`，默认 `main`）中已存在。若主题用了主仓较新的核心组件（如 `@core/CardLink.astro`），要**先等该组件合入主仓**再投稿——否则本仓 CI 的构建冒烟会失败、使用者 `theme:add` 也会解析不到。
