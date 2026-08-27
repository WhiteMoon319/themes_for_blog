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
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function checkStructure(doc) {
  const problems = [];
  if (!isPlainObject(doc)) return ['工作流顶层必须为对象'];
  if (!isPlainObject(doc.jobs) || Object.keys(doc.jobs).length === 0) {
    problems.push('缺少 jobs（必须为非空对象）');
  }
  for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
    if (!isPlainObject(job)) { problems.push(`job "${jobName}" 必须为对象`); continue; }
    const ro = job['runs-on'];
    if (ro === undefined || ro === null || ro === '') problems.push(`job "${jobName}" 缺少/空 runs-on`);
    if (!Array.isArray(job.steps) || job.steps.length === 0) problems.push(`job "${jobName}" 缺少 steps（非空数组）`);
    for (const [i, s] of (job.steps ?? []).entries()) {
      if (!isPlainObject(s)) { problems.push(`job "${jobName}" steps[${i}] 非对象`); continue; }
      if (!s.uses && !s.run && !s.if && !s.env && !s.with && !s.name) {
        problems.push(`job "${jobName}" steps[${i}] 既无 uses 也无 run`);
      }
    }
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
  const probs = checkStructure(doc);
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