# Quality Workflow Plugin

A multi-agent workflow plugin for Claude Code that automates code review, test generation, and quality checks.

## Components

- **Agents**:
  - `reviewer`: Read-only agent that analyzes code for bugs and quality issues.
  - `tester`: Agent that generates unit tests and runs `npm test`.
- **Command**:
  - `/workflow`: Executes a two-phase review and testing workflow.
- **Skill**:
  - `quality-check`: Guidelines for Express API quality and test standards.
- **Hook**:
  - Automatically runs tests on file edits.

## Usage

```bash
claude plugin marketplace add .
claude plugin install quality-workflow
