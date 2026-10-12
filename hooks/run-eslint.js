// PostToolUse hook: lint the file that was just edited or written.
// Reads the hook JSON from stdin, finds the nearest folder with an ESLint config,
// and runs ESLint there. Lint errors go to stderr with exit code 2 so Claude sees them.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CONFIGS = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs'];

function findProjectDir(file) {
  let dir = path.dirname(file);
  while (true) {
    if (CONFIGS.some((c) => fs.existsSync(path.join(dir, c)))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file || !/\.(js|mjs|cjs)$/.test(file)) process.exit(0);

  const projectDir = findProjectDir(path.resolve(file));
  if (!projectDir || !fs.existsSync(path.join(projectDir, 'node_modules'))) process.exit(0);

  const result = spawnSync('npx', ['eslint', file], {
    cwd: projectDir,
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout + result.stderr);
    process.exit(2);
  }
});
