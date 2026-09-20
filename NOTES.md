# Notes

## What this is

`code-quality` is a small plugin built around the `course-api/` Express app in this repo. The idea: whenever routes change, get an automatic review against this project's actual conventions (not generic "REST best practices"), and keep `docs/api.md` from quietly drifting out of date — which is exactly the kind of thing that's easy to skip when you're moving fast.

## Installing it

Easiest way, from a fresh Claude Code session:

```
/plugin marketplace add MykhailoIvchenko/claude-multi-agent-workflow
/plugin install code-quality@claude-multi-agent-workflow
```

While I was building it I mostly just ran `claude --plugin-dir .` from the repo root and used `/reload-plugins` after every change — much faster feedback loop than reinstalling from the marketplace each time. Once it's installed, `cd course-api && npm install` so there's actually something for the agents to look at, then run `/ship-check` after editing a route file.

## Scoping decision: why the two agents have different models

`api-reviewer` runs on Sonnet and `docs-syncer` runs on Haiku, and that split was deliberate rather than "pick whatever's default."

Reviewing a route for a real logic bug — an off-by-one, a validation branch that lets a bad request slip through, a status code that's technically fine but inconsistent with how the rest of the API behaves — needs actual judgment. It's not pattern matching, it's reasoning about what *should* happen versus what the code *does*. That felt worth paying for with a stronger model, especially since it's a read-only agent — worst case it's slow or a little over-cautious, it can't do damage.

`docs-syncer`, on the other hand, is a matching problem: read the route, read the doc, make the doc say what the route does. It doesn't need to invent anything or make judgment calls about correctness — that's already been done by `api-reviewer` upstream, which tells it exactly what changed. Haiku is fast and cheap and handles "these two texts disagree, fix the second one" just fine. Giving it Edit access (not Write) also felt right — it's only ever supposed to touch an existing file, not create new ones.

Same logic for tools: `api-reviewer` gets Read/Grep/Glob and nothing else, on purpose, because a reviewer that can edit code stops being a reviewer — you lose the "someone/something else checks this before it's trusted" property that's the whole point of having it be a separate step.

## Orchestration decision: why `/ship-check` is parallel-then-sequential

The test suite and the code review don't need each other — `npm test` doesn't care what `api-reviewer` thinks, and `api-reviewer` doesn't need the test results to read the code. Running them one after another would just be waiting for no reason, so `/ship-check` kicks both off at once.

The docs step is different: `docs-syncer` genuinely can't do its job without knowing what `api-reviewer` found. If it ran in parallel too, it'd either have to re-derive "what changed" from scratch (duplicated work) or blindly re-sync the whole doc file on every run, which is exactly the kind of unnecessary churn I wanted to avoid — most runs shouldn't touch the docs at all. So step 2 waits on step 1's output and only fires conditionally, on the specific findings that mention doc drift. It's a small workflow, but it's got both shapes the assignment asked for, and each one is there because of an actual dependency (or lack of one), not just to check a box.
