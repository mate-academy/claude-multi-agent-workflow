# Notes

## Install

Locally, from the repo root:

```
claude --plugin-dir .
```

Then run `/quality-check` against `course-api/`. Use `/reload-plugins` after editing any component to pick up changes without restarting.

Once published to a marketplace:

```
/plugin marketplace add <this-repo>
/plugin install code-quality-kit@code-quality-kit-marketplace
```

## Scoping decision: two agents, split by write access

`code-reviewer` is restricted to `Read, Grep, Glob` and `code-fixer` gets `Read, Grep, Glob, Edit, Write, Bash`. The split isn't about capability — a single agent could do both — it's about making the write boundary explicit and enforceable. A review pass should never accidentally mutate code just because the model decided a fix was obvious; giving the reviewer no write tools makes that structurally impossible instead of relying on a prompt instruction that could be ignored under pressure. It also lets `/quality-check` show the user a full findings list before anything touches disk, and only hand off to `code-fixer` per-issue once fixes are actually wanted.

## Orchestration decision: command drives, subagents stay narrow

`/quality-check` (the command) does the orchestration itself rather than delegating that judgment to a subagent: it runs `npm test`/`npm run lint` directly, calls `code-reviewer` for the parts that need judgment (reading code for bugs/convention drift), merges both into one ranked list, and only then optionally calls `code-fixer` — once per distinct issue, not "fix everything you find." Keeping test/lint invocation in the command (rather than inside an agent) means the same ground truth (pass/fail) is checked both before and after fixes, in the same place, so "did this fix actually work" isn't left to the fixer's own self-report.

## Hook

`hooks/hooks.json` runs `eslint` on any file under `course-api/` right after an `Edit` or `Write` touches it (`PostToolUse`), exiting 2 on lint failure so the error is fed back to the model immediately rather than waiting for the next `/quality-check` pass. It uses `${CLAUDE_PLUGIN_ROOT}` to locate the bundled script so the hook works regardless of where the plugin is installed.
