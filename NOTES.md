# Implementation Notes

## Plugin

The `api-quality-kit` plugin provides a multi-agent workflow for
reviewing and testing the Express course API.

The plugin contains:

- two scoped subagents;
- a workflow command;
- an API quality skill;
- a test hook;
- a plugin manifest;
- a marketplace catalog.

## Installation

For local development:

```text
claude --plugin-dir .