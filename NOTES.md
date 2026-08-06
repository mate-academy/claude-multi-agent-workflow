# NOTES — release-changelog

## What it does

`release-changelog` is a Claude Code plugin that automates the "review, test, ship a changelog entry" loop. Invoking `/release-changelog:changelog` runs a diff review and the test suite in parallel, then — only if both come back clean — drafts and posts a changelog entry to Notion. A failing test suite (or a review that didn't produce a usable summary) stops the workflow before anything gets written externally.

## Install

```
/plugin marketplace add https://github.com/ericmsebastian/claude-multi-agent-workflow
/plugin install release-changelog@ericmsebastian-plugins
```

Requires a Notion MCP server already connected in the Claude Code session (`mcp__notion__*` tools available at user or project scope). The plugin does not bundle its own Notion MCP server — it calls whatever's already configured, so the Notion connection is the installer's responsibility, not the plugin's.

## Scoping decision: why the two subagents got the tools and models they did

**`code-reviewer`** — `tools: Read, Grep, Glob, Bash(git diff:*)`, `model: sonnet`

The job is judgment: reading a diff and deciding what's worth calling out (breaking changes, new dependencies, notable fixes) versus what's routine. That's a real reasoning task, which is why it gets Sonnet rather than Haiku.

The tools line looks like it breaks the "read-only worker" pattern by including `Bash`, but it's scoped to a single subcommand — `Bash(git diff:*)` — rather than granted wholesale. `git diff` doesn't mutate anything, so the subagent is read-only in effect even though it technically has shell execution capability. The alternative (no Bash at all, with the orchestrating command computing the diff and handing it over as context) was considered and rejected: it would mean the subagent can never pull more diff context on its own if it needs to double-check something mid-review, and the scoped-Bash approach still satisfies "tools limited to what the job needs" — it's just that the job needs `git diff` specifically, not general code editing.

**`write-changelog`** — `tools: mcp__notion__post_page`, `model: haiku`

The job here is mechanical: take a structured summary, format it into a title and body, call one API. No judgment calls about *whether* to post — that decision (tests passing) has already been made by the workflow before this subagent is ever invoked. That's a difficulty mismatch with `code-reviewer`'s job, which is why it gets Haiku instead of Sonnet — using Sonnet here would just be paying for reasoning capacity the task doesn't use.

Its tools line is a single MCP tool, nothing else — it can't read files, can't run Bash, can't do anything except the one write action it exists for. That's the tightest possible scope for a "write" worker, and it's deliberately narrower than `code-reviewer`'s, reflecting that this subagent's entire job is one API call rather than an open-ended investigation.

## Orchestration decision: why the workflow runs parallel-then-dependent, and what depends on what

The workflow has two independent branches and one dependent step:

- **Branch A (review)** and **Branch B (test)** run in parallel because neither's output depends on the other. Reviewing what changed in the diff and running the test suite are two separate questions about the same code — "what does this do" and "does it work" — and answering one doesn't require the answer to the other. Running them sequentially would just add latency for no benefit.

- **`write-changelog`** is the dependent step because it genuinely needs output from *both* branches: the review's summary (as the content to post) and the test result (as the gate on whether to post at all). It can't start until both branches finish.

An earlier design considered running a review-only pass with tests as a third parallel subagent, and separately considered treating a test failure as something that should invalidate and re-trigger the review. Both were dropped: tests don't need their own subagent (no context isolation or tool scoping the workflow command's own Bash access doesn't already provide), and a test failure doesn't make the review's findings about the diff go stale — the diff didn't change, only whether it currently passes tests did. If a test failure requires code changes, that's a new diff and a fresh invocation of the whole command, not a partial re-run of one branch.

The two-part gate (tests passed **and** review produced a usable summary) is enforced twice, deliberately: once in the workflow command's plain-language instructions, and once at the tool-call level via the `PreToolUse` hook on `mcp__notion__post_page`. The command expresses intent; the hook guarantees it — a hook checks a status file on disk rather than trusting the orchestrator to have correctly followed the command's wording every time, so a sloppy future edit to the command can't silently bypass the gate.
