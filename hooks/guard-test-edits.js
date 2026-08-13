#!/usr/bin/env node
'use strict';

// PreToolUse hook: blocks Edit/Write against course-api/tests/ so no agent
// (including quality-fixer) can rewrite tests to make them pass.

let raw = '';

process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    // Unparseable input — nothing safe to check, allow the call through.
    process.exit(0);
  }

  const toolName = input && input.tool_name;
  if (toolName !== 'Edit' && toolName !== 'Write') {
    process.exit(0);
  }

  const toolInput = (input && input.tool_input) || {};
  const candidates = [toolInput.file_path, toolInput.path, toolInput.notebook_path];
  const filePath = candidates.find((v) => typeof v === 'string' && v.length > 0) || '';
  const normalized = filePath.replace(/\\/g, '/');

  if (/(^|\/)course-api\/tests\//.test(normalized)) {
    console.error(
      `Blocked: ${toolName} on "${filePath}" is not allowed. ` +
      'Files under course-api/tests/ are protected by the api-quality-flow plugin — ' +
      'agents must report test problems instead of editing tests directly.'
    );
    process.exit(2);
  }

  process.exit(0);
});
