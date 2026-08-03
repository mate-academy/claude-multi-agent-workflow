# NOTES — api-qa

## What it does & install

`api-qa` runs a multi-agent QA pass over an Express API: `/api-qa:qa-flow [path]` audits every route file in parallel with `route-auditor` subagents, merges the findings, then sends the missing test cases to a `test-writer` subagent that adds them and runs the suite. A conventions skill and a lint-fix hook round out the bundle.

Install from the marketplace this repo doubles as:

```
/plugin marketplace add lboetzle/claude-multi-agent-workflow
/plugin install api-qa@lboetzle-plugins
```

For development: `claude --plugin-dir .` from the repo root, and `/reload-plugins` after edits.

## One scoping decision

`route-auditor` gets **Read, Grep, Glob only, on Haiku**. An audit must not be able to "helpfully" fix what it finds — findings have to flow through the workflow so they're merged and deduplicated before anything changes; removing Edit/Write makes that a guarantee instead of a convention. Haiku is enough because the job is pattern-checking one small file against six explicit rules — no design judgement. `test-writer`, by contrast, gets Edit/Write/Bash on Sonnet: it changes the test suite and must run `npm test` to prove the suite still passes, and writing meaningful assertions warrants the stronger model.

## One orchestration decision

The audits run **in parallel** because they are truly independent: each auditor reads one route file and its tests, and no auditor's output affects another's. Fanning out per-file also keeps each context small, which is what makes Haiku reliable here. The **test-writer runs after them, sequentially**, because its input *is* their merged output — the exact list of missing test cases. Running it earlier (or per-route) would either give it an incomplete list or produce several agents editing the same test file concurrently and clobbering each other. One writer, fed once, after the merge.

## Hook path note

The hook references its script as `${CLAUDE_PLUGIN_ROOT}/scripts/lint-fix.js`, so it resolves wherever the plugin is installed — no hardcoded paths. The script uses whatever ESLint the *target project* has installed (nearest `node_modules` above the edited file) and quietly no-ops when there isn't one.
