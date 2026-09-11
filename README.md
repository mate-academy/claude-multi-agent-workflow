# code-quality

A Claude Code plugin that runs a code quality workflow on Node/Express projects. Scoped subagents fix lint and review your changes in parallel, then write tests for the gaps the review found, then run a final lint and test check. A conventions skill and two hooks round it out. It was built and tested against [`course-api/`](./course-api/), a small Express API.

**Version:** 0.1.0

This repo is both the plugin and the marketplace that lists it.

## Install

```
/plugin marketplace add aruizacevedo/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

To install from a local clone instead, use `/plugin marketplace add ./path/to/claude-multi-agent-workflow`. Run `/reload-plugins`, or start a new session, and the components appear with the `code-quality:` prefix.

### Prerequisites

- **Node.js on your `PATH`.** Both hooks are Node scripts (`node "${CLAUDE_PLUGIN_ROOT}/scripts/…"`).
- **ESLint installed in the project** (`node_modules/.bin/eslint`) for the lint gate. Without it, the gate quietly does nothing.
- **`npm test` and `npm run lint` scripts** in the project's `package.json`. The workflow and agents run these by name.

### What it assumes about your project

The plugin is opinionated. It works best on an Express API shaped like `course-api/`:

- one router per resource in `routes/`, mounted in `server.js`, which exports `app`
- all data access through a store module (`db/store.js`), with a `reset()` for tests
- tests in `tests/` using `node:test`, `node:assert` and `supertest`

On a differently structured Express app the workflow still runs, but its conventions checks fit less well. A project's own `CLAUDE.md` always takes precedence over the plugin's conventions skill.

### Cost

A `/quality` run on a single route file cost about **$0.70–$1.10** in testing. Most of that is the opus reviewer; the haiku lint fixer costs a few cents. Cost grows with the size of the scope, so run it on your changes rather than the whole repo.

## Layout

```
.
├── .claude-plugin/
│   ├── plugin.json        # Plugin manifest
│   └── marketplace.json   # Marketplace catalog (lists this plugin, source "./")
├── agents/                # Scoped subagents
├── commands/              # The /quality workflow command
├── skills/                # express-api-conventions/SKILL.md
├── hooks/                 # hooks.json: lint gate + test-writer guard
├── scripts/               # Node scripts the hooks run
├── course-api/            # Express API the plugin was built and tested against
├── LICENSE
└── README.md
```

Only manifest files live in `.claude-plugin/`. The component folders sit at the root, where Claude Code discovers them.

## Components

### Agents

| Agent | Job | Tools | Model |
|-------|-----|-------|-------|
| `code-reviewer` | Reviews changes for bugs, validation, conventions and test gaps. Read-only. | Read, Grep, Glob | opus |
| `test-writer` | Writes `node:test` + supertest tests, runs them, and reports suspected bugs. Doesn't touch app code. | Read, Grep, Glob, Write, Edit, Bash | sonnet |
| `lint-fixer` | Makes mechanical, behaviour-preserving ESLint fixes. | Read, Edit, Bash | haiku |

### Command

`/code-quality:quality [paths]` (or `/quality` if no other command uses that name) runs the whole workflow. It works on your uncommitted changes, or on the paths you give it:

```
Step 0  scope ── git diff / $ARGUMENTS
Step 1  ┌─ lint-fixer ────┐   parallel
        └─ code-reviewer ─┘
Step 2  test-writer              waits for the reviewer's test gaps
Step 3  npm run lint + npm test  waits for all agents
Step 4  open questions checked against the express-api-conventions skill
Step 5  report: PASS | NEEDS WORK
```

The result is **PASS** only if lint and tests pass and the reviewer found no blocker or major findings. The command reports; it never fixes the "Must fix" items itself.

### Skill

`express-api-conventions` covers route structure, the order to handle a request in (params, then body, then lookup), the status code and error body table, a route template with `parseId`, what tests must cover, and a done checklist. Claude loads it when you add or change an endpoint, and `/quality` uses it to settle open questions.

### Hooks

**Test-writer guard (PreToolUse).** When the `test-writer` subagent calls `Bash`, `Write` or `Edit`, `scripts/guard-test-writer.js` checks the call before it runs. Bash may only run plain `npm test`, `git diff` and `git status`, with no pipes, redirects, chaining or `git diff --output`. Edits may only touch test files (`tests/`, `*.test.js`) inside the project. Anything else is blocked with exit `2` and a reason. The hook recognises the agent from the `agent_type` field in the hook input. Other agents and the main session aren't affected.

**Lint gate (PostToolUse).** After any `Edit`, `Write` or `MultiEdit` of a JS file, `scripts/lint-on-edit.js` lints that file with the project's own ESLint. If there are errors, it exits `2` and sends the ESLint output back to Claude to fix straight away. It skips non-JS files, projects without ESLint, and warnings (those go to `lint-fixer`).

Both scripts are referenced as `${CLAUDE_PLUGIN_ROOT}/scripts/…`, so they work wherever the plugin is installed.

## Conventions enforced

Based on `course-api/CLAUDE.md`:

- One route file per resource, mounted in `server.js`
- All data access goes through `db/store.js`
- `400` for bad input, including malformed ids (only `/^[1-9]\d*$/` is valid); `404` only for a well-formed id with no record
- Errors are JSON shaped as `{ "error": "message" }`
- `npm test` and `npm run lint` must pass

## Local development

From the repo root:

```bash
claude --plugin-dir .
```

Then, inside the session, try `/code-quality:quality course-api/routes/users.js`. Run `/reload-plugins` after editing a component. Check the structure with:

```bash
claude plugin validate .
node .github/scripts/validate-plugin.js
```

## License

The plugin files (`.claude-plugin/`, `agents/`, `commands/`, `skills/`, `hooks/`, `scripts/`) are MIT-licensed; see [LICENSE](./LICENSE). `course-api/` and `ASSIGNMENT.md` are course material and aren't covered by this license.
