#!/usr/bin/env node
// PostToolUse hook: after Claude writes/edits a .js file, run the ESLint that
// belongs to that file's project. Lint errors are sent back to Claude (exit 2)
// so it fixes them; warnings, non-JS files and projects without ESLint pass.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// Walk up from the edited file to the nearest directory with ESLint installed.
function findProjectWithEslint(startDir) {
  let dir = startDir;
  while (true) {
    const eslintBin = path.join(dir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (fs.existsSync(eslintBin)) return { dir, eslintBin };
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let input;
try {
  input = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const filePath = input.tool_input && input.tool_input.file_path;
if (!filePath || !/\.(c|m)?js$/.test(filePath) || !fs.existsSync(filePath)) {
  process.exit(0);
}

const project = findProjectWithEslint(path.dirname(path.resolve(filePath)));
if (!project) process.exit(0);

const result = spawnSync(
  process.execPath,
  [project.eslintBin, '--no-warn-ignored', '--format', 'stylish', path.resolve(filePath)],
  { cwd: project.dir, encoding: 'utf8' }
);

// ESLint exit codes: 0 = clean (or warnings only), 1 = lint errors, 2 = config/crash.
if (result.status === 1) {
  process.stderr.write(
    `ESLint found errors in ${filePath} — please fix them:\n${result.stdout}${result.stderr}`
  );
  process.exit(2);
}
process.exit(0);
