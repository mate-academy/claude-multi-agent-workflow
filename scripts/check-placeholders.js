#!/usr/bin/env node
// PostToolUse hook: after a localized file (name.<locale>.ext) is written, verify
// that its placeholders match the source file (name.ext). Exit 2 sends the problem
// back to Claude; any other case exits 0 silently.
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = /\{\{[^}]+\}\}|\{[^{}\s]+\}|%(?:\d+\$)?[sdif]/g;

function placeholders(text) {
  return (text.match(PLACEHOLDER) || []).sort();
}

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(input).tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!file) process.exit(0);

  const m = path.basename(file).match(/^(.+)\.([a-z]{2,3}-[A-Z]{2})(\.[^.]+)$/);
  if (!m) process.exit(0);

  const source = path.join(path.dirname(file), m[1] + m[3]);
  if (!fs.existsSync(file) || !fs.existsSync(source)) process.exit(0);

  const want = placeholders(fs.readFileSync(source, 'utf8'));
  const got = placeholders(fs.readFileSync(file, 'utf8'));
  if (want.join('\u0000') === got.join('\u0000')) process.exit(0);

  const missing = want.filter((p) => !got.includes(p));
  const extra = got.filter((p) => !want.includes(p));
  console.error(
    `Placeholder mismatch in ${path.basename(file)} (locale ${m[2]}) vs ${path.basename(source)}:` +
      (missing.length ? `\n  missing: ${missing.join(' ')}` : '') +
      (extra.length ? `\n  unexpected: ${extra.join(' ')}` : '') +
      '\nPlaceholders must stay identical to the source. Please fix.'
  );
  process.exit(2);
});
