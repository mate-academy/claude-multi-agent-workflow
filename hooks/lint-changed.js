#!/usr/bin/env node
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let filePath;
try {
  filePath = JSON.parse(fs.readFileSync(0, 'utf8')).tool_input.file_path;
} catch {
  process.exit(0);
}
if (!filePath || !/\.(js|mjs|cjs)$/.test(filePath) || !fs.existsSync(filePath)) process.exit(0);

// Walk up to the nearest package that declares eslint; skip linting if none does.
let dir = path.dirname(filePath);
let projectRoot = null;
for (;;) {
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if ({ ...pkg.dependencies, ...pkg.devDependencies }.eslint) {
        projectRoot = dir;
        break;
      }
    } catch {}
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!projectRoot) process.exit(0);

try {
  execFileSync('npx', ['--no-install', 'eslint', '--no-warn-ignored', filePath], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (e) {
  const report = [e.stdout, e.stderr].filter(Boolean).join('\n').trim();
  // eslint exits 1 for lint problems; anything else (missing binary, config error) must not block.
  if (e.status === 1 && report) {
    console.error(report);
    process.exit(2);
  }
}
