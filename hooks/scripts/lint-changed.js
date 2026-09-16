#!/usr/bin/env node
/**
 * PostToolUse hook — lint a single JavaScript file right after Claude wrote or
 * edited it, and hand any problems straight back to the session.
 *
 * Reads the hook payload as JSON on stdin, so it works wherever the plugin is
 * installed. It stays silent unless it has something real to report - a hook
 * that talks on every edit gets ignored.
 *
 * Exit codes:
 *   0 - nothing to say (not a JS file, no ESLint in this project, or clean)
 *   2 - lint problems found; stderr is fed back to Claude as feedback
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const JS_EXTENSIONS = new Set(['.js', '.cjs', '.mjs']);
const ESLINT_CONFIGS = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintrc',
];

function quiet() {
  process.exit(0);
}

function readPayload() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Walk up from the edited file looking for the project that owns an ESLint setup. */
function findEslintProject(startDir) {
  let dir = startDir;
  while (true) {
    const hasConfig = ESLINT_CONFIGS.some((name) => fs.existsSync(path.join(dir, name)));
    if (hasConfig && fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Locate the project's own ESLint command-line entry point.
 *
 * `require.resolve('eslint/bin/eslint.js')` does not work - ESLint's "exports"
 * map only exposes a handful of subpaths, and the CLI is not one of them. The
 * package manifest is exposed, though, so resolve that and read the "bin" field
 * out of it. Returns null when ESLint is not installed in this project.
 */
function resolveEslintCli(projectDir) {
  let manifestPath;
  try {
    manifestPath = require.resolve('eslint/package.json', { paths: [projectDir] });
  } catch {
    return null;
  }

  const packageDir = path.dirname(manifestPath);
  let binField;
  try {
    binField = require(manifestPath).bin;
  } catch {
    binField = null;
  }

  const relative =
    typeof binField === 'string' ? binField : binField && binField.eslint;
  const candidates = [
    relative && path.join(packageDir, relative),
    path.join(packageDir, 'bin', 'eslint.js'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function main() {
  const payload = readPayload();
  if (!payload) quiet();

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath || !JS_EXTENSIONS.has(path.extname(filePath))) quiet();
  if (!fs.existsSync(filePath)) quiet();

  const projectDir = findEslintProject(path.dirname(path.resolve(filePath)));
  if (!projectDir) quiet();

  const eslintEntry = resolveEslintCli(projectDir);
  if (!eslintEntry) quiet(); // ESLint is not installed here - not the user's problem right now.

  const result = spawnSync(
    process.execPath,
    [eslintEntry, '--format', 'json', path.resolve(filePath)],
    { cwd: projectDir, encoding: 'utf8', timeout: 20000 }
  );

  if (result.error || !result.stdout) quiet();

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    quiet();
  }

  const messages = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const file of report) {
    errorCount += file.errorCount || 0;
    warningCount += file.warningCount || 0;
    for (const m of file.messages) {
      const level = m.severity === 2 ? 'error' : 'warning';
      const rule = m.ruleId ? ` (${m.ruleId})` : '';
      messages.push(`  ${level} ${m.line}:${m.column} ${m.message}${rule}`);
    }
  }

  if (messages.length === 0) quiet();

  const relative = path.relative(projectDir, path.resolve(filePath)) || filePath;
  console.error(
    `ESLint found ${errorCount} error(s) and ${warningCount} warning(s) in ${relative}:\n` +
      messages.join('\n') +
      '\n\nFix these in the file you just changed before moving on. ' +
      'This project treats lint output as part of the definition of done.'
  );
  process.exit(2);
}

main();
