# Code Quality Plugin

A multi-agent plugin for comprehensive code quality analysis combining automated code review with test generation.

## Features

- **Parallel Code Review**: Fast analysis for bugs, security issues, and performance problems
- **Test Generation**: Automatic creation of comprehensive unit and integration tests
- **Format Checking**: Pre-commit hooks to catch formatting issues before they're committed
- **Quality Skill**: Detailed formatting issue reporting

## Installation

```bash
# Add the marketplace
/plugin marketplace add https://github.com/rolex17/claude-multi-agent-workflow

# Install the plugin
/plugin install code-quality@<your-marketplace>
```

## Usage

### Run the complete quality workflow:
```bash
/quality path/to/your/code
```

This will:
1. **In parallel**: 
   - Run code-reviewer to analyze for issues
   - Run test-writer to generate comprehensive tests
2. **Then sequentially**: Combine findings into an actionable report

### Check code formatting:
```bash
/format-check
```

Reports formatting issues without modifying files.

## What's Included

- **agents/code-reviewer.md**: Read-only agent for bug and security analysis
- **agents/test-writer.md**: Write-enabled agent for test generation  
- **commands/quality.md**: Orchestrates the workflow with parallel and sequential steps
- **skills/format-check/SKILL.md**: Format validation skill
- **hooks/hooks.json**: Pre-commit format checking
- **.claude-plugin/plugin.json**: Plugin manifest
- **.claude-plugin/marketplace.json**: Marketplace listing

## Plugin Design

This plugin demonstrates:
- **Scoped subagents**: Specialized read-only (reviewer) and write-enabled (test writer) agents
- **Parallel workflows**: Both analysis tasks run simultaneously for speed
- **Dependent steps**: Quality report only after both analysis phases complete
- **Bundled tools**: Skills and hooks tied to a single plugin namespace

## Requirements

- Claude Code with plugin support
- Node.js 18+ (for testing against course-api)

## Testing Locally

Before publishing, test against the course-api:

```bash
# 1. Set up the test API
cd course-api
npm install

# 2. In another terminal, load the plugin
claude --plugin-dir .

# 3. Test the workflow on course-api/routes
/quality course-api/routes
```
