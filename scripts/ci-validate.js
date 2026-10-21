#!/usr/bin/env node
'use strict';

// 轻量静态校验（CI 用）：
// 1) 对所有 .js 跑 `node --check`（仅语法，不执行，兼容 wx/App/Page/Component 全局）。
// 2) 解析所有 .json 校验合法性（无注释、双引号、无尾随逗号）。
// 3) 粗筛可能泄露的密钥/令牌（仅告警，不阻断）。
//
// 设计原则：不依赖第三方包、不下载网络资源、不在仓库里执行微信相关构建，
// 因此零密钥、可在公开仓库安全运行。

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const excludeDirs = new Set(['.git', 'node_modules', 'miniprogram_npm', '.github']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs.has(entry.name)) continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const all = walk(root, []);
const jsFiles = all.filter((f) => f.endsWith('.js'));
const jsonFiles = all.filter((f) => f.endsWith('.json'));

let failed = false;

// 1) JS 语法检查
for (const f of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    console.log('OK   syntax  ' + path.relative(root, f));
  } catch (e) {
    failed = true;
    console.error('FAIL syntax  ' + path.relative(root, f));
    console.error((e.stderr || e.stdout || '').toString());
  }
}

// 2) JSON 合法性检查
for (const f of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log('OK   json    ' + path.relative(root, f));
  } catch (e) {
    failed = true;
    console.error('FAIL json    ' + path.relative(root, f) + ' -> ' + e.message);
  }
}

// 3) 密钥/令牌泄露粗筛（仅告警，不阻断）
const secretPatterns = [
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /cloud:\/\/[^"' ]+\.file\.myqcloud\.com/,
];
for (const f of all) {
  if (/\.(png|jpe?g|gif|pdf|woff2?|ttf|ico)$/i.test(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  for (const re of secretPatterns) {
    if (re.test(text)) {
      console.warn('WARN possible secret/key material in ' + path.relative(root, f));
    }
  }
}

if (failed) {
  console.error('\nCI 校验未通过');
  process.exit(1);
}

console.log(
  '\nCI 校验通过：JS 语法 ' + jsFiles.length + ' 个，JSON 合法性 ' + jsonFiles.length + ' 个'
);
