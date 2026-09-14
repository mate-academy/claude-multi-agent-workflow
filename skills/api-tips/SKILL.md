---
name: api-tips
description: Best practices for working with the course Express API.
---
When working with the course-api:
- Always validate input and return 400 for bad input.
- Use db/store.js for all data persistence.