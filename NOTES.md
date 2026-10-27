# NOTES — quality-crew

## What it does and how to install it

`quality-crew` is a code-quality plugin for small Express APIs. Its main entry
point is `/quality-crew:quality-check`, which reviews every route file in
parallel with a read-only reviewer, hands the untested behaviours it found to a
test-writer, and finishes with one report grouped by severity. A skill teaches
Claude the API's route conventions, and a hook blocks risky shell commands.

Install from GitHub:

```
/plugin marketplace add juancarloscas00/claude-multi-agent-workflow
/plugin install quality-crew@juancarlos-plugins
```

Or load it from a local clone with `claude --plugin-dir .` and run
`/quality-crew:quality-check course-api`.

## A scoping decision

The **api-reviewer** only gets `Read, Grep, Glob`. A reviewer's job is to judge,
not to change things, so it has no `Edit`/`Write` (it can't "fix" code behind my
back) and no `Bash` (it can't run anything, so several copies can run in
parallel safely). It uses `sonnet` because spotting edge cases and convention
breaks needs judgement.

The **test-writer** is the only agent that can write. It gets `Write, Edit` to
create test files and `Bash` only because it must run `npm test` to know whether
a test passes. Its body limits it to new files under `tests/` and forbids
touching application code, so the blast radius stays small.

## Parallel vs sequential

- **Reviews run in parallel** (one reviewer per file): each file can be judged on
  its own and no review needs another review's output, so running them together
  saves time and keeps each reviewer's context small.
- **The test-writer runs after all reviews finish**: its input *is* the merged
  "untested behaviour" list from every reviewer. Starting earlier would mean
  writing tests for an incomplete list, or making it search on its own and
  repeat the reviewers' work.
- **The final `npm test` and report run last**: they need the new tests to exist.

The main session is the conductor: subagents never talk to each other; the
command tells the main session what to pass from one step to the next.
