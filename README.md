# Toolbelt

Toolbelt is a Claude Code plugin that quality-checks the bundled `course-api` Express application. It collects a code review and test/lint evidence in parallel, then delegates confirmed repairs to a write-capable agent.

## Components

- `/toolbelt:quality-gate [focus area]` runs the complete review → investigation → repair workflow.
- `/toolbelt:express-api-quality` loads the API route and test checklist.
- `toolbelt:api-reviewer` performs a read-only conventions and coverage review.
- `toolbelt:api-test-investigator` runs the API test and lint commands without editing.
- `toolbelt:api-repairer` makes minimal verified fixes under `course-api/` and reruns checks.
- The bundled hook runs `npm run lint` in `course-api/` after Claude edits or writes a file; it safely no-ops in repositories without that API.

## Local use

Install the API dependencies once:

```bash
cd course-api
npm install
```

Start Claude Code from this repository root:

```bash
claude --plugin-dir .
```

Run `/toolbelt:quality-gate` to inspect the whole API or append a focus area such as `users routes`. After changing plugin files, run `/reload-plugins` in Claude Code.

## Marketplace install

After this repository is pushed, add it as a marketplace in a fresh Claude Code session:

```text
/plugin marketplace add tacio/claude-multi-agent-workflow
/plugin install toolbelt@toolbelt-marketplace
```

Then invoke `/toolbelt:quality-gate` from a checkout that contains the `course-api/` application.
