#!/usr/bin/env node
/**
 * lint-check.js — lightweight code quality checks for the code-quality-guard plugin.
 * Invoked by the file-edited hook via ${CLAUDE_PLUGIN_ROOT}/scripts/lint-check.js.
 * No hardcoded paths: operates on the file passed via CLAUDE_FILE (if set)
 * or scans .js/.ts files in the current directory tree.
 */
const fs = require('fs');
const path = require('path');

const target = process.env.CLAUDE_FILE || '.';
const issues = [];

function checkFile(file) {
  let lines;
  try {
    lines = fs.readFileSync(file, 'utf8').split('\n');
  } catch (e) {
    return;
  }
  lines.forEach((line, i) => {
    if (/ +$/.test(line)) {
      issues.push(`${file}:${i + 1}: trailing whitespace`);
    }
    if (line.length > 120) {
      issues.push(`${file}:${i + 1}: line exceeds 120 chars (${line.length})`);
    }
  });
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(js|ts|jsx|tsx)$/.test(entry.name)) checkFile(full);
  }
}

if (fs.existsSync(target) && fs.statSync(target).isFile()) {
  checkFile(target);
} else {
  walk(target);
}

if (issues.length) {
  console.log('⚠ Code quality issues found:');
  issues.forEach((i) => console.log(`  ${i}`));
} else {
  console.log('✓ No basic quality issues found.');
}
