# Notes on shipwright

## What it does

`shipwright` automates cutting a release for `course-api/`: it reads what's
changed since the last version, writes a changelog entry, bumps the version
number, and stops a `git push` that would leave a release behind.

## Install

```
/plugin marketplace add <this-repo-url-or-path>
/plugin install shipwright@shipwright-marketplace
```

Then run `/release` from a session with the plugin loaded.

## Scoping decision: why release-scout is read-only and on haiku

`release-scout`'s job is to read `CHANGELOG.md` and the source tree and
organize what it finds — it never needs to change anything, so its tools
are limited to `Read, Grep, Glob`. That also makes it cheap: reading and
categorizing text is a low-judgment task, so it runs on `haiku` rather than
a larger model. `release-writer`, by contrast, has to make a real judgment
call (which semver bump applies) and produce well-formed prose for the
changelog, so it gets `Edit` and runs on `sonnet`.

## Orchestration decision: why scout+tests run in parallel, writer runs after

`release-scout` reading the changelog/source tree and running
`course-api`'s test suite are completely independent of each other — neither
needs the other's output — so `/release` runs them in parallel to avoid
waiting twice. `release-writer` is different: it needs `release-scout`'s
categorized summary as input, and it should never run if the tests failed,
so it's a dependent step that waits on both parallel tasks finishing first.
