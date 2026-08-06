# Shipwright Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `shipwright` Claude Code plugin in this repo — two scoped
subagents, a `/release` workflow command, a skill, and a hook, all themed
around shipping releases of `course-api/` — so that
`.github/scripts/validate-plugin.js` passes and the plugin installs cleanly
from its own marketplace.

**Architecture:** A read-only `release-scout` agent gathers and organizes
unreleased changes; a writing `release-writer` agent decides the version bump
and edits `CHANGELOG.md`/`package.json`. The `/release` command orchestrates
them — scout and the test suite run in parallel, writer runs after, dependent
on both. A `changelog-format` skill documents the format/bump rules both
agents rely on. A `PreToolUse` hook on `git push` blocks pushes that leave
unreleased changes behind.

**Tech Stack:** Markdown + YAML frontmatter (agents/commands/skills), JSON
(manifests/hooks config), plain Node.js (hook script, CommonJS, no
dependencies — matches `course-api`'s own `"type": "commonjs"`), Node's
built-in test runner (`node --test`, same as `course-api`'s `npm test`).

Repo root: `C:\Users\16479\claude-multi-agent-workflow` — all paths below are
relative to it.

## Global Constraints

- `.claude-plugin/` contains **only** `plugin.json` and `marketplace.json` —
  every component folder (`agents/`, `commands/`, `skills/`, `hooks/`) sits
  at the repo root.
- Every agent's frontmatter must include `name`, `description`, `tools`,
  `model` — no exceptions, the grader checks all four.
- `release-scout`'s `tools` must be exactly `Read, Grep, Glob` (nothing else
  — the grader's read-only check requires *every* listed tool to be in
  `{Read, Grep, Glob}`).
- `release-writer`'s `tools` must include `Edit`.
- Any bundled script path referenced from `hooks/hooks.json` must use
  `${CLAUDE_PLUGIN_ROOT}` — never a hardcoded absolute path.
- The four change categories are **Added, Changed, Fixed, Breaking** —
  exactly these four, spelled the same way, everywhere they appear
  (`release-scout.md`, `release-writer.md`, `changelog-format/SKILL.md`).
  Do not introduce a fifth category (e.g. "Removed") — fold anything that
  isn't user-breaking into `Fixed`.
- Version bump mapping (must match verbatim in `release-writer.md` and
  `changelog-format/SKILL.md`): any `Breaking` → **major**; no `Breaking` but
  `Added` and/or `Changed` present → **minor**; only `Fixed` present →
  **patch**.
- `marketplace.json`'s plugin entry `name` must exactly match `plugin.json`'s
  `name` (`"shipwright"`).

---

## Task 1: Scaffold the plugin manifest and bootstrap fixtures

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `course-api/CHANGELOG.md`
- Modify: `README.md` (repo root — currently the assignment brief; original
  content stays recoverable via `git log`)

**Interfaces:**
- Produces: `course-api/CHANGELOG.md` with a `## [Unreleased]` heading that
  every later agent/hook task reads from and writes to. Produces
  `.claude-plugin/plugin.json` with `"name": "shipwright"`, which
  `marketplace.json` (Task 7) must match exactly.

- [ ] **Step 1: Write `.claude-plugin/plugin.json`**

```json
{
  "name": "shipwright",
  "version": "0.1.0",
  "description": "Ship releases from Claude Code: summarize unreleased changes, write the changelog, bump the version, and block pushes that leave a release behind."
}
```

- [ ] **Step 2: Bootstrap `course-api/CHANGELOG.md`**

```markdown
# Changelog

## [Unreleased]

## [1.0.0] - 2026-08-06
- Initial release of the course API.
```

- [ ] **Step 3: Rewrite the root `README.md` for the plugin**

```markdown
# shipwright

A Claude Code plugin that ships releases for you: it summarizes unreleased
changes, writes the changelog entry, bumps the version, and blocks a `git
push` that would leave a release behind.

## Install

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install shipwright@shipwright-marketplace
```

## What's in it

- **`release-scout`** (read-only) — reads `course-api/CHANGELOG.md`'s
  `Unreleased` section and cross-checks it against the source tree, returns
  a categorized summary of what's changed.
- **`release-writer`** (writes) — takes that summary, decides the version
  bump, writes the changelog entry, and bumps `course-api/package.json`.
- **`/release`** — orchestrates both: runs `release-scout` and the test
  suite in parallel, then runs `release-writer` if tests passed and there's
  something to ship.
- **`changelog-format` skill** — the category and version-bump rules the
  agents follow.
- **A `git push` hook** — blocks the push if `CHANGELOG.md` still has
  unreleased changes sitting in it.

See `NOTES.md` for install details and design decisions.
```

- [ ] **Step 4: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: the `Missing .claude-plugin/plugin.json` and `Missing README.md`
errors are gone from the output. (Many other errors will still print — that's
expected until later tasks land.)

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/plugin.json course-api/CHANGELOG.md README.md
git commit -m "Scaffold shipwright plugin manifest and changelog fixture"
```

---

## Task 2: `release-scout` agent

**Files:**
- Create: `agents/release-scout.md`

**Interfaces:**
- Consumes: `course-api/CHANGELOG.md`'s `## [Unreleased]` section (Task 1).
- Produces: a categorized text summary using headings from `Added, Changed,
  Fixed, Breaking` (only the ones with content), or the literal string
  `Nothing to release.` when there's nothing to report. `commands/release.md`
  (Task 5) and `agents/release-writer.md` (Task 4) both consume this exact
  output shape.

- [ ] **Step 1: Write `agents/release-scout.md`**

```markdown
---
name: release-scout
description: Use when preparing a release to see what's changed since the last version. Reads CHANGELOG.md's Unreleased section and cross-checks it against the actual course-api source tree, then returns a categorized summary. Read-only — never edits files.
tools: Read, Grep, Glob
model: haiku
---

You prepare the ground for a release by figuring out what's actually changed
in `course-api/` since the last version — you never write anything yourself.

## What to do

1. Read `course-api/CHANGELOG.md`. Find the `## [Unreleased]` section (it
   sits right under the `# Changelog` heading, above the most recent
   released version heading). If the file doesn't exist, or the section is
   empty, treat that as "nothing noted yet" and continue to step 2 anyway —
   don't stop early.
2. Use `Glob` to list source files under `course-api/routes/`,
   `course-api/db/`, and `course-api/server.js`. Use `Grep` to check whether
   each file (or the specific behavior it implements) is mentioned anywhere
   in the `Unreleased` notes you read in step 1.
3. Flag anything that looks off:
   - A source file that looks new or clearly changed but isn't mentioned in
     `Unreleased` at all.
   - An `Unreleased` note that references a file, route, or behavior you
     can't find in the current source tree (likely stale).
4. Return your findings as a single categorized summary using these
   headings, omitting any with nothing under them:

   ```
   Added:
   - <one line, user-facing>

   Changed:
   - <one line, user-facing>

   Fixed:
   - <one line, user-facing>

   Breaking:
   - <one line, user-facing>
   ```

   If there's truly nothing to report (empty `Unreleased`, nothing
   unmentioned in the source tree), return exactly: `Nothing to release.`

## Rules

- You are read-only. Never propose edits, never write files — just report.
- Every bullet must be about user-visible behavior (what changed for someone
  calling the API), not implementation detail like variable renames.
- Don't guess at a version number — that's not your job.
```

- [ ] **Step 2: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: `Need at least two subagents in agents/` still prints (only one so
far — expected), but no error naming `agents/release-scout.md` specifically.

- [ ] **Step 3: Commit**

```bash
git add agents/release-scout.md
git commit -m "Add release-scout read-only subagent"
```

---

## Task 3: `changelog-format` skill

**Files:**
- Create: `skills/changelog-format/SKILL.md`

**Interfaces:**
- Produces: the category list and version-bump mapping table that
  `release-writer` (Task 4) must apply identically.

- [ ] **Step 1: Write `skills/changelog-format/SKILL.md`**

```markdown
---
name: changelog-format
description: How to write a changelog entry for course-api — category headings, one-line user-facing phrasing, and the category-to-semver-bump mapping release-writer relies on. Use whenever writing or editing CHANGELOG.md, by hand or via release-writer.
---

# Changelog format

`course-api/CHANGELOG.md` follows a Keep-a-Changelog-style structure: a
running `## [Unreleased]` section at the top, and one
`## [x.y.z] - YYYY-MM-DD` heading per released version below it, newest
first.

## Categories

Use exactly these four headings, in this order, only including ones that
have entries:

- **Added** — new, backward-compatible functionality (a new route, a new
  optional field).
- **Changed** — backward-compatible changes to existing behavior.
- **Fixed** — bug fixes, and any cleanup (including removing something
  unused) that doesn't break an existing caller.
- **Breaking** — anything that breaks an existing caller (a removed route,
  a renamed field, a changed response shape).

## Entry style

One line per bullet, written for someone *calling* the API — not for
someone reading the diff:

- Good: `Added a \`GET /users/:id\` endpoint.`
- Bad: `Added getUserById handler and wired it into the router.`

## Version bump mapping

This is the exact rule `release-writer` applies — keep it in sync if either
changes:

| Entries present                        | Bump  |
|-----------------------------------------|-------|
| Any `Breaking`                          | major |
| `Added` and/or `Changed` (no `Breaking`)| minor |
| Only `Fixed`                            | patch |
```

- [ ] **Step 2: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: no error mentions `skills/` or `SKILL.md` anymore.

- [ ] **Step 3: Commit**

```bash
git add skills/changelog-format/SKILL.md
git commit -m "Add changelog-format skill"
```

---

## Task 4: `release-writer` agent

**Files:**
- Create: `agents/release-writer.md`

**Interfaces:**
- Consumes: `release-scout`'s categorized summary or `Nothing to release.`
  (Task 2); the category/bump mapping from `changelog-format` (Task 3).
- Produces: an edited `course-api/CHANGELOG.md` and `course-api/package.json`,
  plus a one-line return summary in the form
  `Released x.y.z — <short summary>.` that `commands/release.md` (Task 5)
  relays to the user.

- [ ] **Step 1: Write `agents/release-writer.md`**

```markdown
---
name: release-writer
description: Use after release-scout has summarized changes, to actually cut the release — decides the version bump, writes the changelog entry, and bumps package.json. Only run this once you have release-scout's categorized summary in hand.
tools: Read, Edit
model: sonnet
---

You turn a categorized change summary (from `release-scout`) into an actual
release: a new `CHANGELOG.md` entry and a bumped `package.json` version in
`course-api/`.

## What to do

1. Read `course-api/package.json` to get the current `version`.
2. Read `course-api/CHANGELOG.md`.
3. Decide the version bump from the categorized summary you were given (see
   `skills/changelog-format` for the full rationale):
   - Any `Breaking` entries present → **major** bump.
   - No `Breaking`, but `Added` or `Changed` entries present → **minor**
     bump.
   - Only `Fixed` entries present → **patch** bump.
   - Decide automatically. Do not ask for confirmation.
4. Edit `course-api/CHANGELOG.md` so the result has, in this order:
   - `## [Unreleased]`, now empty.
   - A new `## [x.y.z] - YYYY-MM-DD` heading (today's date) with the
     categorized bullets you were given moved underneath it.
   - Everything that was already below `## [Unreleased]`, unchanged.
5. Edit `course-api/package.json`: update `"version"` to the new `x.y.z`.
6. Report back the new version number and a one-line summary of what
   shipped, in the form: `Released x.y.z — <short summary>.` (e.g.
   `Released 1.1.0 — 2 additions, 1 fix.`).

## Rules

- Only run once `release-scout` has reported something to release. If the
  summary you were given is `Nothing to release.`, don't do anything —
  report that instead.
- Keep the `Unreleased` heading present but empty after you're done; never
  delete it.
- Don't touch anything outside `course-api/CHANGELOG.md` and
  `course-api/package.json`.
```

- [ ] **Step 2: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: `Need at least two subagents in agents/`,
`At least one subagent must be read-only...`, and
`At least one subagent must be able to change code...` are all gone.

- [ ] **Step 3: Commit**

```bash
git add agents/release-writer.md
git commit -m "Add release-writer subagent"
```

---

## Task 5: `/release` command

**Files:**
- Create: `commands/release.md`

**Interfaces:**
- Consumes: `release-scout` (Task 2) and `release-writer` (Task 4) by their
  agent names, and the `Nothing to release.` sentinel from `release-scout`.

- [ ] **Step 1: Write `commands/release.md`**

```markdown
---
description: Ship a release — summarize unreleased changes, run the test suite, then write the changelog and bump the version if everything's healthy.
---

Run the release process for `course-api/`:

1. At the same time, in parallel:
   - Dispatch the `release-scout` subagent to read `course-api/CHANGELOG.md`
     and the `course-api/` source tree and return a categorized summary of
     what's changed since the last release.
   - Run the test suite: `cd course-api && npm test`.

2. Once both finish, decide how to proceed:
   - If the test suite failed, stop here. Report the failure and do not run
     `release-writer` — never release on top of a broken build.
   - If `release-scout` reported `Nothing to release.`, stop here. Report
     that there's nothing to ship — this is a normal, successful outcome.
   - Otherwise, dispatch the `release-writer` subagent, passing it the exact
     categorized summary `release-scout` returned. `release-writer` depends
     on that summary — don't start it before `release-scout` finishes.

3. Report the outcome to the user:
   - On a successful release: the new version number and the one-line
     summary `release-writer` returned, plus a reminder to commit, tag
     (`git tag vX.Y.Z`), and push.
   - On a stopped release (failed tests or nothing to release): say why,
     plainly, and don't suggest next steps beyond fixing the tests or
     making more changes first.
```

- [ ] **Step 2: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: `Need a workflow command in commands/` and the "looks empty" error
are both gone.

- [ ] **Step 3: Commit**

```bash
git add commands/release.md
git commit -m "Add /release orchestration command"
```

---

## Task 6: `git push` hook

**Files:**
- Create: `hooks/scripts/check-release-freshness.js`
- Test: `hooks/scripts/check-release-freshness.test.js`
- Create: `hooks/hooks.json`

**Interfaces:**
- Produces: `isGitPush(command: string): boolean` and
  `hasUnreleasedContent(changelogText: string): boolean`, exported from
  `hooks/scripts/check-release-freshness.js` for the test file to import.
- Consumes: `course-api/CHANGELOG.md` (Task 1) at runtime via
  `CLAUDE_PROJECT_DIR`.

- [ ] **Step 1: Write the failing test**

Create `hooks/scripts/check-release-freshness.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { isGitPush, hasUnreleasedContent } = require('./check-release-freshness.js');

test('isGitPush matches a plain git push', () => {
  assert.equal(isGitPush('git push'), true);
});

test('isGitPush matches git push with args', () => {
  assert.equal(isGitPush('git push origin main'), true);
});

test('isGitPush matches git push chained after another command', () => {
  assert.equal(isGitPush('npm test && git push'), true);
});

test('isGitPush does not match unrelated git commands', () => {
  assert.equal(isGitPush('git status'), false);
});

test('isGitPush does not match non-string input', () => {
  assert.equal(isGitPush(undefined), false);
});

test('hasUnreleasedContent is false for an empty Unreleased section', () => {
  const text = '# Changelog\n\n## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n- Initial release\n';
  assert.equal(hasUnreleasedContent(text), false);
});

test('hasUnreleasedContent is true when Unreleased has bullets', () => {
  const text = '# Changelog\n\n## [Unreleased]\n- Added a thing\n\n## [1.0.0] - 2026-01-01\n';
  assert.equal(hasUnreleasedContent(text), true);
});

test('hasUnreleasedContent is false when there is no Unreleased heading', () => {
  const text = '# Changelog\n\n## [1.0.0] - 2026-01-01\n- Initial release\n';
  assert.equal(hasUnreleasedContent(text), false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test hooks/scripts/check-release-freshness.test.js`
Expected: FAIL — `Cannot find module './check-release-freshness.js'`

- [ ] **Step 3: Write `hooks/scripts/check-release-freshness.js`**

```js
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function isGitPush(command) {
  if (typeof command !== 'string') return false;
  return /(^|\s|;|&&|\|\|)git\s+push\b/.test(command);
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test hooks/scripts/check-release-freshness.test.js`
Expected: PASS — 8 tests, 0 failures.

- [ ] **Step 5: Write `hooks/hooks.json`**

Before writing this, confirm the current `PreToolUse` hook JSON schema and
the blocking exit-code convention against the Claude Code docs (they're the
one piece of this plan not yet verified against current syntax) — ask
Claude to look this up if unsure. As designed:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-release-freshness.js\""
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 6: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: `Need a hook at hooks/hooks.json` and the hardcoded-path error are
both gone.

- [ ] **Step 7: Commit**

```bash
git add hooks/scripts/check-release-freshness.js hooks/scripts/check-release-freshness.test.js hooks/hooks.json
git commit -m "Add git-push freshness hook with tests"
```

---

## Task 7: `marketplace.json`

**Files:**
- Create: `.claude-plugin/marketplace.json`

**Interfaces:**
- Consumes: `plugin.json`'s `name` (Task 1) — must match exactly.

- [ ] **Step 1: Write `.claude-plugin/marketplace.json`**

```json
{
  "name": "shipwright-marketplace",
  "plugins": [
    {
      "name": "shipwright",
      "source": "./",
      "description": "Ship releases from Claude Code: summarize unreleased changes, write the changelog, bump the version, and block pushes that leave a release behind."
    }
  ]
}
```

- [ ] **Step 2: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: no error mentions `marketplace.json` anymore.

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "Add marketplace.json listing shipwright"
```

---

## Task 8: `NOTES.md`

**Files:**
- Create: `NOTES.md`

- [ ] **Step 1: Write `NOTES.md`**

```markdown
# Notes on shipwright

## What it does

`shipwright` automates cutting a release for `course-api/`: it reads what's
changed since the last version, writes a changelog entry, bumps the version
number, and stops a `git push` that would leave a release behind.

## Install

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install shipwright@shipwright-marketplace
```

Then run `/release` from a session with the plugin loaded.

## Scoping decision: why release-scout is read-only and on haiku

`release-scout`'s job is to read `CHANGELOG.md` and the source tree and
organize what it finds — it never needs to change anything, so its tools
are limited to `Read, Grep, Glob`. That also makes it cheap: reading and
categorizing text is a low-judgment task, so it runs on `haiku` rather than
a larger model. `release-writer`, by contrast, has to make a real judgment
call (which semver bump applies) and produce well-formed prose for the
changelog, so it gets `Edit` and runs on `sonnet`.

## Orchestration decision: why scout+tests run in parallel, writer runs after

`release-scout` reading the changelog/source tree and running
`course-api`'s test suite are completely independent of each other — neither
needs the other's output — so `/release` runs them in parallel to avoid
waiting twice. `release-writer` is different: it needs `release-scout`'s
categorized summary as input, and it should never run if the tests failed,
so it's a dependent step that waits on both parallel tasks finishing first.
```

- [ ] **Step 2: Verify with the grader**

Run: `node .github/scripts/validate-plugin.js`
Expected: `Missing NOTES.md` and the "too short" error are both gone.

- [ ] **Step 3: Commit**

```bash
git add NOTES.md
git commit -m "Add NOTES.md"
```

---

## Task 9: Full validation and local smoke test (manual checkpoint)

This task can't be scripted end-to-end — the smoke test means driving a
live, interactive Claude Code session, which needs a person at the keyboard.
Hand off to the user here rather than dispatching a subagent for these steps.

**Steps for the user to run:**

- [ ] **Step 1:** `node .github/scripts/validate-plugin.js` from the repo
  root. Expected: `Plugin structure looks complete ✓`. If not, it prints
  exactly which item is missing — fix and rerun.
- [ ] **Step 2:** `cd course-api && npm install` (one-time prerequisite).
- [ ] **Step 3:** From the repo root, `claude --plugin-dir .` to load the
  plugin locally.
- [ ] **Step 4:** Confirm `release-scout` and `release-writer` show up under
  their namespaced names, and that `/release` is available.
- [ ] **Step 5:** Add a bullet under `## [Unreleased]` in
  `course-api/CHANGELOG.md` by hand (e.g. `- Added a test note.`), then run
  `/release` and confirm it runs scout + tests in parallel, then writer, and
  ends with a bumped version and a cleared `Unreleased` section.
- [ ] **Step 6:** Add another `Unreleased` bullet by hand, then attempt
  `git push` and confirm the hook blocks it with the "Run /release first"
  message. Run `/release` again, then confirm the next `git push` attempt is
  no longer blocked (don't actually complete the push without checking with
  the user first — see Task 10).
- [ ] **Step 7:** Use `/reload-plugins` if you change anything while
  iterating, instead of restarting the session.

---

## Task 10: Publish as a marketplace (requires explicit go-ahead)

Pushing to the remote and adding/installing a marketplace both touch shared
state outside this repo's working copy — don't do these without the user
explicitly confirming each one at execution time.

- [ ] **Step 1:** Confirm with the user, then `git push`.
- [ ] **Step 2:** In a fresh Claude Code session: `/plugin marketplace add
  <this repo>`.
- [ ] **Step 3:** `/plugin install shipwright@shipwright-marketplace`.
- [ ] **Step 4:** Confirm it installs and `/release` runs cleanly from the
  installed copy, not just `--plugin-dir`.
