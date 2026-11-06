---
name: api-quality
description: Guidelines for reviewing, testing, and improving Express API quality.
---

# API Quality Guidelines

Use these guidelines when reviewing or testing an Express API.

## Review checklist

- Compare route behavior with the API documentation.
- Verify HTTP methods, response status codes, and JSON response shapes.
- Check required request fields and invalid input handling.
- Verify that missing resources return 404 responses.
- Confirm that routes use the shared data store instead of maintaining state.
- Look for edge cases involving invalid IDs and partial updates.

## Testing guidelines

- Use the project's existing test framework and conventions.
- Cover successful requests and expected error responses.
- Test missing required fields and nonexistent resources.
- Test partial updates when the API supports them.
- Reset shared test data between tests when necessary.
- Run the complete test suite after changing tests.

## Reporting

- Report findings with file paths and line references.
- Separate confirmed bugs from potential risks.
- Include test results and remaining coverage gaps.
- Never claim a fix is verified without running the relevant tests.
