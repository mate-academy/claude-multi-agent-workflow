---
name: api-conventions
description: Conventions for Express API routes - where input is validated, which status codes to return, the JSON error shape, and routing all data through the store. Use when adding, changing, reviewing or testing API routes or endpoints.
---
# API conventions

Follow these whenever you add or change an endpoint in an Express API laid out as `server.js`, `routes/`, `db/store.js` and `tests/`. If the API folder has its own `CLAUDE.md`, that file wins where it differs.

## Routes
- One route file per resource in `routes/`, exporting an Express router; mount it in `server.js` under its base path.
- Validate input in the route, before touching the store. Treat a missing field, an empty string and a value of the wrong type as bad input.
- Return `400` for bad input and `404` when a record is missing - including an ID that is not a number.
- Apply the same validation to the same field everywhere (create and update must agree).

## Errors
- Every error response is JSON in the shape `{ "error": "message" }`.
- Use plain messages that name the problem (`name and email are required`, `User not found`).

## Data
- All data access goes through `db/store.js`. Routes never hold state.
- Store helpers should not hand out their internal arrays or objects for callers to mutate.

## Tests
- Node's built-in runner plus `supertest`; `store.reset()` in `test.beforeEach` so every test starts clean.
- One `test()` per behaviour, named `METHOD /path <what happens>`.
- Cover the success status and every `400` and `404` branch of each endpoint.
- When code breaks a convention, write the test for the correct behaviour and mark it `{ todo: '<reason>' }` rather than changing the assertion.

## Before you finish
Run `npm test` and `npm run lint` in the API folder and report the real output.
