// PostToolUse hook (Write|Edit): lint the JavaScript file that was just written.
//
// Reads the hook payload from stdin, finds the nearest folder above the file that has an
// eslint.config.js and a locally installed ESLint, and runs ESLint on that one file.
// Lint errors and warnings go to stderr with exit code 2, which hands them back to Claude to fix.
// Anything that is not a JS file, or has no local ESLint setup, is skipped silently.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let payload = {};
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch (e) {
  process.exit(0);
}

const file = payload.tool_input && payload.tool_input.file_path;
if (!file || !/\.(js|cjs|mjs)$/.test(file) || !fs.existsSync(file)) process.exit(0);

// Walk up from the edited file to the nearest folder with an ESLint config.
let dir = path.dirname(path.resolve(file));
while (!fs.existsSync(path.join(dir, 'eslint.config.js'))) {
  const parent = path.dirname(dir);
  if (parent === dir) process.exit(0);
  dir = parent;
}

// Use the project's own ESLint - never download one. ESLint 9 hides its bin/ folder behind
// "exports", so find package.json (which is exported) and read the bin path from it.
let eslintBin;
try {
  const pkgPath = require.resolve('eslint/package.json', { paths: [dir] });
  const bin = require(pkgPath).bin;
  eslintBin = path.join(path.dirname(pkgPath), typeof bin === 'string' ? bin : bin.eslint);
} catch (e) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [eslintBin, file], { cwd: dir, encoding: 'utf8' });

// ESLint exits 0 when it only finds warnings, so also look at what it printed.
const report = `${result.stdout || ''}${result.stderr || ''}`.trim();
if (result.status === 0 && !report) process.exit(0);

process.stderr.write(`ESLint reported problems in ${path.relative(process.cwd(), file) || file}:\n${report}\n`);
process.exit(2);
