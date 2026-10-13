// PostToolUse hook: lint a JS file right after Claude writes or edits it.
// Reads the hook payload from stdin. Exits 2 with the lint output on stderr
// so Claude sees the problems and can fix them; exits 0 otherwise.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(raw).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !file.endsWith('.js') || !fs.existsSync(file)) process.exit(0);

  // Find the nearest directory above the file that has an ESLint config.
  let dir = path.dirname(path.resolve(file));
  while (!fs.existsSync(path.join(dir, 'eslint.config.js'))) {
    const parent = path.dirname(dir);
    if (parent === dir) process.exit(0);
    dir = parent;
  }

  // Skip silently if the project hasn't installed ESLint (no npm install yet).
  const eslintBin = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(eslintBin)) process.exit(0);

  const result = spawnSync(process.execPath, [eslintBin, path.resolve(file)], {
    cwd: dir,
    encoding: 'utf8',
  });
  if (result.status === 1) {
    process.stderr.write(result.stdout || result.stderr);
    process.exit(2);
  }
  process.exit(0);
});
