---
name: api-testing
description: Guidelines for testing Express REST APIs with Node.js.
---

# Express API Testing Guidelines

When testing an Express API:

1. Inspect existing routes before writing tests.
2. Use the project's existing testing framework.
3. Test successful HTTP requests.
4. Test invalid request bodies.
5. Test missing parameters.
6. Test authentication and authorization where applicable.
7. Test error responses.
8. Avoid modifying production code when writing tests.
9. Use clear and descriptive test names.
10. Report all test failures.
