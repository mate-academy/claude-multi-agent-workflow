#!/usr/bin/env node
// PostToolUse hook: after an Edit/Write inside course-api/, re-run lint and
// surface the result so lint issues show up right after the edit that caused them.
const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload = {};
  try { payload = JSON.parse(input); } catch { /* no stdin payload, nothing to check */ }

  const filePath = (payload.tool_input && payload.tool_input.file_path) || '';
  if (!filePath.includes('course-api')) process.exit(0);

  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
  if (!pluginRoot) process.exit(0);
  const apiDir = path.join(pluginRoot, 'course-api');

  try {
    execSync('npm run lint --silent', { cwd: apiDir, stdio: 'pipe' });
    console.log('api-conventions hook: lint clean after edit to ' + filePath);
  } catch (err) {
    const output = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
    console.log('api-conventions hook: lint found issues after edit to ' + filePath + '\n' + output);
  }
  process.exit(0);
});
