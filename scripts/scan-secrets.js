#!/usr/bin/env node
// PostToolUse hook: after Claude writes or edits a file, scan it for
// obvious hard-coded secrets. Exit 2 feeds the message back to Claude.
const fs = require('fs');

const PATTERNS = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key ID'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key block'],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token'],
  [/sk-[A-Za-z0-9_-]{32,}/, 'API secret key'],
  [/(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i, 'hard-coded credential'],
];

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let file;
  try {
    file = JSON.parse(raw).tool_input.file_path;
  } catch {
    process.exit(0); // not our input; never block
  }
  if (!file || !fs.existsSync(file)) process.exit(0);

  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    process.exit(0);
  }

  const hits = [];
  text.split('\n').forEach((line, i) => {
    for (const [re, label] of PATTERNS) {
      if (re.test(line)) hits.push(`  line ${i + 1}: possible ${label}`);
    }
  });

  if (hits.length) {
    console.error(
      `qa-kit: ${file} may contain secrets:\n${hits.join('\n')}\n` +
        'Move them to environment variables or a secrets manager before committing.'
    );
    process.exit(2);
  }
});
