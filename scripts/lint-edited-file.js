// PostToolUse hook: after Claude writes or edits a .js file, run the project's own
// ESLint with --fix on it. Unfixable problems exit 2 so Claude sees them and fixes them.
// Files in projects without ESLint installed are skipped silently.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function findEslint(startDir) {
  let dir = startDir;
  for (;;) {
    const bin = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (fs.existsSync(bin)) return { bin, root: dir };
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !filePath.endsWith('.js') || filePath.includes('node_modules')) {
    process.exit(0);
  }

  const eslint = findEslint(path.dirname(path.resolve(filePath)));
  if (!eslint) process.exit(0);

  const result = spawnSync(process.execPath, [eslint.bin, '--fix', filePath], {
    cwd: eslint.root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(`ESLint found problems in ${filePath}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
  process.exit(0);
});
