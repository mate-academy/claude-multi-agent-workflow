---
name: api-quality
description: Quality checklist for Express routes in course-api/ covering input validation, status codes, the error shape, store access and tests. Use when writing, changing or reviewing a route, endpoint or handler in course-api/routes/.
---
# API quality checklist for course-api

Apply these rules whenever a route in course-api/routes/ is added, changed or reviewed.

## Structure
- One route file per resource in course-api/routes/, exporting an Express router.
- Mount each router in course-api/server.js under its base path, for example /users.
- All data access goes through course-api/db/store.js. Routes never keep their own state.

## Input validation
- Check required fields in the request body and return 400 when one is missing.
- Check types: an :id parameter must be a whole number, and names and emails must be non-empty strings.
- Return 400 for bad input before calling the store.

## Status codes
- 200 for a successful read or update.
- 201 for a created record, with the new record in the body.
- 400 for bad input.
- 404 when the record does not exist.

## Error shape
- Every error response is JSON in the shape { "error": "message" }.
- Keep messages short and specific, for example "name and email are required".

## Tests
- Every route has tests in course-api/tests/ for the success case, the 400 case and the 404 case.
- Tests use node:test, node:assert and supertest, and call store.reset() in a beforeEach.
- Run them from course-api/ with npm test.

## Docs
- Keep course-api/docs/api.md in step with the routes: method, path, body and responses.
