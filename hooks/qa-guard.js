#!/usr/bin/env node
// PreToolUse guard for the qa-checklist plugin.
//
// 1. Claude must not change code: Edit/Write/MultiEdit/NotebookEdit on a file
//    inside the project's git repository is blocked, unless the file is a QA
//    report under a `qa-checklists/` folder. Files outside the repository
//    (temporary files, Claude's own memory) are not affected.
// 2. Bash commands that change files in the repository in place
//    (sed -i, perl -i, redirection into a repo file, git apply/restore/checkout --)
//    are blocked the same way.
// 3. On main/master: git commit, push, merge, rebase, reset, cherry-pick, revert
//    and am are blocked. A push that targets main/master is blocked from any branch.
//
// Exit code 2 blocks the tool call and shows the stderr message to Claude.
// Any unexpected error lets the call through (fail open), so a broken guard
// never locks the session.

const { execFileSync } = require('child_process');
const path = require('path');

const PROTECTED_BRANCHES = new Set(['main', 'master']);
const REPORT_DIR = 'qa-checklists';

function block(reason) {
  process.stderr.write('qa-checklist guard: ' + reason + '\n');
  process.exit(2);
}

function git(cwd, args) {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function isInside(child, parent) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function isReport(file) {
  return file.split(path.sep).includes(REPORT_DIR);
}

// Returns a reason string if writing `target` would change code in the repo.
function codeWriteReason(target, cwd, repoRoot) {
  if (!repoRoot) return null;
  const abs = path.resolve(cwd, target);
  if (!isInside(abs, repoRoot)) return null;
  if (isReport(abs)) return null;
  return (
    'changing code is not allowed (' + path.relative(repoRoot, abs) + '). ' +
    'This plugin only analyzes code and writes QA reports to ' + REPORT_DIR + '/. ' +
    'Describe the change for the developer instead of making it.'
  );
}

function checkFileTool(input, cwd, repoRoot) {
  const target = input.file_path || input.notebook_path;
  if (!target) return;
  const reason = codeWriteReason(target, cwd, repoRoot);
  if (reason) block(reason);
}

function checkBash(command, cwd, repoRoot, branch) {
  // Git operations that change history or the remote — forbidden on main.
  const gitOp = /\bgit\b(?:\s+(?:-[cC]\s+\S+|--?[\w-]+(?:=\S+)?))*\s+(commit|push|merge|rebase|reset|cherry-pick|revert|am)\b/;
  const m = command.match(gitOp);
  if (m) {
    if (branch && PROTECTED_BRANCHES.has(branch)) {
      block('"git ' + m[1] + '" is not allowed on the ' + branch + ' branch. Switch to a task branch first.');
    }
    if (m[1] === 'push' && /(^|[\s:+])(main|master)\b/.test(command.slice(m.index))) {
      block('pushing to main/master is not allowed.');
    }
  }

  if (!repoRoot) return;

  // In-place edits and working-tree rewrites.
  if (/\b(sed|perl)\b[^|;&]*\s-[a-zA-Z]*i/.test(command)) {
    block('in-place file edits (sed -i / perl -i) are not allowed. This plugin does not change code.');
  }
  if (/\bgit\b[^|;&]*\s(apply|restore)\b/.test(command) || /\bgit\b[^|;&]*\scheckout\b[^|;&]*\s--\s/.test(command)) {
    block('git apply/restore/checkout -- change files in the working tree and are not allowed.');
  }

  // Redirection into a file inside the repository.
  const redirect = /(?:^|[^0-9&<>])(?:[0-9]?>>?|&>)\s*("[^"]+"|'[^']+'|[^\s;&|<>()]+)/g;
  let r;
  while ((r = redirect.exec(command)) !== null) {
    const target = r[1].replace(/^["']|["']$/g, '');
    if (target.startsWith('&') || target === '/dev/null' || target.startsWith('/dev/')) continue;
    const reason = codeWriteReason(target, cwd, repoRoot);
    if (reason) block(reason);
  }
}

function main(raw) {
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return;
  }
  const tool = event.tool_name;
  const input = event.tool_input || {};
  const cwd = event.cwd || process.cwd();
  const repoRoot = git(cwd, ['rev-parse', '--show-toplevel']);
  const resolvedRoot = repoRoot ? path.resolve(repoRoot) : null;

  if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    checkFileTool(input, cwd, resolvedRoot);
  } else if (tool === 'Bash' && typeof input.command === 'string') {
    const branch = resolvedRoot ? git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']) : null;
    checkBash(input.command, cwd, resolvedRoot, branch);
  }
}

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  try {
    main(data);
  } catch {
    // fail open
  }
  process.exit(0);
});
