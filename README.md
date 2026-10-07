# API Quality Kit

A Claude Code plugin for reviewing and testing Express APIs using a
multi-agent workflow.

## What it provides

- `code-reviewer` — read-only API code reviewer.
- `test-writer` — creates and improves API tests.
- `/api-quality-kit:quality-check` — orchestrates the agents.
- `api-quality` skill — reusable API quality conventions.
- Post-tool hook — runs API tests after file edits.

## Installation

Add the marketplace:

```text
/plugin marketplace add mrlkrishna404/claude-multi-agent-workflow