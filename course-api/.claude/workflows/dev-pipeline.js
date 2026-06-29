export const meta = {
  name: 'dev-pipeline',
  description: 'Classic Planner → Coder → Code Review → Tester → Git Commit pipeline for course-api',
  phases: [
    { title: 'Plan',   detail: 'Planner reads the codebase and produces a structured implementation plan' },
    { title: 'Code',   detail: 'Coder implements the plan and writes tests' },
    { title: 'Review', detail: 'Code Reviewer checks correctness, conventions, and edge cases' },
    { title: 'Test',   detail: 'Tester runs npm test + npm run lint' },
    { title: 'Fix',    detail: 'Fixer addresses review findings and test failures (up to max_fix_rounds)' },
    { title: 'Commit', detail: 'Git Commit agent stages and commits the passing changes' },
  ],
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary:              { type: 'string' },
    files_to_modify:      { type: 'array', items: { type: 'string' } },
    files_to_create:      { type: 'array', items: { type: 'string' } },
    steps:                { type: 'array', items: { type: 'string' } },
    acceptance_criteria:  { type: 'array', items: { type: 'string' } },
    test_cases:           { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'files_to_modify', 'files_to_create', 'steps', 'acceptance_criteria', 'test_cases'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    approved: { type: 'boolean' },
    blocking_issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file:  { type: 'string' },
          issue: { type: 'string' },
          fix:   { type: 'string' },
        },
        required: ['file', 'issue', 'fix'],
      },
    },
    suggestions: { type: 'array', items: { type: 'string' } },
    summary:     { type: 'string' },
  },
  required: ['approved', 'blocking_issues', 'suggestions', 'summary'],
}

const TEST_SCHEMA = {
  type: 'object',
  properties: {
    passed:      { type: 'boolean' },
    test_output: { type: 'string' },
    lint_output: { type: 'string' },
    failures:    { type: 'array', items: { type: 'string' } },
  },
  required: ['passed', 'test_output', 'lint_output', 'failures'],
}

const COMMIT_SCHEMA = {
  type: 'object',
  properties: {
    committed:      { type: 'boolean' },
    commit_hash:    { type: 'string' },
    commit_message: { type: 'string' },
    error:          { type: 'string' },
  },
  required: ['committed', 'commit_message'],
}

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT = '/Users/ton/Code/claude-multi-agent-workflow/course-api'

const CONVENTIONS = `
Project root: ${ROOT}

Architecture:
- server.js        — entry point; creates Express app, mounts routers, listens
- routes/          — one file per resource (users.js, health.js), each exports an Express router
- db/store.js      — in-memory data helper; ALL data access goes through this file

Conventions (from CLAUDE.md):
- One route file per resource; mount it in server.js under its base path
- All data access goes through db/store.js — routes never hold state directly
- Validate input in the route: return 400 on bad input, 404 when a record is missing
- Error responses are JSON: { "error": "message" }
- Tests use Node's built-in test runner (node:test) with supertest
- npm test runs all tests; npm run lint runs ESLint
`.trim()

// args can be a plain string (when invoked via /dev-pipeline skill) or an object
const task         = (args && typeof args === 'object' && args.task)
  ? args.task
  : (args && typeof args === 'string' ? args.replace(/^["']|["']$/g, '').trim() : null)
const maxFixRounds = (args && typeof args === 'object' && args.max_fix_rounds) ? args.max_fix_rounds : 3

if (!task) throw new Error('No task provided. Pass args as a string or { task: "..." }.')

log(`Task: ${task}`)

// ── Phase 1: Plan ─────────────────────────────────────────────────────────────

phase('Plan')

const plan = await agent(
  `You are the Planner agent in a software development pipeline.

${CONVENTIONS}

Your task: ${task}

Read the relevant files to understand the codebase fully, then produce a detailed, step-by-step implementation plan. Be specific: name the exact files and functions to change. Include test cases that should be written to verify the new behaviour.`,
  { label: 'planner', phase: 'Plan', schema: PLAN_SCHEMA },
)

log(`Plan: ${plan.summary}`)
log(`Files to touch: ${[...plan.files_to_modify, ...plan.files_to_create].join(', ')}`)

// ── Phase 2: Code ─────────────────────────────────────────────────────────────

phase('Code')

await agent(
  `You are the Coder agent in a software development pipeline.

${CONVENTIONS}

Your task: ${task}

Implementation plan handed to you by the Planner:
  Summary : ${plan.summary}
  Steps   :
${plan.steps.map((s, i) => `    ${i + 1}. ${s}`).join('\n')}
  Files to modify : ${plan.files_to_modify.join(', ')}
  Files to create : ${plan.files_to_create.join(', ')}
  Test cases to write:
${plan.test_cases.map((t, i) => `    ${i + 1}. ${t}`).join('\n')}
  Acceptance criteria:
${plan.acceptance_criteria.map((c, i) => `    ${i + 1}. ${c}`).join('\n')}

Read each file that needs changing before editing it. Implement every step, write all test cases, and make sure existing tests remain passing. Do not leave placeholder TODOs.`,
  { label: 'coder', phase: 'Code' },
)

log('Implementation complete. Starting parallel review and test run...')

// ── Phases 3 & 4: Review + Test (parallel, repeated until pass or round limit) ──

let round = 0
let allPassed = false
let lastReview = null
let lastTest = null

while (round < maxFixRounds && !allPassed) {
  round++

  const reviewLabel = `reviewer-r${round}`
  const testerLabel = `tester-r${round}`
  const reviewPhase = `Review (round ${round})`
  const testPhase   = `Test (round ${round})`

  const [review, testResult] = await parallel([
    () => agent(
      `You are the Code Reviewer agent in a software development pipeline.

${CONVENTIONS}

Task that was implemented: ${task}

Acceptance criteria from the plan:
${plan.acceptance_criteria.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

Review checklist:
1. Run: git -C ${ROOT} diff HEAD  — inspect every changed line
2. Correctness — does the implementation fulfil the task and acceptance criteria?
3. Convention compliance — routes don't hold state, errors use { "error": "…" }, 400/404 returned correctly
4. Code quality — no unnecessary complexity, no dead code, no security issues
5. Edge cases — are all edge cases handled (e.g. missing body fields, non-numeric IDs)?

Set approved=true ONLY if there are zero blocking issues. List every blocking issue with a concrete fix.`,
      { label: reviewLabel, phase: reviewPhase, schema: REVIEW_SCHEMA },
    ),
    () => agent(
      `You are the Tester agent in a software development pipeline.

${CONVENTIONS}

Run the full test suite and linter:
  1. cd ${ROOT} && npm test
  2. cd ${ROOT} && npm run lint

Capture the full stdout/stderr of both commands in test_output and lint_output.
Set passed=true ONLY when both commands exit with code 0 and zero failures.
List each individual test failure or lint error in the failures array.`,
      { label: testerLabel, phase: testPhase, schema: TEST_SCHEMA },
    ),
  ])

  lastReview = review
  lastTest   = testResult

  const reviewStatus = review.approved   ? 'APPROVED' : `REJECTED (${review.blocking_issues.length} issues)`
  const testStatus   = testResult.passed ? 'PASSED'   : `FAILED (${testResult.failures.length} failures)`
  log(`Round ${round} — Review: ${reviewStatus} | Tests: ${testStatus}`)

  if (review.approved && testResult.passed) {
    allPassed = true
    break
  }

  if (round < maxFixRounds) {
    const fixPhase = `Fix (round ${round})`
    const issues   = []

    if (!review.approved && review.blocking_issues.length > 0) {
      issues.push('CODE REVIEW BLOCKING ISSUES:')
      review.blocking_issues.forEach(b => issues.push(`  • ${b.file}: ${b.issue}\n    Fix: ${b.fix}`))
    }
    if (!testResult.passed && testResult.failures.length > 0) {
      issues.push('TEST / LINT FAILURES:')
      testResult.failures.forEach(f => issues.push(`  • ${f}`))
    }
    if (!testResult.passed && testResult.test_output) {
      issues.push('Test output (truncated):\n' + testResult.test_output.slice(0, 3000))
    }
    if (!testResult.passed && testResult.lint_output) {
      issues.push('Lint output (truncated):\n' + testResult.lint_output.slice(0, 2000))
    }

    log(`Fixing issues from round ${round}...`)

    await agent(
      `You are the Fixer agent in a software development pipeline.

${CONVENTIONS}

The implementation for the following task has issues that must be corrected:
  Task: ${task}

Issues found in round ${round}:
${issues.join('\n')}

Read the current state of every affected file before editing. Fix ALL listed issues. Follow all project conventions. Do not introduce new problems.`,
      { label: `fixer-r${round}`, phase: fixPhase },
    )
  }
}

// ── Phase 5: Commit ───────────────────────────────────────────────────────────

phase('Commit')

if (!allPassed) {
  const reviewMsg = lastReview && !lastReview.approved
    ? `Review issues: ${lastReview.blocking_issues.map(b => b.issue).join('; ')}`
    : ''
  const testMsg = lastTest && !lastTest.passed
    ? `Test failures: ${lastTest.failures.join('; ')}`
    : ''

  log(`Pipeline could not resolve all issues within ${maxFixRounds} fix rounds. Manual intervention needed.`)
  log(reviewMsg)
  log(testMsg)

  return {
    status:  'failed',
    task,
    plan,
    rounds:  round,
    review:  lastReview,
    tests:   lastTest,
    message: 'Exceeded max_fix_rounds without passing all checks.',
  }
}

log('All checks passed. Committing changes...')

const commitResult = await agent(
  `You are the Git Commit agent in a software development pipeline.

All checks passed. Your job is to commit the implementation.

Project root: ${ROOT}

Steps:
1. Run: git -C ${ROOT} status                       — see what changed
2. Stage only the files relevant to: ${task}
   (do NOT blindly git add -A — skip any .env or generated files)
3. Commit using a heredoc so the message is formatted correctly:

   git -C ${ROOT} commit -m "$(cat <<'EOF'
   <concise subject under 72 chars>

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   EOF
   )"

4. Run git -C ${ROOT} log -1 --oneline to get the commit hash.
5. Return committed=true with the hash and the commit message you used.

Task implemented: ${task}
Plan summary   : ${plan.summary}`,
  { label: 'git-commit', phase: 'Commit', schema: COMMIT_SCHEMA },
)

if (commitResult.committed) {
  log(`Committed ${commitResult.commit_hash}: ${commitResult.commit_message}`)
} else {
  log(`Commit failed: ${commitResult.error || 'unknown error'}`)
}

return {
  status: commitResult.committed ? 'success' : 'commit-failed',
  task,
  plan,
  rounds: round,
  commit: commitResult,
}
