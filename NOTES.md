# myplug

A code-quality plugin: a two-phase audit workflow, a shared review rubric, and an on-save lint check, bundled around two scoped subagents.

## What it does

- `agents/read-reviewer.md` — a read-only subagent (Read, Grep, Glob) that reviews a slice of code and returns findings grouped high/medium/low.
- `agents/write-report.md` — a subagent that consolidates findings from one or more reviews into a single deduplicated report (adds the Write tool on top of read/search).
- `commands/audit.md` — `/audit [path]`, the workflow command: runs several `read-reviewer` passes in parallel over different areas of the target, then a single sequential `write-reporter` pass to merge them, then asks before saving the result to a file.
- `skills/review-rubric/SKILL.md` — the same high/medium/low severity definitions the subagents use, loaded automatically for ad hoc reviews so a one-off "review this file" request grades issues the same way `/audit` does.
- `hooks/hooks.json` — a `PostToolUse` hook that lints any `.js` file Claude edits or writes (via `hooks/scripts/lint-on-save.sh`, resolved through `${CLAUDE_PLUGIN_ROOT}`), surfacing ESLint findings immediately instead of waiting for the next review.

## Install

Local testing, from the repo root:

```
claude --plugin-dir .
```

As a marketplace, from any Claude Code session:

```
/plugin marketplace add zemoon/claude-multi-agent-workflow
/plugin install myplug@claude-multi-agent-workflow
```

Run `/audit course-api` (or any subdirectory) once installed.

## Scoping decision

`read-reviewer` is limited to `Read, Grep, Glob` — no `Write` or `Edit` — because reviewing is a read-only, mechanical task: it never needs to change code, and a reviewer that *can't* write is a reviewer that can't accidentally corrupt the thing it's evaluating. `write-reporter` gets `Write` added on top since consolidating findings into a saved report is its actual job, but `commands/audit.md` deliberately tells it to return the report as text and ask the user before writing to disk — the tool capability and the workflow's actual permission to use it unprompted are kept separate on purpose, after an earlier test run showed the agent reaching for `Write` on its own initiative.

## Orchestration decision

`/audit` splits the target into a few independent areas (e.g. routes, models, tests) and runs one `read-reviewer` instance per area **in parallel** — each instance only reads its own slice and returns its own findings, so there's no shared state to coordinate and no reason to make later areas wait on earlier ones. `write-reporter` then runs once, **after** every parallel instance has returned, because consolidation is inherently a function of the full set of findings: deduplicating an issue flagged from two areas, or grouping everything by severity across the whole target, can't happen until all the inputs exist. Parallel where the work is independent, sequential only where a step genuinely depends on every prior result.
