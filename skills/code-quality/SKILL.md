---
name: api-quality
description: Apply the project's Express API quality conventions when reviewing or changing API routes, including validation, status codes, and tests.
---

For Express API work:
- validate required input before data access
- return clear JSON errors
- use appropriate HTTP status codes
- handle missing resources with 404
- keep data access in the existing store layer
- add focused tests for success and error cases
