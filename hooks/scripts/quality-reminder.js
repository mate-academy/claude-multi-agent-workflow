#!/usr/bin/env node
// PostToolUse hook for Edit|Write: reminds Claude to validate changed code.

const message = [
  'Code quality reminder: you just changed a file.',
  "Before you finish, validate the change with the project's existing checks:",
  'tests, linting, formatting, type checking, or build, whichever the project defines',
  '(see package.json scripts, a Makefile, or the README).',
  'Run the ones relevant to the changed files, fix any failures you caused,',
  'and say what you ran. If the project has no checks, say that instead of claiming the code is verified.',
].join(' ');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: message,
    },
  })
);
