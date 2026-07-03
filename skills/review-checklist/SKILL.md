---
name: review-checklist
description: Use when reviewing code, prioritizing review findings, or deciding which behaviors need tests. Provides the severity rubric and the API review checklist that the code-quality plugin's reviewer, test-writer, and quality-check command all follow.
---

# Review checklist

## Severity rubric

Rate every finding with exactly one of these levels:

- **critical** — corrupts data, crashes the process, or lets invalid input through a boundary (e.g. unvalidated body written to the store). Block the change.
- **major** — wrong observable behavior: incorrect status code, wrong error shape, missed edge case a caller will hit. Fix before merge.
- **minor** — works but misleads: dead code, duplication, a name that lies. Fix when touching the file.

Never report style issues a linter or formatter already catches.

## API review checklist

Work through these in order; each maps to a common defect class:

1. **Input validation** — every field read from a request is validated before use; bad input returns `400` with the project's error shape, and never reaches the data layer.
2. **Status codes** — `400` bad input, `404` missing record, `201` created, `200` otherwise. No `200` with an error body.
3. **Error shape** — all error responses use the same JSON shape the project already uses; check existing routes for it.
4. **Layering** — routes never hold or mutate state directly; all data access goes through the project's store/data module.
5. **Contract drift** — response fields match what docs and existing tests promise.

## Test-gap rules

A behavior needs a test when it is observable through the public interface and no existing test exercises it. Prioritize: error paths first (they break silently), then boundary values, then happy paths. Each gap is one sentence: the input, the expected observable result.
