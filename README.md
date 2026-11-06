# API Quality Workflow Plugin

A Claude Code plugin for reviewing and testing Express APIs.

## Features

- **API Reviewer** — read-only API code review.
- **API Tester** — improves automated test coverage and runs tests.
- **Quality Check** — runs both agents in parallel and combines their results.
- **API Quality Skill** — shared review and testing guidelines.
- **Post-Edit Hook** — runs ESLint after file edits.

## Components

- `.claude-plugin/plugin.json` — plugin manifest.
- `agents/` — API reviewer and tester.
- `commands/quality-check.md` — workflow command.
- `skills/api-quality/SKILL.md` — API quality guidelines.
- `hooks/hooks.json` — automatic lint hook.

## Installation

Add the marketplace:

`/plugin marketplace add muron1011-code/claude-multi-agent-workflow`

Install the plugin:

`/plugin install api-quality-workflow@api-quality-marketplace`

## Usage

Run:

`/api-quality-workflow:quality-check`

The workflow reviews the API, checks test coverage, and produces a consolidated quality report.

## Local Development

Install dependencies in `course-api/` with `npm install`.

Load the plugin from the repository root using `claude --plugin-dir .`.

Run `npm test` and `npm run lint` from `course-api/` to validate the API.