# NOTES

My notes on the `code-quality` plugin — what it does, how to install it, and the
two decisions the project asked me to explain.

## What the plugin does

It's a small code-quality workflow for the course API. It reviews the API's route
files against the project conventions and then writes regression tests for whatever
the review turns up. It's made of two subagents (`api-reviewer`, `test-author`), one
workflow command (`/quality-check`), one skill (`api-conventions`), and a hook that
reminds me to lint and test after edits.

## How to install it

As a plugin from this marketplace (I tested this as my own first user, in a fresh
session):

```
/plugin marketplace add <this repo>
/plugin install code-quality@cecilia-plugins
```

Or to run it straight from a clone without installing — load it from the repo root:

```
claude --plugin-dir .
```

Then run `/quality-check`, and use `@api-reviewer` / `@test-author` directly if I
only want one of them. First time, `cd course-api && npm install` so the tests can
run.

## One scoping decision (and why)

**`api-reviewer` is read-only; `test-author` can write and run code.**

I gave `api-reviewer` only `Read, Grep, Glob` — no `Write`, no `Edit`, no `Bash`.
Its whole job is to look at a route and tell me what's wrong. If I also handed it
`Edit`, it might "helpfully" start changing the code while it reviews, and then I
can't trust the review as an independent opinion. Locking the tools down makes the
boundary real instead of just asking it nicely to behave. I put it on `sonnet`
because judging whether code follows a handful of conventions is steady reasoning,
not the hardest job in the plugin.

`test-author`, on the other hand, genuinely has to change the repo: write a test
file, and run `npm test` to prove it passes. So it gets `Write`, `Edit`, and `Bash`
— the extra tools are the point of that agent. I put it on `opus` because writing a
test that actually passes (right imports, right supertest calls, right assertions)
and then reading a failure and fixing it is the harder, more error-prone work, so it
gets the stronger model.

So the two agents are deliberately different: a read-only critic and a writer, each
with exactly the tools its job needs and a model matched to how hard that job is.

## One orchestration decision (and why)

In `/quality-check`, the two route reviews run **in parallel** but the test step
runs **after** them (dependent/sequential).

- **Parallel:** reviewing `routes/users.js` and `routes/health.js` are completely
  independent — neither review needs anything from the other. Running two
  `api-reviewer` subagents at once just gets me both reports sooner, with no
  downside.
- **Sequential:** the `test-author` step can't start until the reviews are done,
  because its whole input *is* the findings — it writes tests for the issues the
  reviewers raised. Starting it early would mean writing tests with nothing to aim
  at. So that step waits on the parallel step to finish.

That's the shape the project asked for: independent work running together, then one
step that depends on those results.
