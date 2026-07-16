---
name: api-quality-playbook
description: Checklist for reviewing and hardening Express routes in the course API.
---

# API Quality Playbook

Use this skill when reviewing or editing `course-api` endpoints.

## Route checklist
- Validate required inputs and return `400` with JSON error on invalid payloads.
- Return `404` when requested records do not exist.
- Keep all state changes in `db/store.js` helpers instead of route-local state.
- Keep responses consistent with `docs/api.md`.

## Test checklist
- Add happy-path and failure-path tests for each behavior change.
- Verify status codes and response body shapes.
- Prefer narrow tests that validate one behavior at a time.
