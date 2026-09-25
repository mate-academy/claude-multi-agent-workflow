# code-quality

A Claude Code plugin that bundles code review, test generation, and auto-formatting into a single workflow — run it after any meaningful change and get actionable feedback without switching tools.

## Components

| Component | Type | Purpose |
|---|---|---|
| `reviewer` | Agent | Read-only; finds bugs, missing error handling, and unclear names |
| `test-writer` | Agent | Writes or updates tests to cover the changes |
| `check` | Command | Runs reviewer and test-writer in parallel, then summarises findings |
| `review-guide` | Skill | Loaded before review to set the standard for what counts as a finding |
| `fmt` | Hook | Runs ESLint `--fix` on every saved `.js` file automatically |

## Install

### From the marketplace (recommended)

```
/plugin marketplace add https://github.com/gsaik/claude-multi-agent-workflow
/plugin install code-quality@gsaik
```

Confirm it loaded:

```
/plugin list
# → code-quality  v0.1.0  gsaik
```

### Locally from a clone

```bash
git clone https://github.com/gsaik/claude-multi-agent-workflow
cd claude-multi-agent-workflow
claude --plugin-dir .
```

Or from inside an existing Claude Code session:

```
/plugin install ./
```

## Usage

After editing one or more files, run:

```
/check
```

The `reviewer` and `test-writer` agents run in parallel. Once both finish, a summary step merges their output into a single prioritised action list.

### Example output

```
**HIGH — blocks merge**
- routes/users.js — PUT handler reads req.body.name without checking it exists;
  crashes with TypeError on an empty body. Add a 400 guard before the update.

**MEDIUM**
- db/store.js — `getData` is ambiguous; rename to `findUserById` so the intent
  is clear at the call site.

**TEST CHANGES**
- tests/users.test.js — added: PUT /users/:id returns 400 when body is empty
- tests/users.test.js — added: GET /users/:id returns 200 with correct shape

**LOW**
- routes/users.js — inline comment on line 14 restates the code; remove it.
```

## ESLint hook

Every time Claude writes or edits a `.js` file, `hooks/fmt.sh` runs automatically:

```
[PostToolUse] fmt.sh → eslint --fix routes/users.js  ✓
```

This keeps formatting consistent without a separate lint step. The hook exits non-zero if ESLint is not installed or has no config, so setup errors surface immediately rather than silently drifting.

## Reload after edits

```
/reload-plugins
```
