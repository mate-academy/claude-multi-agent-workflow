#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function isGitPush(command) {
  if (typeof command !== 'string') return false;
  const segments = command.split(/;|&&|\|\|/);
  return segments.some((segment) => {
    const trimmed = segment.trim();
    return /^git\s+(?:(?:-C\s+\S+|--git-dir=\S+|--work-tree=\S+|--no-pager|-c\s+\S+)\s+)*push\b/.test(
      trimmed
    );
  });
}

function hasUnreleasedContent(changelogText) {
  const lines = changelogText.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === '## [Unreleased]');
  if (startIndex === -1) return false;

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line)) break;
    if (line.trim().startsWith('-')) return true;
  }
  return false;
}

function main() {
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf8');
  } catch (e) {
    input = '';
  }

  let payload = {};
  try {
    payload = input ? JSON.parse(input) : {};
  } catch (e) {
    process.exit(0);
  }

  const command = payload.tool_input && payload.tool_input.command;
  if (!isGitPush(command)) {
    process.exit(0);
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const changelogPath = path.join(projectDir, 'course-api', 'CHANGELOG.md');

  let changelogText;
  try {
    changelogText = fs.readFileSync(changelogPath, 'utf8');
  } catch (e) {
    process.exit(0);
  }

  if (hasUnreleasedContent(changelogText)) {
    process.stderr.write(
      'Blocked: course-api/CHANGELOG.md has unreleased changes. Run /release first, then push.\n'
    );
    process.exit(2);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { isGitPush, hasUnreleasedContent };
