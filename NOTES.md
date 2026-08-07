# code-quality plugin — Notes

## How to install

```bash
# From a fresh Claude Code session:
/plugin marketplace add https://github.com/<your-username>/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

Then run the workflow with:

```
/quality-check
```

## Scoping decision — reviewer uses Haiku with read-only tools

The `reviewer` agent is limited to `Read`, `Grep`, and `Glob` with `claude-haiku-4-5-20251001`. It cannot write anything. This is intentional: a reviewer that can also edit would collapse the two-stage pipeline into one, removing the checkpoint where findings are collected and prioritised before any code changes. Using Haiku keeps review fast and cheap — reading code requires less reasoning power than writing it. The `fixer` uses `claude-sonnet-4-6` and has `Edit` and `Write` because applying changes correctly demands more care.

## Orchestration decision — parallel reviews, then a single fix pass

The `quality-check` command runs two reviewer invocations in parallel (one over `routes/`, one over `tests/`). These are independent reads with no shared state, so there is no reason to run them sequentially. The fixer step is sequential and depends on both reviews completing first: it needs the full combined findings list before it can decide which files to touch. Running the fixer before both reviews are done would risk missing issues or applying conflicting edits to the same file.
