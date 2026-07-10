# Code Quality & Testing Plugin

A Claude plugin that combines code review and test generation into a unified workflow. This plugin bundles two specialized subagents that work together to improve code quality.

## Features

- **Code Reviewer** — Analyzes code for bugs, anti-patterns, and improvements
- **Test Generator** — Creates comprehensive test cases based on code analysis
- **Unified Workflow** — Runs review and test generation in parallel, then synthesizes results
- **Code Analysis Skill** — Provides detailed metrics and insights about your codebase

## Installation

Install directly from the marketplace:

```bash
/plugin install code-quality-workflow@<marketplace-name>
```

## Usage

Run the complete workflow with a single command:

```bash
/review-and-test path/to/file.js
```

This will:
1. Analyze the code for quality issues (in parallel)
2. Generate test suggestions (in parallel)
3. Synthesize findings into actionable recommendations

## Components

- **Agents** — Two scoped subagents for specialized tasks
- **Commands** — `/review-and-test` workflow orchestrator
- **Skills** — Code analysis metrics and insights
- **Hooks** — Auto-format code on save (optional)

## Author

Built as part of the Claude Agents course.
