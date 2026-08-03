// api-qa plugin — PostToolUse hook.
// Auto-fixes lint on any .js file Claude edits or writes, using the ESLint
// installed in the project being worked on. No-ops when the project has no
// ESLint. Exits 2 (blocking feedback) if unfixable errors remain, so Claude
// sees the report and fixes the code.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

let payload;
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^﻿/, ''));
} catch {
  process.exit(0);
}

const file = payload.tool_input && payload.tool_input.file_path;
if (!file || !file.endsWith('.js') || file.includes('node_modules')) {
  process.exit(0);
}

// Find the nearest node_modules/eslint upward from the edited file.
let dir = path.dirname(path.resolve(file));
let eslintBin = null;
while (true) {
  const candidate = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (fs.existsSync(candidate)) {
    eslintBin = candidate;
    break;
  }
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}
if (!eslintBin || !fs.existsSync(file)) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [eslintBin, '--fix', file], {
  encoding: 'utf8',
  cwd: dir,
});

if (result.status !== 0) {
  console.error(`ESLint found problems it could not auto-fix in ${file}:\n${result.stdout || result.stderr}`);
  process.exit(2);
}
process.exit(0);
