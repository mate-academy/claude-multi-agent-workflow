#!/usr/bin/env node
// PostToolUse hook: lint the JS file Claude just wrote or edited.
// - Reads the hook payload (JSON) from stdin.
// - Finds the nearest project that has ESLint installed and a config.
// - Exit 0: nothing to do, or the file is clean (warnings are allowed).
// - Exit 2: ESLint reported errors, or ESLint could not run (config error,
//   crash, timeout); stderr is shown to Claude so it can act on it.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const JS_EXT = new Set(['.js', '.cjs', '.mjs']);
const CONFIGS = ['eslint.config.js', 'eslint.config.cjs', 'eslint.config.mjs'];

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function findProjectRoot(startDir) {
  let dir = startDir;
  while (true) {
    const eslintBin = path.join(dir, 'node_modules', '.bin', 'eslint');
    const hasConfig = CONFIGS.some((c) => fs.existsSync(path.join(dir, c)));
    if (hasConfig && fs.existsSync(eslintBin)) return { dir, eslintBin };
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const payload = readStdin();
const input = payload.tool_input || {};
let file = input.file_path || input.path;
if (!file) process.exit(0);
if (!path.isAbsolute(file)) file = path.resolve(payload.cwd || process.cwd(), file);
if (!JS_EXT.has(path.extname(file)) || !fs.existsSync(file)) process.exit(0);
if (file.split(path.sep).includes('node_modules')) process.exit(0);

const project = findProjectRoot(path.dirname(file));
if (!project) process.exit(0); // ESLint not installed here: skip quietly.

const result = spawnSync(project.eslintBin, ['--format', 'stylish', file], {
  cwd: project.dir,
  encoding: 'utf8',
  timeout: 25000,
});

const rel = path.relative(project.dir, file);

// ESLint ran and found lint errors: send them back so Claude fixes them.
if (result.status === 1) {
  process.stderr.write(
    `ESLint found errors in ${rel}. Fix them before continuing:\n` +
      (result.stdout || result.stderr)
  );
  process.exit(2);
}

// ESLint could not finish (spawn error, timeout, crash, or exit 2 for a
// config/runtime error). Never report that as a clean result.
if (result.error || result.status !== 0) {
  const reason = result.error
    ? result.error.message
    : result.status === null
      ? `terminated by signal ${result.signal || 'unknown'}`
      : `exit code ${result.status}`;
  process.stderr.write(
    `Lint hook could not lint ${rel} (${reason}). The file was NOT verified as lint-clean.\n` +
      (result.stderr || result.stdout || '')
  );
  process.exit(2);
}

process.exit(0);
