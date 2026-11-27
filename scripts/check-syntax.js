// PostToolUse hook: check the syntax of the file that was just edited or written.
// Exit code 2 sends the message on stderr back to Claude so it can fix the file.
// The checks only parse the file; they never run it.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// These .json files may contain comments, which JSON.parse rejects.
const JSON_WITH_COMMENTS = [
  /(^|[\\/])\.vscode[\\/]/, // VS Code settings
  /(^|[\\/])(tsconfig|jsconfig)[^\\/]*\.json$/, // TypeScript and JavaScript projects
  /(^|[\\/])\.?devcontainer\.json$/, // dev containers
  /(^|[\\/])\.eslintrc\.json$/, // ESLint
  /(^|[\\/])turbo\.json$/, // Turborepo
];
const BYTE_ORDER_MARK = /^﻿/;
// CommonJS parse errors that suggest the file is really an ES module.
const ESM_HINTS = /^SyntaxError: (Cannot use import statement|Unexpected token 'export'|Cannot use 'import\.meta'|await is only valid|Unexpected reserved word)/m;
const JSX_ERROR = /^SyntaxError: Unexpected token '<'\r?$/m;
const FLOW_PRAGMA = /^\s*(\/\/|\/?\*).*@flow\b/m;
const ENABLES_EXTGLOB = /^[^#\n]*\bshopt\s+-s\b[^#;\n]*\bextglob\b/m;
// Syntax that needs bash 4 or later: ;& ;;& |& &>> and coproc.
const BASH_4_SYNTAX = /;&|\|&|&>>|\bcoproc\b/;

// Run a checker and return its error output, or null if it passed or is not installed.
function run(command, args, input) {
  const result = spawnSync(command, args, { encoding: 'utf8', input });
  if (result.error || result.status === 0) return null;
  return result.stderr.trim();
}

function checkJSON(file) {
  if (JSON_WITH_COMMENTS.some((pattern) => pattern.test(file))) return null;
  try {
    JSON.parse(fs.readFileSync(file, 'utf8').replace(BYTE_ORDER_MARK, ''));
    return null;
  } catch (error) {
    return error.message;
  }
}

function isOldBash() {
  const result = spawnSync('bash', ['-c', 'echo "$BASH_VERSINFO"'], { encoding: 'utf8' });
  return Number(result.stdout) < 4;
}

function checkShell(file) {
  const source = fs.readFileSync(file, 'utf8');
  const firstLine = source.split('\n', 1)[0];
  // bash cannot reliably parse scripts written for other shells.
  if (/^#!.*\b(zsh|fish)\b/.test(firstLine)) return null;
  // bash -n does not run shopt, so enable extglob here if the script does.
  const options = ENABLES_EXTGLOB.test(source) ? ['-O', 'extglob'] : [];
  const problem = run('bash', [...options, '-n', file]);
  // Old versions, such as the bash 3.2 on macOS, reject valid newer syntax.
  if (problem && BASH_4_SYNTAX.test(problem) && isOldBash()) return null;
  return problem;
}

// The "type" field of the nearest package.json, if there is one.
function packageType(file) {
  let directory = path.dirname(path.resolve(file));
  for (;;) {
    try {
      return JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')).type;
    } catch (error) {
      if (error.code !== 'ENOENT') return undefined;
    }
    if (directory === path.dirname(directory)) return undefined;
    directory = path.dirname(directory);
  }
}

// A .js file may be CommonJS or an ES module, and may contain JSX or Flow.
function checkJS(file) {
  const source = fs.readFileSync(file, 'utf8').replace(BYTE_ORDER_MARK, '');
  // Name the type explicitly: node --check can pass a broken file when it has to guess.
  const parseAs = (type) => run(process.execPath, [`--input-type=${type}`, '--check'], source);
  let problem = parseAs(packageType(file) === 'module' ? 'module' : 'commonjs');
  if (problem && ESM_HINTS.test(problem)) problem = parseAs('module');
  // Node cannot parse JSX or Flow, so do not report errors that they can cause.
  if (problem && (JSX_ERROR.test(problem) || FLOW_PRAGMA.test(source))) return null;
  return problem;
}

// The .cjs and .mjs extensions state the module type, so check these strictly.
const checkJavaScript = (file) => run(process.execPath, ['--check', file]);

const CHECKS = {
  '.js': checkJS,
  '.cjs': checkJavaScript,
  '.mjs': checkJavaScript,
  '.json': checkJSON,
  '.sh': checkShell,
  '.bash': checkShell,
};

function editedFile() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8')).tool_input.file_path;
  } catch {
    return null;
  }
}

const file = editedFile();
const check = file && CHECKS[path.extname(file)];

if (check && fs.existsSync(file)) {
  const problem = check(file);
  if (problem) {
    console.error(`Syntax check failed for ${file}:\n${problem}`);
    process.exitCode = 2;
  }
}
