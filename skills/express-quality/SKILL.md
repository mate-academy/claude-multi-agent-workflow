---
name: express-quality
description: Apply this repository's Express API quality conventions when creating, modifying, fixing, or reviewing routes, validation, stores, and tests.
---

# Express API quality conventions

When working in `course-api/`:

1. Keep one router per resource.
2. Mount routers from the application entry point.
3. Access data through the shared store rather than creating state inside route files.
4. Validate required request fields before calling the store.
5. Return `400` for invalid input.
6. Return `404` when a requested resource does not exist.
7. Return JSON errors in this format:

```json
{
  "error": "message"
}
```
