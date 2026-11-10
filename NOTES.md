
# Project Notes

## What the plugin does

API Quality is a Claude Code plugin that reviews and tests
an Express API using two specialized agents.

## Installation

Add the GitHub repository as a marketplace and install
the api-quality plugin.

## Agent scoping decision

The code-reviewer agent uses only Read, Grep, and Glob.
It does not need write permissions because its job is
to inspect code and report problems.

The test-engineer agent has Write, Edit, and Bash because
it needs to create tests and execute them.

## Workflow decisions

The code reviewer and test engineer run in parallel
because their initial analysis is independent.

The final report runs sequentially because it needs
the results from both agents.
