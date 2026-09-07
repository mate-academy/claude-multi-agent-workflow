#!/usr/bin/env node
// PostToolUse hook: after Edit/Write, lint the file that was just changed
// and surface any errors back to Claude so they get fixed immediately.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload && payload.tool_input && payload.tool_input.file_path;
  if (!filePath || !/\.(js|jsx|ts|tsx)$/.test(filePath) || !fs.existsSync(filePath)) {
    process.exit(0);
  }

  // Walk up from the changed file to find the nearest ESLint config.
  let dir = path.dirname(path.resolve(filePath));
  let projectRoot = null;
  while (true) {
    const hasConfig = ['eslint.config.js', '.eslintrc.json', '.eslintrc.js', '.eslintrc'].some(
      (name) => fs.existsSync(path.join(dir, name))
    );
    if (hasConfig) {
      projectRoot = dir;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  if (!projectRoot) {
    process.exit(0);
  }

  // Resolve ESLint's own entry point and run it via `node` directly — avoids
  // relying on a shell to resolve the `npx`/`eslint` .cmd shims (unreliable
  // cross-platform, notably on native Windows without `shell: true`).
  // ESLint's package.json `exports` map blocks requiring `eslint/bin/eslint.js`
  // directly, so resolve the package directory instead and read its `bin`
  // field to find the real path on disk.
  let eslintBin;
  try {
    const pkgJsonPath = require.resolve('eslint/package.json', { paths: [projectRoot] });
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin && pkg.bin.eslint;
    eslintBin = binRel && path.join(path.dirname(pkgJsonPath), binRel);
    if (!eslintBin || !fs.existsSync(eslintBin)) throw new Error('not found');
  } catch {
    process.exit(0);
  }

  try {
    execFileSync(process.execPath, [eslintBin, filePath], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    process.exit(0);
  } catch (err) {
    // ESLint writes results to stdout, but only stderr is surfaced as blocking
    // feedback on exit code 2 — so print its output there for Claude to see.
    process.stderr.write(String(err.stdout || '') + String(err.stderr || ''));
    process.exit(2);
  }
});
