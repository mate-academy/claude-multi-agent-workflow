// PostToolUse hook: lint a JS file in course-api/ after Claude edits it.
const { spawnSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let file;
  try { file = JSON.parse(input).tool_input.file_path; } catch { return; }
  if (!file || !file.endsWith('.js')) return;
  const norm = file.split(path.sep).join('/');
  const i = norm.indexOf('/course-api/');
  if (i === -1) return;
  const apiDir = norm.slice(0, i + '/course-api'.length);
  const rel = norm.slice(i + '/course-api/'.length);
  const r = spawnSync('npx', ['eslint', rel], { cwd: apiDir, encoding: 'utf8', shell: true });
  if (r.status !== 0) {
    console.error('ESLint problems in ' + rel + ':\n' + r.stdout + r.stderr);
    process.exit(2);
  }
});
