---
name: api-error-format
description: The error-response contract for Express APIs in this project. Use when writing or changing a route handler's error handling, status codes or validation messages.
---

# API error format

Every error response is JSON in one shape:

```json
{ "error": "<short human-readable message>" }
```

Status codes:
- `400` — the request is invalid: a required field is missing, empty, the wrong type, or an id is not a number. Validate before touching the store.
- `404` — the request is valid but the record does not exist. Message: `"<Resource> not found"`.
- `201` — created; `200` — read or updated; `204` — deleted, no body.

Rules:
- Never let a missing record throw — check the store result and return `404`.
- Never return HTML or a plain string as an error.
- Name the field in the message: `"email is required"`, not `"bad request"`.
