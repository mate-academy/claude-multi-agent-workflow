# Plugin Notes: code-quality

## What this plugin does

This is a Claude Code plugin that bundles a multi-agent workflow for code quality review. It includes:

- **Two scoped subagents** in `agents/`:
  - `code-editor-agent` — a write-capable agent for implementing fixes, refactoring, and code edits (uses Sonnet model, read/write/tools)
  - `code-quality-reviewer` — a read-only reviewer that analyzes code for bugs, convention violations, simplification opportunities, and test coverage gaps (uses Opus model, read/search tools only)

- **A workflow command** in `commands/` that orchestrates the two subagents: it runs the code-quality-reviewer first to identify issues, then the code-editor-agent to apply fixes. The reviewer runs in parallel with initial analysis, and the editor step depends on the reviewer's findings.

- **A skill** in `skills/` for code review workflows and a **hook** in `hooks/` that runs a post-agent script after any tool use, configured via `${CLAUDE_PLUGIN_ROOT}` for portable path resolution.

- **Plugin manifest** at `.claude-plugin/plugin.json` and **marketplace catalog** at `.claude-plugin/marketplace.json` for easy installation.

- **README.md** with task breakdown and definition of done.

## How to install

1. Ensure you have this repo cloned and the course API ready: `cd course-api && npm install`
2. Load the plugin locally:

```bash
claude --plugin-dir .
```

3. Run the plugin against the course API to confirm each piece fires by its namespaced name, and that the workflow command orchestrates the subagents in the right order.

4. Use `/reload-plugins` to pick up edits as you refine.

5. To install from the marketplace (after publishing):

```bash
/plugin marketplace add <your-repo-url>
/plugin install code-quality@your-marketplace-version
```

## Scoping decision: why subagents got their specific tools and model

- **code-editor-agent** was given `Read, Edit, Write, Grep, Glob` tools and the **Sonnet** model because its job is to actively edit code — implement fixes from reviews, refactor, and modify files. Sonnet offers a good balance of capability and cost for writing and editing tasks, and the write tool access is essential for its purpose.

- **code-quality-reviewer** was given `Read, Grep, Glob` tools (no write) and the **Opus** model because it needs deep reasoning and broad codebase search capability to analyze correctness, conventions, and test coverage without modifying anything. Opus was chosen for its superior analysis and reasoning abilities for read-only review work.

Keeping the reviewer read-only ensures it can safely examine any code without risk of accidental changes, while the editor agent has the tools it needs to actually implement fixes.

## Why the workflow command runs steps in parallel versus in sequence

The workflow command first runs the **code-quality-reviewer** subagent, and then the **code-editor-agent** depends on its findings. The reviewer runs as an initial step to analyze the codebase and report issues. Once the reviewer completes and its findings are verified, the editor agent runs to apply fixes.

The parallel-versus-sequence design here is: the reviewer's analysis is the prerequisite (dependent step), but within the overall workflow, the reviewer runs first and its output gates the editor step. There's no true parallelism between these two since the editor needs the reviewer's results — however, the workflow is structured so that the reviewer's work is completed before the editor begins, ensuring fixes are based on confirmed issues rather than speculative analysis. This sequential dependency ensures correctness: the editor only acts on verified findings, avoiding wasted effort on false positives.