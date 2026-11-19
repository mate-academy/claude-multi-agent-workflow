# build-workflow plugin

Scout the code and research the docs in parallel, then implement the change. Includes three subagents, a `/build` command, a `change-impact` skill and a protected-files hook.

## What's inside

| Part | Type | Role |
|---|---|---|
| `codebase-scout` | agent (Haiku, read-only) | Maps relevant files, call paths and conventions |
| `docs-researcher` | agent (Sonnet, read-only + web) | Checks official docs for the versions the project pins |
| `implementer` | agent (Opus, edits + Bash) | Writes the change and runs existing build/lint checks |
| `/build` | command | Runs the whole flow from one trigger |
| `change-impact` | skill | Lists everything that breaks when a shared thing changes |
| `hooks/hooks.json` + `guard-protected-files.sh` | hook + script | Blocks edits to secrets, lockfiles and `.git` |

## Install

1. Put the plugin folder in your repo (or anywhere you keep plugins) with this layout:

   build-workflow/
   ├── .claude-plugin/plugin.json
   ├── agents/            (codebase-scout.md, docs-researcher.md, implementer.md)
   ├── commands/build.md
   ├── skills/change-impact/SKILL.md
   ├── hooks/hooks.json
   └── scripts/guard-protected-files.sh

2. Make the guard script executable. Without this the hook fails to run:

   chmod +x scripts/guard-protected-files.sh

3. Make sure `jq` or `python3` is on the PATH. The script needs one of them to read the hook payload.
4. Install the plugin in Claude Code. Either:
    - test it locally: `claude --plugin-dir ./build-workflow`
    - or add the folder to a marketplace and run `/plugin install build-workflow@<marketplace>`
5. Restart Claude Code (or reload plugins) so agents, the command, the skill and the hook are picked up.
6. Check it works:
    - `/agents` lists the three agents
    - `/build <task>` starts the workflow
    - ask an agent to edit `.env` and confirm the edit is blocked

## Scoping decision: tools per agent

Each agent gets only the tools its job needs.

- The scout and researcher are read-only (`Read, Grep, Glob`, plus `WebSearch, WebFetch` for the researcher). They cannot edit, so running them in parallel is safe.
- Only the implementer has `Edit, Write, Bash`, and it runs alone.
- Models follow difficulty: Haiku for searching, Sonnet for reading docs and judging sources, Opus for writing code.
- The hook applies to every agent, so even the implementer cannot touch secrets, lockfiles or `.git`. Lockfiles change through the package manager, not by hand.
- Not included on purpose: reviewer and tester agents. Add them as separate agents if you need them.

## Orchestration decision: parallel first, then a gate, then sequential

- **Parallel:** scout and researcher start together in one message. They don't depend on each other, so running them in sequence would only add waiting time.
- **Gate:** before building, `/build` reads both reports and stops if the scout found nothing relevant or the researcher flagged a breaking change or a deprecation. This costs one short check and avoids an expensive Opus run on a wrong premise.
- **Sequential:** the implementer starts only after both reports exist, and receives them in full. It needs the scout's conventions and the researcher's recommendation as input, so it cannot run earlier.
- `/build` never commits or pushes. You review the diff.

## Optional

- Add `skills: change-impact` to the frontmatter of `codebase-scout.md` and `implementer.md` if you want the impact check applied every time.
- Extend the hook's protected list in `scripts/guard-protected-files.sh` (for example `terraform.tfstate`, `*.sqlite`) to fit your project.