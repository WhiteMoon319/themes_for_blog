# themes_for_blog · 月下独酌官方主题仓库

为 [blog_for_WhiteMoon319](https://github.com/WhiteMoon319/blog_for_WhiteMoon319) 提供可安装的整站主题。每个主题一个文件夹：**zip 工件（审完即所装）+ README + 预览图**。

## 主题一览

| 主题 | 简介 | 契约版本 |
|---|---|---|
| [starter](./starter/) | 起步模板：classic 纸墨风的可直接改造副本 | engine 1 |

> 投稿新主题 = PR 新增 `<slug>/` 文件夹（内含 `<slug>.zip` 与 `README.md`）并在上表加一行。见 [CONTRIBUTING](./CONTRIBUTING.md)。

## 使用者安装

```bash
# 在博客主仓库内
pnpm theme:add <slug>          # 从本仓库安装（经人工审核）
pnpm theme:add ./x.zip         # 直装本地 zip
pnpm theme:update <slug>       # 升级；@version 可回滚
pnpm theme <slug>              # 切换并构建
```

## 安全模型

主题是编译进 Worker 的代码而非沙箱数据。所有上架包经过：结构/硬限制校验、敏感导入扫描、构建冒烟、人工复审四道关卡；直装外部 zip 不受此保护，风险自担。

## 许可

仓库内各主题随包声明许可证；投稿默认要求 AGPL-3.0-or-later 或兼容协议。
