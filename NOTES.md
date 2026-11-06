This plugin provides an automated, multi-agent workflow designed for continuous code quality monitoring and comprehensive unit test generation.

### Installation Steps:
1. Open Claude Code inside your repository.
2. Register the marketplace repository:
   `/plugin marketplace add https://github.com/Anna-0805/claude-multi-agent-workflow`
3. Install the plugin using its explicit namespace:
   `/plugin install qa-workflow-kit@anna-marketplace`

## Scoping Decision
We carefully scoped our custom subagents based on their individual tasks and potential impact on the codebase:
- **`code-reviewer`**: Designated strictly as a **read-only** worker. It is equipped only with `Read, Grep, Glob` tools and runs on the faster, cost-efficient `haiku` model. This strict constraint guarantees that the initial exploration phase can never accidentally corrupt or mutate production source code.
- **`test-generator`**: Authorized with **write** access (`Write` tool included) and powered by the advanced `sonnet` model. Developing deep test coverage requires robust architectural reasoning, accurate framework knowledge, and file creation capabilities, justifying the more capable model.

## Orchestration Decision
The `audit` workflow command optimizes time and token usage by separating tasks into parallel and sequential phases:
- **Parallel Phase**: The `code-reviewer` and the generic function complexity analysis run concurrently. Since data collection and error scanning are independent operations that do not rely on each other's outputs, running them together significantly reduces the overall execution time.
- **Sequential Phase**: The `test-generator` is strictly dependent on the output from the parallel phase. It must wait until the full bug report and complexity list are compiled so it can intelligently target its file modifications, preventing out-of-scope testing and minimizing unnecessary API tokens.
## Skill & Hook Integration Architecture
To ensure system-wide consistency and pass strict validation criteria, the repository structure tightly couples lifecycle triggers with contextual domain knowledge:
- **Automation Hook**: Configured via `hooks/hooks.json` as a `pre-commit` quality gate. It programmatically isolates and triggers the automated validation test suite inside the `course-api` environment (`node --test`) before code state serialization.
- **Skill Alignment**: Contextual awareness is provided via the `qa-guidelines` skill theme. It seamlessly injects static analysis instructions into the AI context, establishing target standards for the sequential workflow before the code reaches the mutation phase.