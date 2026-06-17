# Plugin notes

## What it does

This repo is a Claude Code plugin that provides a multi-agent workflow for developing and shipping API features safely. It bundles:

- **Two subagents** — `api-contract-reviewer` (read-only audit of routes, validators, and docs) and `feature-implementer` (writes and tests code end-to-end).
- **One command** — `/ship <description>` orchestrates both agents into a two-phase workflow.
- **One skill** — `pre-merge` gives a go/no-go verdict before you push a branch.
- **One hook** — a `Stop` hook that blocks the session from ending if route files were changed but no contract review has been recorded in the transcript.

## How to install

Point Claude Code at this repo as a marketplace:

```
/plugins add https://github.com/sallaypeter/claude-multi-agent-workflow
```

Then install the plugin from that marketplace listing.

Once installed, `/ship <feature or fix>` is available immediately. The `pre-merge` skill activates whenever you ask whether changes are safe to merge or push. The Stop hook is always active while the plugin is installed.

## Scoping decision: why `api-contract-reviewer` uses Haiku with read-only tools

The reviewer's job is pattern-matching across files it can already see — find route definitions, compare them against validators and docs, report what mismatches. That is a search-and-summarise task, not a reasoning-under-uncertainty task. Haiku handles it accurately and cheaply, and running it often (including automatically via the Stop hook) should not burn through a budget.

More importantly, limiting it to `Glob, Grep, LS, Read` is a correctness constraint, not just cost-trimming. A reviewer that can also write files could silently "fix" what it finds instead of reporting it, which breaks the two-phase contract: discover first, decide whether to act second. Read-only tools make that guarantee structural rather than a matter of prompt discipline.

## Why `/ship` runs discovery in parallel and implementation in sequence

The parallel step — `api-contract-reviewer` running at the same time as a codebase orientation — works because the two tasks share no inputs. The reviewer only needs the files on disk; the orientation only needs the same files on disk. Neither has to wait for the other's output to start. Running them together roughly halves the latency of the discovery phase.

The sequential step — `feature-implementer` running only after both discovery tasks finish — is a hard data dependency. The implementer needs two specific inputs that do not exist until discovery completes: the contract report (so it knows which existing problems not to worsen) and the file map (so it can orient without re-exploring). Starting the implementer before those are ready would mean it either re-derives the same information at extra cost, or proceeds blind and risks introducing a new contract inconsistency that the reviewer already flagged.

The parallel/sequential split therefore follows the actual shape of the data, not a stylistic preference.
