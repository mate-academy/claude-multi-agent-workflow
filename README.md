# Code Quality Plugin

A multi-agent code review and quality improvement workflow for Claude Code.

## What it does

The Code Quality plugin bundles two specialized agents that work together:

- **Code Reviewer** — Analyzes your codebase for quality issues, violations of best practices, and improvement opportunities (read-only, fast analysis)
- **Code Fixer** — Applies targeted fixes and refactorings to improve code quality (writes and edits files)

They run in parallel for analysis, then sequentially to prioritize and apply improvements. Use the `/review` command to trigger the full workflow.

## Installation

After the plugin is published to the marketplace:

```bash
claude /plugin marketplace add <repo-url>
claude /plugin install code-quality@<marketplace>
```

## Usage

```bash
claude /review
```

The workflow will:
1. Launch both Reviewer and Fixer agents in parallel
2. Synthesize their findings
3. Recommend prioritized fixes based on impact

## What's included

- **Two subagents**: Reviewer (read-only) and Fixer (write capability)
- **Multi-agent workflow command** (`/review`): Orchestrates both agents with parallel and dependent steps
- **Code Quality Best Practices skill**: Guidelines for readability, testing, performance, error handling, and documentation
- **Pre-commit hook**: Suggests running quality checks before commits

## Configuration

The plugin works with any codebase. The agents use contextual analysis to identify issues specific to your project structure and patterns.

## Best practices

- Run `/review` regularly to stay on top of quality issues
- Review the Reviewer's critical-level findings first
- Test the Fixer's changes before committing automatically-applied fixes
- Use the skill guide to align your team on quality standards
