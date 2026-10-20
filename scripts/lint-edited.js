// PostToolUse hook: lint the .js file Claude just edited with the project's own ESLint.
// Exit 0 when clean or not applicable; exit 2 with the lint output so Claude sees and fixes it.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath || !/\.(c|m)?js$/.test(filePath) || filePath.includes('node_modules')) {
    process.exit(0);
  }

  // Walk up from the edited file to the nearest folder with ESLint installed.
  let dir = path.dirname(path.resolve(filePath));
  let eslintBin = null;
  while (true) {
    const candidate = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (fs.existsSync(candidate)) { eslintBin = candidate; break; }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (!eslintBin) process.exit(0);

  const result = spawnSync(process.execPath, [eslintBin, path.resolve(filePath)], {
    cwd: dir,
    encoding: 'utf8',
  });
  if (result.status === 1) {
    process.stderr.write('ESLint found problems in ' + filePath + ':\n' + result.stdout);
    process.exit(2);
  }
  process.exit(0);
});
