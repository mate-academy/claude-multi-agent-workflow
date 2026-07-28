# Code Quality Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Claude Code plugin, `code-quality`, at the repo root — two scoped subagents, a workflow command with a parallel step and a dependent step, a skill, a hook, and a marketplace listing — validated against `.github/scripts/validate-plugin.js` and tested locally against `course-api/`.

**Architecture:** Pure declarative plugin: Markdown files with YAML frontmatter for agents/commands/skills, JSON for manifests, one small Node script for the hook. No build step. Everything lives at the repo root next to the existing `course-api/` directory.

**Tech Stack:** Claude Code plugin format (`.claude-plugin/plugin.json`, `agents/`, `commands/`, `skills/`, `hooks/`), Node.js (hook script only, no dependencies beyond what's already in `course-api/`).

## Global Constraints

- Only `plugin.json` (and `marketplace.json`) live inside `.claude-plugin/`; `agents/`, `commands/`, `skills/`, `hooks/` sit at the repo root. (spec: Task 1)
- At least 2 agents in `agents/`, each with `name`, `description`, `tools`, `model` in frontmatter; at least one read-only (`tools` ⊆ Read/Grep/Glob) and at least one that writes (`tools` includes Write or Edit). (spec: Task 2)
- Workflow command must have one parallel step and one dependent step, written in plain language. (spec: Task 3)
- Hook (`hooks/hooks.json`) must not contain hardcoded absolute paths — use `${CLAUDE_PLUGIN_ROOT}`. (spec: Task 4)
- `marketplace.json`'s plugin entry `name` must match `plugin.json`'s `name`, and must have a `source`. (spec: Task 6)
- `NOTES.md` must be ≥200 characters and cover: install steps, one scoping decision, one orchestration decision. (spec: Task 7)
- Validation authority: `.github/scripts/validate-plugin.js` — run it locally before pushing.

---

### Task 1: Plugin manifest and directory scaffold

**Files:**
- Create: `.claude-plugin/plugin.json`

**Interfaces:**
- Produces: plugin `name: "code-quality"` — every other manifest (`marketplace.json`) must reference this exact string.

- [ ] **Step 1: Create `.claude-plugin/plugin.json`**

```json
{
  "name": "code-quality",
  "version": "0.1.0",
  "description": "Two-agent code review and fix workflow, tested against a small Express API.",
  "author": {
    "name": "Stefano"
  }
}
```

- [ ] **Step 2: Verify it's valid JSON with the required fields**

Run: `node -e "const m = require('./.claude-plugin/plugin.json'); if (!m.name || !m.version) throw new Error('missing field'); console.log('ok', m.name, m.version)"`
Expected: `ok code-quality 0.1.0`

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/plugin.json
git commit -m "Add plugin manifest"
```

---

### Task 2: Subagents — reviewer and fixer

**Files:**
- Create: `agents/code-reviewer.md`
- Create: `agents/code-fixer.md`

**Interfaces:**
- Produces: subagent names `code-reviewer` and `code-fixer` — the workflow command in Task 3 invokes both by these exact names.

- [ ] **Step 1: Create `agents/code-reviewer.md`**

```markdown
---
name: code-reviewer
description: Use to review course-api code for bugs, convention violations, and quality issues. Trigger when someone asks to "review this code", "check code quality", "find bugs", or "audit the API for problems". Read-only — produces a findings list, never edits files.
tools: Read, Grep, Glob
model: sonnet
---

You review the Express API in `course-api/` for bugs and convention
violations. You never edit files — you only read and report.

Check the code against these rules (see `skills/code-conventions` for the
full reference if it's loaded):

- Every route validates its input and returns `400` on bad input.
- Every route returns `404` when a requested record doesn't exist.
- Every error response is JSON shaped like `{ "error": "message" }`.
- All data access goes through `db/store.js` — routes never hold state
  directly.
- Route files stay one-resource-per-file, mounted in `server.js`.

Also flag ordinary bugs you notice: unhandled edge cases, incorrect status
codes, logic errors, missing null/undefined checks, anything a test would
catch.

Return your findings as a plain list, one per line, in this format:

`<file>:<line> [severity: high|medium|low] <what's wrong and why>`

If you find nothing wrong, say so explicitly — don't invent findings to
have something to report.
```

- [ ] **Step 2: Create `agents/code-fixer.md`**

```markdown
---
name: code-fixer
description: Use to apply fixes for findings from code-reviewer, or for failing `npm test`/`npm run lint` output in course-api. Trigger when there's a findings list or failing tests/lint and someone wants it fixed. Writes code and verifies with the test suite.
tools: Read, Grep, Glob, Edit, Bash
model: sonnet
---

You apply fixes in `course-api/` based on findings you're given (from
code-reviewer, from failing tests, or from lint output).

Rules:

- Fix only what's in the findings/failures you were given — don't do
  unrelated cleanup.
- Make the smallest change that resolves each finding.
- Follow the existing conventions in the file you're editing (see
  `skills/code-conventions` if it's loaded) rather than introducing a new
  style.
- Your Bash access is for running `npm test` and `npm run lint` inside
  `course-api/` to verify your fix — not for anything else.

After making your changes, run `npm test` and `npm run lint` inside
`course-api/` and report:

- what you changed, file by file, and why;
- the final test and lint result (pass/fail, with failure output if any
  remain).
```

- [ ] **Step 3: Verify frontmatter is well-formed**

Run: `node -e "const fs=require('fs'); for (const f of ['agents/code-reviewer.md','agents/code-fixer.md']) { const t=fs.readFileSync(f,'utf8'); const m=t.match(/^---\n([\s\S]*?)\n---/); if(!m) throw new Error(f+' missing frontmatter'); for (const k of ['name','description','tools','model']) if(!m[1].includes(k+':')) throw new Error(f+' missing '+k); } console.log('ok')"`
Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add agents/code-reviewer.md agents/code-fixer.md
git commit -m "Add code-reviewer and code-fixer subagents"
```

---

### Task 3: Workflow command

**Files:**
- Create: `commands/quality-check.md`

**Interfaces:**
- Consumes: subagents `code-reviewer` and `code-fixer` from Task 2 (exact names).

- [ ] **Step 1: Create `commands/quality-check.md`**

```markdown
---
description: Run the code-quality review-and-fix workflow against course-api — review and tests run together, then fixes are applied.
---

Run this workflow against `course-api/`:

1. Do these two things at the same time, since neither depends on the
   other:
   - Launch the `code-reviewer` subagent to review everything under
     `course-api/` for bugs, convention violations, and quality issues.
   - Run `npm test` and `npm run lint` inside `course-api/` and capture
     their output (pass/fail and any failure details).

2. Once both of those finish, launch the `code-fixer` subagent. Give it
   the reviewer's findings plus any failing tests or lint errors from step
   1, and have it apply the minimal fixes needed, then re-run `npm test`
   and `npm run lint` inside `course-api/` to confirm the fixes hold. This
   step has to wait for step 1 because it needs both the review findings
   and the test/lint results before it knows what to fix.

3. Summarize the run: what the reviewer found, what the fixer changed,
   and the final `npm test` / `npm run lint` result.
```

- [ ] **Step 2: Verify the command file is non-trivial**

Run: `node -e "const fs=require('fs'); const t=fs.readFileSync('commands/quality-check.md','utf8').trim(); if (t.length < 60) throw new Error('too short'); console.log('ok', t.length)"`
Expected: `ok <some number > 60>`

- [ ] **Step 3: Commit**

```bash
git add commands/quality-check.md
git commit -m "Add quality-check workflow command"
```

---

### Task 4: Skill — code conventions reference

**Files:**
- Create: `skills/code-conventions/SKILL.md`

- [ ] **Step 1: Create `skills/code-conventions/SKILL.md`**

```markdown
---
name: code-conventions
description: Documents course-api's coding conventions (input validation, error shape, data access rules) so reviews and fixes apply one explicit standard instead of ad hoc style. Use when reviewing or fixing code under course-api/.
---

# course-api conventions

Reference these rules when reviewing or fixing anything under
`course-api/`. They come from `course-api/CLAUDE.md` — this skill exists
so both `code-reviewer` and `code-fixer` apply the same standard without
re-deriving it each run.

## Structure

- One route file per resource in `routes/` (e.g. `users.js`, `health.js`),
  each exporting an Express router, mounted in `server.js` under its base
  path.
- All data access goes through `db/store.js`. Routes never hold state
  directly — no module-level arrays or objects in a route file.

## Request handling

- Validate input in the route. Missing or malformed required fields ⇒
  `400`.
- A record that doesn't exist ⇒ `404`.
- Error responses are always JSON shaped like `{ "error": "message" }` —
  never a bare string or an HTML error page.

## What counts as a real finding

Flag: missing validation, wrong status code, error responses that don't
match the `{ "error": "message" }` shape, state held outside
`db/store.js`, and ordinary bugs (unhandled edge cases, logic errors,
missing null checks).

Don't flag: formatting preferences already covered by ESLint, or
naming choices that don't violate an existing convention.
```

- [ ] **Step 2: Verify frontmatter**

Run: `node -e "const fs=require('fs'); const t=fs.readFileSync('skills/code-conventions/SKILL.md','utf8'); const m=t.match(/^---\n([\s\S]*?)\n---/); if(!m||!m[1].includes('name:')||!m[1].includes('description:')) throw new Error('bad frontmatter'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add skills/code-conventions/SKILL.md
git commit -m "Add code-conventions skill"
```

---

### Task 5: Hook — lint on edit

**Files:**
- Create: `hooks/hooks.json`
- Create: `hooks/lint-on-edit.js`

**Interfaces:**
- Produces: `hooks/lint-on-edit.js` is a standalone Node script, invoked with the hook's JSON payload on stdin (Claude Code's standard `PostToolUse` payload: `{ tool_name, tool_input: { file_path, ... }, ... }`). No other task depends on its internals.

- [ ] **Step 1: Create `hooks/lint-on-edit.js`**

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function findEslintRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (
      fs.existsSync(path.join(dir, 'eslint.config.js')) ||
      fs.existsSync(path.join(dir, '.eslintrc.json')) ||
      fs.existsSync(path.join(dir, '.eslintrc.js'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

let payload;
try {
  payload = JSON.parse(readStdin());
} catch {
  process.exit(0);
}

const rawFilePath = payload.tool_input && payload.tool_input.file_path;
if (!rawFilePath || !rawFilePath.endsWith('.js')) {
  process.exit(0);
}
const filePath = path.resolve(rawFilePath);

const eslintRoot = findEslintRoot(path.dirname(filePath));
if (!eslintRoot) {
  process.exit(0);
}

// Resolve the project's own installed eslint bin via its package.json
// (not PATH lookup / npx) so this can't be hijacked by an earlier
// "eslint"/"npx" on PATH, and invoke it with process.execPath directly
// (shell: false) so a crafted file path can't inject shell commands.
let eslintBin;
try {
  const pkgJsonPath = require.resolve('eslint/package.json', { paths: [eslintRoot] });
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const binRelative = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin && pkg.bin.eslint;
  if (!binRelative) throw new Error('eslint package has no bin entry');
  eslintBin = path.join(path.dirname(pkgJsonPath), binRelative);
} catch {
  process.exit(0);
}

const result = spawnSync(process.execPath, [eslintBin, filePath], {
  cwd: eslintRoot,
  encoding: 'utf8',
  shell: false,
});

if (result.status !== 0 && result.stdout) {
  console.log(
    `[code-quality] ESLint found issues in ${path.basename(filePath)}:\n${result.stdout}`
  );
}

process.exit(0);
```

- [ ] **Step 2: Create `hooks/hooks.json`**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/lint-on-edit.js\""
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Verify hooks.json is valid JSON with no hardcoded absolute paths**

Run: `node -e "const fs=require('fs'); const t=fs.readFileSync('hooks/hooks.json','utf8'); JSON.parse(t); if (/\"[^\"]*\/(Users|home|root|var|etc|opt)\//.test(t) || /[A-Za-z]:\\\\\\\\/.test(t)) throw new Error('hardcoded path'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 4: Manually verify the hook script runs against a real file**

Run (from repo root, with `course-api` dependencies installed via `npm install` in `course-api/`):

```bash
echo '{"tool_input":{"file_path":"course-api/routes/health.js"}}' | node hooks/lint-on-edit.js
```

Expected: exits `0`, no crash. Prints nothing if `health.js` is clean, or an ESLint report if it isn't.

- [ ] **Step 5: Commit**

```bash
git add hooks/hooks.json hooks/lint-on-edit.js
git commit -m "Add lint-on-edit hook"
```

---

### Task 6: Marketplace listing

**Files:**
- Create: `.claude-plugin/marketplace.json`

**Interfaces:**
- Consumes: `name: "code-quality"` from Task 1's `plugin.json` — must match exactly.

- [ ] **Step 1: Create `.claude-plugin/marketplace.json`**

```json
{
  "name": "code-quality-marketplace",
  "owner": {
    "name": "Stefano"
  },
  "plugins": [
    {
      "name": "code-quality",
      "source": "./",
      "description": "Two-agent code review and fix workflow, tested against a small Express API."
    }
  ]
}
```

- [ ] **Step 2: Verify it matches plugin.json's name**

Run: `node -e "const p=require('./.claude-plugin/plugin.json'); const m=require('./.claude-plugin/marketplace.json'); const e=m.plugins.find(x=>x.name===p.name); if(!e||!e.source) throw new Error('mismatch or missing source'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "Add marketplace listing"
```

---

### Task 7: README and NOTES

**Files:**
- Modify: `README.md` (repo root — currently holds only the course assignment brief)
- Create: `NOTES.md`

- [ ] **Step 1: Prepend plugin documentation to `README.md`**

Insert this section at the very top of the existing `README.md`, above the
current first line (`## Project — Ship your workflow as a plugin`), so the
assignment brief is preserved below it:

```markdown
# code-quality plugin

A Claude Code plugin that reviews and fixes code quality issues, built
against the small Express API in `course-api/`.

## Install

From a Claude Code session:

```
/plugin marketplace add <this-repo-url-or-local-path>
/plugin install code-quality@code-quality-marketplace
```

Or locally, from the repo root: `claude --plugin-dir .`

## What's included

- `agents/code-reviewer.md` — read-only subagent that audits `course-api/`
  for bugs and convention violations.
- `agents/code-fixer.md` — subagent that applies fixes and re-runs the
  test suite.
- `commands/quality-check.md` — `/code-quality:quality-check`, runs the
  review and the test/lint suite in parallel, then the fixer.
- `skills/code-conventions/SKILL.md` — the shared standard both agents
  check against.
- `hooks/hooks.json` — lints any `.js` file right after it's edited.

See `NOTES.md` for the scoping and orchestration decisions behind this
setup.

---

```

- [ ] **Step 2: Create `NOTES.md`**

```markdown
# Notes

## What this plugin does

`code-quality` bundles a two-agent review-and-fix workflow for a
JavaScript/Express codebase. `code-reviewer` reads the code and reports
findings; `code-fixer` applies fixes for those findings and confirms with
the test suite. A skill (`code-conventions`) gives both agents one shared
definition of what counts as a problem, and a hook lints files the moment
they're edited, independent of running the full workflow.

## Install

```
/plugin marketplace add <this-repo-url-or-local-path>
/plugin install code-quality@code-quality-marketplace
```

Or for local development, run `claude --plugin-dir .` from the repo root
and use `/code-quality:quality-check` directly — no marketplace step
needed while iterating.

## Scoping decision: why code-reviewer is read-only

`code-reviewer`'s `tools` are limited to `Read, Grep, Glob` — no `Edit`,
no `Bash`. A reviewer that can also edit files tends to "fix as it goes,"
which hides what it actually found and skips the fixer's job of verifying
each fix against the test suite. Keeping it read-only forces every change
to go through `code-fixer`, which is the one agent whose job is to run
`npm test` and `npm run lint` and prove nothing broke. It also means the
review step is safe to run on its own, any time, without risk of
unintended edits.

## Orchestration decision: why the review and the test/lint run in parallel

`code-reviewer` reading the code and `npm test` / `npm run lint` running
against it don't depend on each other — the review doesn't need the test
results to form an opinion, and the tests don't need the review to run.
Running them at the same time in `commands/quality-check.md` shortens the
workflow instead of doing three sequential things. `code-fixer` genuinely
can't start until both are done, though: it needs the reviewer's findings
*and* the concrete list of failing tests/lint rules before it knows what
to change, so that step stays dependent (sequential) on the first two.
```

- [ ] **Step 3: Verify NOTES.md length**

Run: `node -e "const fs=require('fs'); const t=fs.readFileSync('NOTES.md','utf8').trim(); if (t.length < 200) throw new Error('too short: '+t.length); console.log('ok', t.length)"`
Expected: `ok <number > 200>`

- [ ] **Step 4: Commit**

```bash
git add README.md NOTES.md
git commit -m "Document the plugin in README and NOTES"
```

---

### Task 8: Full validation and push

**Files:** none created — verification only.

- [ ] **Step 1: Run the structural validator**

Run: `node .github/scripts/validate-plugin.js`
Expected: `Plugin structure looks complete ✓` (exit code 0)

- [ ] **Step 2: Run course-api's own test suite (confirms nothing there is broken)**

Run: `cd course-api && npm install && npm test`
Expected: all 5 existing tests pass.

- [ ] **Step 3: Push**

```bash
git push
```

- [ ] **Step 4: Confirm CI is green**

Check the `Validate plugin` check on the pushed commit (GitHub Actions
tab) — it should pass using the same script as Step 1.
