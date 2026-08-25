# Plugin Documentation & Design Decisions

## 1. What the Plugin Does & How to Install It
- **Overview:** The `code-quality-workflow` plugin bundles multi-agent code inspection, automated remediation, formatting rules, and validation hooks into a single shareable toolkit designed to run against the course API.
- **Installation:**
  1. Add your marketplace: `/plugin marketplace add <your-repo-url>`
  2. Install the plugin: `/plugin install code-quality-workflow@<your-marketplace-name>`

## 2. Scoping Decision
- **Subagent (`code-reviewer`):** Restricted solely to read-only capabilities (`Read`, `Search`). No `model` is pinned, so it inherits the session model. This ensures accidental file modifications can't happen during the inspection phase.
- **Subagent (`code-fixer`):** Equipped with file modification permissions (`Read`, `Edit`, `Write`, `Search`). No `model` is pinned, so it inherits the session model, keeping remediation quality consistent with whatever model is driving the session.

## 3. Workflow Orchestration Decision
- **Parallel Step:** Code analysis and issue discovery are run simultaneously to gather comprehensive findings across independent modules as quickly as possible.
- **Sequential (Dependent) Step:** Remediation strictly waits for the analysis results to complete before executing, ensuring that the `code-fixer` agent applies fixes directly to verified problem areas identified in the review report.
