# Notes

This plugin packages a small code-quality workflow for the course API in this repository. It installs as a Claude plugin and gives you a reviewer subagent for inspection, a fixer subagent for safe changes, and a workflow command that runs review and repair in sequence after an initial parallel analysis step.

## Installation

Clone the repository, ensure the API dependencies are installed with `cd course-api && npm install`, and then load the plugin from the repository root with `claude --plugin-dir .`.

## Scoping decision

The reviewer subagent is intentionally read-only. It only uses Read, Grep, and Glob so it can inspect code paths and report risks without making changes. That keeps the review step focused on analysis and reduces the chance of accidental edits.

## Orchestration decision

The workflow command starts with a parallel review step because the inspection work and the repair planning work are independent. After those findings are available, the fixer runs in sequence so it can act on the prioritized results instead of guessing.
