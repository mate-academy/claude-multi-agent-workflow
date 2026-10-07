---
name: api-contract-check
description: Check Express API route changes against course-api documentation when reviewing an endpoint or designing its regression tests.
---
Read course-api/CLAUDE.md and docs/api.md, then trace each changed route through db/store.js. Compare success status/body, missing-record behavior, and invalid-input behavior with the documented contract.
List a compact matrix of endpoint, input, expected status/body, existing coverage, and missing cases. For updates, verify that fields omitted from a partial update retain their old values. Keep confirmed mismatches separate from questions where documentation is silent. Do not edit production code or invent execution results.
