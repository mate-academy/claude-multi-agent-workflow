---
name: api-test-conventions
description: Use when writing, adding or fixing tests for the Express API routes, for example "add tests for DELETE /users/:id" or "cover the 404 case for PUT". Covers the node:test and supertest style, store.reset in beforeEach, and which status codes to cover. Not for non-test code.
---

# How tests are written in this API

Follow the style of the existing tests in `<api>/tests/`. Read one of them first.

## Setup
- Use `node:test` and `node:assert`, plus `supertest` for HTTP calls.
- Import the app with `require('../server')` and the store with `require('../db/store')`.
- Start every test file with `test.beforeEach(() => store.reset());` so each test begins with the seed data.

## What to write
- One test per behavior. Name it `METHOD /path` plus what it does, for example `PUT /users/:id returns 404 for a missing user`.
- For each route cover the success case, `400` for bad input (a missing field, an empty value, a wrong type), and `404` for a missing record.
- Check the error body too. It must be `{ error: 'message' }`.
- Use the seeded users (ids 1 and 2) for existing records and a high id such as `999` for a missing one.
- Do not repeat a test that already exists.

## Known bugs
If the code does not yet do what is right, still write the test for the correct behavior, but mark it as a to-do so the suite stays green: `test('name', { todo: 'what is wrong' }, async () => { ... })`.

## Run them
From the API folder, run `npm test`. Tests are only finished when you have seen them run.
