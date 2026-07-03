#!/usr/bin/env node
// GQPlug PostToolUse hook: after a Write/Edit, lint the course API so quality
// problems surface immediately instead of at the quality gate. Non-blocking:
// it reports findings but always exits 0 so it never interrupts the workflow.
//
// Reads the tool-use payload on stdin; only runs when the edited file is under
// course-api/. Resolved via ${CLAUDE_PLUGIN_ROOT} so the path works wherever
// the plugin installs.

const { execSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const payload = JSON.parse(input || '{}');
    filePath = payload?.tool_input?.file_path || '';
  } catch {
    // No/!JSON payload — nothing to scope on; exit quietly.
    process.exit(0);
  }

  if (!filePath.replace(/\\/g, '/').includes('course-api/')) {
    process.exit(0); // Edit outside the API — don't lint.
  }

  try {
    execSync('npm run lint', { cwd: 'course-api', stdio: 'pipe' });
    console.log('GQPlug: course-api lint clean ✓');
  } catch (err) {
    const out = (err.stdout || '').toString() + (err.stderr || '').toString();
    console.error('GQPlug: lint found issues after your edit:\n' + out.trim());
  }
  process.exit(0); // Advisory only — never block the edit.
});
