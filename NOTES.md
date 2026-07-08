# Notes

## What the plugin does, and how to install it

`code-quality` reviews, fixes, and verifies code quality on an Express API
(`course-api/` in this repo). It bundles two subagents (`code-reviewer`,
`code-fixer`), a `/quality-check` workflow command that orchestrates them, a
skill encoding the project's route conventions, and a hook that auto-lints
edited files.

Install as its own first user:

```
claude plugin marketplace add huuphong91/claude-multi-agent-workflow
claude plugin install code-quality@huuphong91-plugins
```

or locally without installing, for a single session:

```
claude --plugin-dir .
```

I validated the install path exactly this way (`claude plugin marketplace add
<local path>` then `claude plugin install code-quality@huuphong91-plugins`,
run from a separate directory as a "fresh session"), confirmed via
`claude plugin list` / `claude plugin details` that it installed with 2
agents, 2 invokable components, 1 hook, all enabled — then uninstalled it
again so the test didn't leave a lingering local install.

## One scoping decision

`code-reviewer` gets `tools: Read, Grep, Glob` only — no `Edit`/`Write`/`Bash`.
The whole point of having a separate reviewer is that its output (a findings
list) should be trustworthy precisely because it *couldn't* have quietly
"fixed" something instead of reporting it — a reviewer that can edit files
is one bad turn away from silently patching over what it should be
surfacing. `code-fixer` gets the wider `Read, Edit, Write, Grep, Glob, Bash`
set because its job — actually resolving findings and re-running
`npm test`/`npm run lint` to confirm — genuinely needs to change files and
shell out. Both use `sonnet`: neither job requires deep reasoning (the rules
are already spelled out — validation, not-found handling, error shape), but
both need enough judgment to apply those rules to code they haven't seen
before, which ruled out a fixed template or a much smaller model.

## One orchestration decision

`/quality-check`'s Step 1 runs `code-reviewer` and the `npm test`/`npm run
lint` baseline **in parallel** because they don't depend on each other at
all — the review is static analysis of the current code, and the baseline is
just "what's already broken." Running them together instead of one after the
other costs nothing and saves a full round trip. Step 2 (`code-fixer`) is
**dependent** — it can't start until both parallel parts are done, because
it needs the *combined* result (the review's findings plus the actual
test/lint output) to know what to fix and to have something concrete to
verify against afterward. Running it before the parallel step finished would
mean fixing blind.

## What I verified locally (Task 5)

Ran `/code-quality:quality-check` headless against the bundled `course-api/`
(`claude --plugin-dir . -p "/code-quality:quality-check" --allowedTools
"Read,Grep,Glob,Edit,Write,Bash(npm test:*),Bash(npm run lint:*),Task"`). It
found real issues (a non-JSON error path on malformed request bodies, loose
empty-string validation on `PUT`, no type-checking on `name`/`email`, and the
store leaking its live array by reference), fixed them, added regression
tests, and finished at 9/9 passing with clean lint. I reverted those
course-api/ changes afterward since this PR's scope is the plugin wiring,
not a course-api patch — but it's the proof the workflow actually works end
to end, not just that it loads.
