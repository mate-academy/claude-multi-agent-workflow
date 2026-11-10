#!/usr/bin/env node
// PostToolUse hook (Write|Edit): flags leftover debug statements in edited JS files.
// Exit 2 sends the message back to Claude so it fixes the file; exit 0 stays silent.
const fs = require('fs');
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let file = '';
  try {
    file = JSON.parse(raw).tool_input.file_path || '';
  } catch {
    process.exit(0);
  }
  if (!/\.js$/.test(file) || /[\\/]tests?[\\/]/.test(file) || !fs.existsSync(file)) process.exit(0);
  const hits = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => /\bconsole\.debug\(|\bdebugger\b/.test(l));
  if (hits.length) {
    console.error(`Leftover debug code in ${file}: ` + hits.map(([n]) => 'line ' + n).join(', ') + '. Remove it.');
    process.exit(2);
  }
  process.exit(0);
});
