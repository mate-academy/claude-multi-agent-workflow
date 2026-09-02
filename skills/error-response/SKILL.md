---
name: error-response
description: Apply this course API's JSON error-response convention when adding or changing Express route validation or missing-record handling.
---

When changing an Express route under `course-api/routes/`:

1. Validate input before calling the data layer.
2. Return status `400` for invalid request data.
3. Return status `404` when the requested record does not exist.
4. Use the JSON shape `{ "error": "message" }` for every client-visible error.
5. Add a focused Supertest assertion for the status code and body.

Return the affected route, the error cases covered, and the verification command result.
