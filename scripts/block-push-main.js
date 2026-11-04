#!/usr/bin/env node
// PreToolUse hook: block `git push` to main. Reads the tool input JSON from stdin.
// Exit 2 (with a message on stderr) blocks the call; exit 0 allows it.
const { execSync } = require('node:child_process');

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

// True if a single shell command (no ; && || | separators) pushes to main.
function pushesToMain(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  const gitAt = tokens.indexOf('git');
  if (gitAt === -1) return false;
  const pushAt = tokens.indexOf('push', gitAt + 1);
  if (pushAt === -1) return false;

  // Positional args after `push`: first is the remote, the rest are refspecs.
  const positional = tokens.slice(pushAt + 1).filter((t) => !t.startsWith('-'));
  const refspecs = positional.slice(1);

  if (refspecs.length === 0) {
    // Bare `git push` / `git push origin` pushes the current branch.
    return currentBranch() === 'main';
  }
  // Matches `main`, `+main`, `HEAD:main`, `HEAD:refs/heads/main`, `refs/heads/main`.
  return refspecs.some((r) => /(^|[:+/])main$/.test(r));
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(input).tool_input?.command ?? '';
  } catch {
    process.exit(0); // not valid JSON: don't get in the way
  }

  const blocked = command.split(/&&|\|\||[;|\n]/).some(pushesToMain);
  if (blocked) {
    console.error('Blocked: pushing to main is not allowed. Push a feature branch and open a pull request.');
    process.exit(2);
  }
  process.exit(0);
});
