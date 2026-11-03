// PostToolUse hook: warn about a UTF-8 BOM or CRLF line endings in an edited file.
// Read-only: never modifies files, runs commands, or uses the network.
const fs = require('fs');
const path = require('path');

const MAX_BYTES = 1024 * 1024;
const SUPPORTED = new Set(['.js', '.json', '.md', '.ts', '.jsx', '.tsx']);
const SKIPPED_DIRS = new Set(['node_modules', '.git']);

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (e) {
    return '';
  }
}

function isInside(root, target) {
  const rel = path.relative(root, target);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function check(payload) {
  const input = payload && payload.tool_input;
  const filePath = input && input.file_path;
  if (typeof filePath !== 'string' || !filePath) return;

  if (!SUPPORTED.has(path.extname(filePath).toLowerCase())) return;

  const base = process.env.CLAUDE_PROJECT_DIR || (typeof payload.cwd === 'string' && payload.cwd) || process.cwd();
  const root = fs.realpathSync(base);
  const target = fs.realpathSync(path.resolve(base, filePath));

  if (!isInside(root, target)) return;
  if (path.relative(root, target).split(path.sep).some((s) => SKIPPED_DIRS.has(s))) return;

  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.size > MAX_BYTES) return;

  const buf = fs.readFileSync(target);
  const rel = path.relative(root, target);
  const issues = [];
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    issues.push('UTF-8 BOM');
  }
  if (buf.includes('\r\n')) {
    issues.push('CRLF line endings');
  }
  if (issues.length) {
    console.log('qa-check warning: ' + rel + ' has ' + issues.join(' and ') + '.');
  }
}

try {
  const raw = readStdin();
  if (raw.trim()) check(JSON.parse(raw));
} catch (e) {
  // Invalid input or unreadable file: stay silent and never block the tool call.
}
process.exit(0);
