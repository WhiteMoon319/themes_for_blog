// 月下独酌 · blog（blog_for_WhiteMoon319）
// Copyright (C) 2026 WhiteMoon319
//
// 本程序是自由软件：你可以自由修改和再分发它。
// 请遵守 AGPL-3.0 或更高版本许可协议（GNU Affero General Public License v3+）：
//   https://github.com/WhiteMoon319/blog_for_WhiteMoon319
// SPDX-License-Identifier: AGPL-3.0-or-later

// 扫描仓库内全部主题文件夹（数据源：各 <slug>/<slug>.zip 内的 theme.json），
// 重建根 README 的「主题一览」表。区间标记：<!-- THEMES:START --> … <!-- THEMES:END -->

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { unzipSync } from 'fflate';

const README = 'README.md';

function readManifestFromZip(slug) {
  const zipPath = `${slug}/${slug}.zip`;
  if (!existsSync(zipPath)) return { err: '缺 zip 工件' };
  try {
    const entries = unzipSync(new Uint8Array(readFileSync(zipPath)));
    // 优先精确路径；回退仅限单层 `<x>/theme.json`，防误取 layouts/ 等深层同名文件
    const key =
      Object.keys(entries).find((k) => k === `${slug}/theme.json`) ||
      Object.keys(entries).find((k) => k.split('/').length === 2 && k.endsWith('/theme.json'));
    if (!key) return { err: '包内缺 theme.json' };
    return { manifest: JSON.parse(new TextDecoder().decode(entries[key])) };
  } catch (e) {
    return { err: `读取失败：${e.message}` };
  }
}

function collect() {
  const rows = [];
  for (const d of readdirSync('.').sort()) {
    if (d.startsWith('.') || !existsSync(d) || !existsSync(`${d}/${d}.zip`)) continue;
    const r = readManifestFromZip(d);
    if (r.err) {
      rows.push(`| ⚠️ ${d} | ${r.err} | — |`);
      continue;
    }
    const m = r.manifest;
    const desc = (m.description || '').trim() || '—';
    rows.push(`| [${m.name}](./${d}/) | ${desc} | v${m.version} · engine ${m.engine_version} |`);
  }
  return rows;
}

const readme = existsSync(README) ? readFileSync(README, 'utf8') : '';
const START = '<!-- THEMES:START -->';
const END = '<!-- THEMES:END -->';
const block = `${START}\n## 主题一览\n\n| 主题 | 简介 | 版本 / 契约 |\n|---|---|---|\n${collect().join('\n')}\n${END}`;

let out;
if (readme.includes(START) && readme.includes(END)) {
  out = readme.slice(0, readme.indexOf(START)) + block + readme.slice(readme.indexOf(END) + END.length);
} else {
  out = readme.replace(/\n*$/, '\n\n') + block + '\n';
}

if (out !== readme) {
  writeFileSync(README, out);
  console.log('CHANGED: README 一览表已更新（由工作流依据 git status 提交）');
} else {
  console.log('UNCHANGED: README 一览表已是最新');
}
