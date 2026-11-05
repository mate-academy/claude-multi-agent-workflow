---
name: api-testing
description: Use when writing, reviewing, or planning automated tests for Express or other HTTP API endpoints, especially with node:test and supertest.
---
# API testing checklist

## What to cover for each endpoint
- The success path: status code and response body
- Each validation error: missing, empty, and wrong-type fields
- A missing record: `404`
- Malformed input: a non-numeric id or invalid JSON
- The error body shape, not only the status code

## How to write the tests
- Use the runner and helpers the project already uses.
- Import the Express app and do not start a real server.
- Reset shared state before each test.
- Name each test after its behaviour.
- Check one behaviour in each test.

## When a test exposes a real bug
Keep the correct expectation and mark the test as a todo:

```js
test('PUT /users/:id returns 400 for an empty name', { todo: 'BUG: empty name is accepted' }, async () => {
  // Assert the correct behaviour here.
});
```