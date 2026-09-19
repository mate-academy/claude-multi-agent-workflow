---
name: manipulate-routes
description: Any manipulation with routes (create/update/delete) should be done based on contract described in course-api/docs/api.md, after route manipulation done course-api/docs/api.md should be updated reflecting current routes state and description following existing structure.
---

## When to use
Whenever user asks to do any soft of manipulation with route code (create/update/delete)

## Instructions
1. Before updating route look for course-api/docs/api.md and understand the contract about how routes are built, which pattern they should match.
2. Do not invent non-existing contracts about routes, source of truth is course-api/docs/api.md file.
3. Do route code manipulation users ask for following the contract described in course-api/docs/api.md.
4. After route code manipulation was done - reflect the changes in the list of routes in course-api/docs/api.md file, so that documentation stays up to date with current code.
5. Do not change routes description in documentation that was not participated in current task, only once that were manipulated during process.
5. Final step is to provide user with information what was done and what was changed in documentation (course-api/docs/api.md) in following format:

Routes changed:
- [name of file]
  [] [name of route (method, url and name)] - [brief description of changes in code for route]

Documentation updated:
- [number of line in documentation] - [brief description of changes in documentation for route].