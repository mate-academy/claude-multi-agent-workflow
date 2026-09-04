#!/usr/bin/env node
// PostToolUse hook: after a Write/Edit/MultiEdit, checks any changed route file under a
// routes/ directory against this plugin's Express conventions (see
// skills/express-api-conventions/SKILL.md). Never blocks — worst case it exits 0 silently.

let raw = '';

process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  try {
    run(raw);
  } catch {
    // Never let a hook bug break the session.
    process.exit(0);
  }
});

// In case stdin never emits 'end' fast enough in some hosts, guard with a short timeout too.
setTimeout(() => {
  try {
    run(raw);
  } catch {
    process.exit(0);
  }
}, 3000).unref();

let handled = false;

function run(payload) {
  if (handled) return;
  handled = true;

  let event;
  try {
    event = JSON.parse(payload || '{}');
  } catch {
    process.exit(0);
    return;
  }

  const filePath = event?.tool_input?.file_path;
  if (!filePath || !/\.js$/.test(filePath) || !/[\\/]routes[\\/]/.test(filePath)) {
    process.exit(0);
    return;
  }

  const fs = require('fs');
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
    return;
  }

  const findings = [];

  if (/res\s*\.\s*send\s*\(/.test(content)) {
    findings.push('uses res.send(...) — error and JSON responses should use res.json(...).');
  }

  const statusBlocks = content.match(/status\(\s*[45]\d\d\s*\)\s*\.\s*json\(\s*\{[^}]*\}/g) || [];
  for (const block of statusBlocks) {
    if (!/error\s*:/.test(block)) {
      findings.push(`a 4xx/5xx JSON response is missing an "error" key: ${block.slice(0, 60)}...`);
    }
  }

  if (/:\w+/.test(content) && !/status\(\s*404\s*\)/.test(content)) {
    findings.push('route has an :id-style param but no 404 branch for a missing record.');
  }

  if (findings.length === 0) {
    process.exit(0);
    return;
  }

  console.error(`express-api-conventions: ${filePath} may violate house conventions:`);
  for (const f of findings) console.error(`  - ${f}`);
  console.error('See skills/express-api-conventions/SKILL.md for the expected shape.');
  process.exit(2);
}
