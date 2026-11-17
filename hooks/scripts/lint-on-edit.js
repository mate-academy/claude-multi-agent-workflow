#!/usr/bin/env node
// PostToolUse hook for the api-quality plugin.
//
// Reads the hook payload from stdin. If Claude just wrote or edited a
// .js/.cjs/.mjs file inside a project that has its own ESLint setup, runs that
// project's ESLint on the file. Lint *errors* are sent back to Claude
// (exit code 2 + stderr) so it fixes them right away; warnings and anything
// outside an ESLint project are ignored (exit 0). The hook never blocks on its
// own failures.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ESLINT_CONFIGS = [
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.mjs',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc',
];

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// Walk up from the file to the nearest directory that has an ESLint config
// and a locally installed eslint binary.
function findProjectRoot(startDir) {
  let dir = startDir;
  for (;;) {
    const hasConfig = ESLINT_CONFIGS.some((f) => fs.existsSync(path.join(dir, f)));
    if (hasConfig) {
      const bin = path.join(dir, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
      return fs.existsSync(bin) ? { dir, bin } : null;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readStdin() || '{}');
  } catch {
    return 0;
  }

  const input = payload.tool_input || {};
  let file = input.file_path || input.path;
  if (!file || !/\.(c|m)?js$/.test(file)) return 0;
  if (!path.isAbsolute(file)) file = path.resolve(payload.cwd || process.cwd(), file);
  if (!fs.existsSync(file) || file.includes(`${path.sep}node_modules${path.sep}`)) return 0;

  const project = findProjectRoot(path.dirname(file));
  if (!project) return 0;

  const result = spawnSync(project.bin, ['--no-warn-ignored', '--quiet', file], {
    cwd: project.dir,
    encoding: 'utf8',
    timeout: 25000,
  });

  if (result.error) return 0; // ESLint could not run — don't get in Claude's way.
  if (result.status === 1) {
    const rel = path.relative(project.dir, file);
    process.stderr.write(
      `ESLint found errors in ${rel} after your edit. Fix them before moving on:\n` +
        (result.stdout || result.stderr).trim() + '\n',
    );
    return 2;
  }
  return 0;
}

process.exit(main());
