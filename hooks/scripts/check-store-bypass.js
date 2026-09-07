#!/usr/bin/env node
// PostToolUse hook: fast, heuristic check for the #1 course-api convention
// violation — a route file holding/mutating its own state instead of going
// through db/store.js. Not an LLM call, so it can false-positive; it's a
// nudge toward convention-auditor, not a gate (always exits 0).

const fs = require('fs');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input || '{}');
    const filePath = payload.tool_input && payload.tool_input.file_path;

    if (!filePath || !/[\\/]routes[\\/][^\\/]+\.js$/.test(filePath)) {
      process.exit(0);
    }
    if (!fs.existsSync(filePath)) {
      process.exit(0);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const referencesStore = /require\(['"][^'"]*store['"]\)/.test(content) || /\bstore\.\w+\(/.test(content);
    const looksLikeLocalState =
      /\.push\(|\.splice\(|\.shift\(|\.unshift\(/.test(content) ||
      /^\s*(?:let|const|var)\s+\w+\s*=\s*(\[\]|\{\})\s*;/m.test(content);

    if (looksLikeLocalState && !referencesStore) {
      console.error(
        `[code-quality] ${filePath} looks like it holds or mutates state directly instead of ` +
        'going through db/store.js (this project\'s convention: all data access goes through ' +
        'db/store.js). If that\'s intentional, ignore this — otherwise run the convention-auditor ' +
        'subagent for a real check.'
      );
    }
  } catch {
    // Heuristic only — never fail the tool call over a parse error.
  }
  process.exit(0);
});
