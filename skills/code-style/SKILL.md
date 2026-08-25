---
name: code-style
description: Standards and guidelines for code reviews and test creation
---

# Code Quality Standards

When conducting code reviews or writing tests, follow these rules:

1. **Formatting and Clean Code**:
   - Use clear and descriptive names for variables and functions.
   - Follow the DRY (Don’t Repeat Yourself) and SOLID principles.
   - Avoid deeply nested conditional statements (if/else).

2. **Testing**:
   - Tests should cover both successful scenarios (happy path) and error handling (edge cases/errors).
   - Tests should be isolated and independent of one another.
   - Test names should clearly describe the expected behavior (for example, `should return 400 if email is invalid`).

3. **Security**:
   - Verify the validation of API input data.
   - Avoid leaking sensitive data (keys, passwords) in logs.