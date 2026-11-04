---
name: express-conventions
description: Conventions for writing and reviewing Express.js routes in this project. Use when adding, editing, or reviewing an API endpoint.
---

When working on Express routes:
- Validate request input before using it. Return 400 with a clear message if it's bad.
- Use correct status codes: 200 OK, 201 created, 204 no content, 400 bad input, 404 not found, 500 server error.
- Wrap async handlers so errors reach the error middleware instead of crashing.
- Never return passwords, tokens, or stack traces in a response.
- Every new route gets at least one success test and one failure test.