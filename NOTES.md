# Code Quality Plugin — Development Notes

## What the plugin does

The Code Quality plugin provides a multi-agent workflow for comprehensive code analysis and improvement. It bundles two specialized subagents (Code Reviewer and Code Fixer) that analyze your codebase in parallel, then synthesize their findings to recommend and apply targeted quality improvements. The plugin includes best practices guidelines and a pre-commit hook that suggests running quality checks before committing.

## How to install

1. Add this repository as a marketplace source:
   ```bash
   claude /plugin marketplace add https://github.com/PichurinR/claude-multi-agent-workflow
   ```

2. Install the code-quality plugin:
   ```bash
   claude /plugin install code-quality@<your-marketplace>
   ```

3. Verify installation by running:
   ```bash
   claude /review
   ```

## Scoping decision: Why the Reviewer is read-only

The **Code Reviewer** subagent is deliberately scoped to read-only tools (Read, Grep, Glob) for a critical reason: **analysis must be fast and side-effect-free**. 

A reviewer needs to scan the entire codebase to identify patterns and issues, which can be expensive. If the reviewer had write capabilities, there's a risk it could accidentally modify files during exploration, or waste tokens writing partial fixes instead of focusing on comprehensive analysis. By limiting it to read-only, the Reviewer operates like a fast scanner — it can quickly traverse the codebase, extract patterns, and generate a detailed report without the overhead of write operations or the danger of accidental modifications.

The **Code Fixer**, by contrast, has full write capability (Edit, Write) because its sole job is applying targeted improvements based on findings. This separation of concerns makes each agent efficient at its specific task.

## Orchestration decision: Why parallel then sequential

The workflow runs in two phases:

**Parallel phase (independent work):**
- Both Reviewer and Fixer analyze the codebase at the same time
- The Reviewer generates a comprehensive quality report (fast, read-only scanning)
- The Fixer identifies improvement opportunities and prepares potential fixes
- This parallelization saves time — we don't wait for the Reviewer to finish before the Fixer starts

**Dependent/Sequential phase (synthesis):**
- Once both agents complete their parallel analysis, the results are synthesized
- The Reviewer's critical and warning-level findings are prioritized
- The Fixer's suggested improvements are ranked by impact based on the Reviewer's severity assessment
- Fixes are applied in order of criticality, ensuring high-impact issues are addressed first

This design ensures **speed** (parallel analysis) while maintaining **prioritization** (sequential synthesis). If we ran everything sequentially (Reviewer → Fixer → Synthesize), analysis would take longer. If we ran everything in parallel without synthesis, fixes would be unpriororitized and scattered. The current approach balances both concerns.

## Testing against course-api

The plugin was tested locally against the included course-api (a small Express CRUD API) to ensure:
- Both subagents load correctly via `claude --plugin-dir .`
- The `/review` command triggers the parallel workflow
- The Reviewer correctly analyzes the API's routes, tests, and structure
- The Fixer successfully applies improvements to code files
- The pre-commit hook fires without errors

The course-api's small, well-structured codebase served as an ideal test target — it has enough real code to surface meaningful findings, but is simple enough to verify results quickly.
