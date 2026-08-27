// 月下独酌 · blog（blog_for_WhiteMoon319）
// Copyright (C) 2026 WhiteMoon319
//
// 本程序是自由软件：你可以自由修改和再分发它。
// 请遵守 AGPL-3.0 或更高版本许可协议（GNU Affero General Public License v3+）：
//   https://github.com/WhiteMoon319/blog_for_WhiteMoon319
// SPDX-License-Identifier: AGPL-3.0-or-later

// 工作流文件本地预检：合并/推送前用 js-yaml 解析全部 .github/workflows/*.{yml,yaml}，
// 校验 YAML 合法性与工作流骨架，避免「无效工作流」导致 GitHub 在 push/PR 时静默失败。
//
// 用法：node scripts/validate-workflows.mjs（CI 与本地共用）

import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { load } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = join(ROOT, '.github', 'workflows');

// GitHub Actions 骨架最小检查：每个文件须含 jobs 且至少有一步
function checkStructure(doc, file) {
  const problems = [];
  if (!doc || typeof doc !== 'object') return ['工作流顶层必须为对象'];
  if (!doc.jobs || typeof doc.jobs !== 'object' || Object.keys(doc.jobs).length === 0) {
    problems.push('缺少 jobs');
  }
  for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
    if (!job || typeof job !== 'object') { problems.push(`job "${jobName}" 非对象`); continue; }
    if (job['runs-on'] === undefined) problems.push(`job "${jobName}" 缺少 runs-on`);
    if (!Array.isArray(job.steps) || job.steps.length === 0) problems.push(`job "${jobName}" 缺少 steps`);
  }
  return problems;
}

let failed = false;
const files = readdirSync(DIR).filter((f) => /\.(yml|yaml)$/.test(f)).sort();

for (const f of files) {
  const p = join(DIR, f);
  let doc;
  try {
    const raw = readFileSync(p, 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) problemsNote(f, '含 BOM，建议去除');
    doc = load(raw);
  } catch (e) {
    failed = true;
    console.error(`❌ ${f}: YAML 解析失败 → ${e.message}`);
    continue;
  }
  const probs = checkStructure(doc, f);
  if (probs.length) {
    failed = true;
    console.error(`❌ ${f}: 结构问题\n   - ${probs.join('\n   - ')}`);
  } else {
    console.log(`✅ ${f}`);
  }
}

function problemsNote(file, msg) {
  console.warn(`⚠ ${file}: ${msg}`);
}

if (failed) {
  console.error('\n工作流预检未通过，请修复后再提交。');
  process.exit(1);
}
console.log(`\n工作流预检通过（${files.length} 个文件）`);