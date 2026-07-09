#!/usr/bin/env node
// PreToolUse hook: blocks `git tag` via the Bash tool unless CHANGELOG.md
// already documents the version currently declared in the manifests.
const fs = require('fs');

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const command = payload && payload.tool_input && payload.tool_input.command;
  if (!command || !/\bgit\s+tag\b/.test(command)) {
    process.exit(0); // not tagging a release, nothing to check
  }

  let pkg = readJSON('package.json') || readJSON('.claude-plugin/plugin.json');
  const version = pkg && pkg.version;
  if (!version) {
    process.exit(0); // no version declared anywhere, nothing to enforce
  }

  let changelog;
  try {
    changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  } catch {
    console.error(`Blocking "git tag": no CHANGELOG.md found, but the manifest is at version ${version}. Run /release first.`);
    process.exit(2);
  }

  if (!changelog.includes(version)) {
    console.error(`Blocking "git tag": CHANGELOG.md has no entry for version ${version}. Run /release (or the changelog-writer subagent) before tagging.`);
    process.exit(2);
  }

  process.exit(0);
});

function readJSON(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}
