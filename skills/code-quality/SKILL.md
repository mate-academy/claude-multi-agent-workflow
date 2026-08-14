---
name: code-quality-best-practices
description: Guidelines and patterns for maintaining high code quality standards
---

## Code Quality Best Practices

### Readability Standards
- Functions should have a single, clear responsibility
- Variable names should be descriptive (no single-letter vars except loop counters)
- Code should require minimal comments to understand intent
- Nesting depth should not exceed 3 levels

### Testing Expectations
- Critical paths should have test coverage
- Tests should validate behavior, not implementation details
- Test names should describe the scenario and expected outcome
- Integration tests should use real dependencies when possible

### Performance Considerations
- Avoid nested loops for large datasets
- Cache computed values that are used multiple times
- Use appropriate data structures (arrays for sequential, objects for lookup)
- Profile before optimizing; don't premature-optimize

### Error Handling
- Validate at system boundaries (user input, external APIs)
- Provide context in error messages
- Fail fast for critical errors
- Log errors with enough detail for debugging

### Documentation Requirements
- Public APIs should have brief usage examples
- Complex algorithms should include explanation
- Breaking changes must be documented
- Assume readers lack the context you have
