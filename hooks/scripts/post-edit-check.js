#!/usr/bin/env node
// PostToolUse hook: after Write/Edit on a route, store, or test file, run that
// project's test suite and surface the result. Never blocks the session —
// always exits 0, even if the tests fail or nothing applicable was touched.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findPackageRoot(startDir) {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input || '{}');
    const filePath = event.tool_input && event.tool_input.file_path;

    if (!filePath || !filePath.endsWith('.js')) process.exit(0);
    if (!/[/\\](routes|db|tests)[/\\]/.test(filePath)) process.exit(0);

    const root = findPackageRoot(path.dirname(filePath));
    if (!root) process.exit(0);

    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (!pkg.scripts || !pkg.scripts.test) process.exit(0);

    const result = spawnSync('npm', ['test', '--silent'], { cwd: root, encoding: 'utf8' });
    const ok = result.status === 0;
    console.log(`[api-quality-kit] npm test after editing ${path.basename(filePath)}: ${ok ? 'passing' : 'FAILING'}`);
    if (!ok) {
      const tail = (result.stdout + result.stderr).trim().split('\n').slice(-15).join('\n');
      console.log(tail);
    }
  } catch (e) {
    // Never fail the hook itself — this is a convenience signal, not a gate.
  }
  process.exit(0);
});
