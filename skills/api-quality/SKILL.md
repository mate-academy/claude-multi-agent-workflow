---
name: api-quality
description: Apply the project's API quality conventions when reviewing or testing Express routes, especially validation, HTTP status codes, error responses, and test coverage.
---

# API Quality

When working on the Express API:

## Routes

Follow the existing route structure.

Keep route handlers focused and consistent with neighboring routes.

## Validation

Validate required request data before calling the data layer.

Return HTTP 400 for invalid client input.

## Missing resources

Return HTTP 404 when the requested resource does not exist.

## Errors

Use the project's existing JSON error format.

## Tests

Tests should verify:

- successful requests;
- invalid requests;
- missing resources;
- HTTP status codes;
- important response values.

Use the existing Node test runner and Supertest conventions.

Before considering API changes complete:

1. Run the relevant tests.
2. Run the complete test suite.
3. Run the linter.
4. Review the final diff.