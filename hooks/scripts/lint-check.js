#!/usr/bin/env node
// Lints a just-edited course-api file and surfaces any problems back to Claude.
const { execSync } = require('node:child_process');
const path = require('node:path');

const projectDir = process.argv[2];

let input = '';
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  if (input.charCodeAt(0) === 0xfeff) {
    input = input.slice(1);
  }

  let filePath;
  try {
    const payload = JSON.parse(input);
    filePath = payload.tool_input && payload.tool_input.file_path;
  } catch {
    process.exit(0);
  }

  if (!projectDir || !filePath || !filePath.endsWith('.js') || !filePath.includes('course-api')) {
    process.exit(0);
  }

  const courseApiDir = path.join(projectDir, 'course-api');

  try {
    execSync(`npx eslint "${filePath}"`, { cwd: courseApiDir, stdio: 'pipe' });
  } catch (err) {
    const output = `${err.stdout || ''}${err.stderr || ''}` || err.message;
    process.stderr.write(`ESLint found issues in ${filePath}:\n${output}\n`);
    process.exit(2);
  }
});
