// PostToolUse hook: lint JS files right after Claude edits them.
// Exit 2 with ESLint output on stderr so Claude sees and fixes the problems.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let file;
  try { file = JSON.parse(input).tool_input.file_path; } catch { process.exit(0); }
  if (!file || !/\.(js|mjs|cjs)$/.test(file) || !fs.existsSync(file)) process.exit(0);

  let dir = path.dirname(path.resolve(file));
  while (!fs.existsSync(path.join(dir, 'eslint.config.js'))) {
    const parent = path.dirname(dir);
    if (parent === dir) process.exit(0);
    dir = parent;
  }

  const res = spawnSync('npx', ['--no-install', 'eslint', file], { cwd: dir, encoding: 'utf8' });
  if (res.status !== 0) {
    process.stderr.write((res.stdout || '') + (res.stderr || ''));
    process.exit(2);
  }
  process.exit(0);
});
