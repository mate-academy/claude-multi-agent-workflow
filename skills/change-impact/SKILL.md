---
name: change-impact
description: Use before renaming, removing or changing the shape of anything other code depends on — a function signature, a DB column or table, an API field or route, a config key, an env var, an event or message format. Triggers on "what breaks if I change X?", "who uses this?", "is it safe to rename/drop this?", "impact of this migration". Finds every dependent and returns a checklist of what must change together.
---

# Change impact check

Use this to find everything that will break or behave differently when one thing changes. The output is a checklist the implementer works through, so nothing is missed in the same change.

## 1. Name the change precisely

Write one line: what is changing, from what, to what.
Example: `column bookings.start_date: DATE → TIMESTAMPTZ` or `GET /api/cars → paginated response`.

## 2. Find direct dependents

Search for every spelling of the identifier, not just the obvious one:

- the exact name, plus its other casings (snake_case, camelCase, PascalCase, kebab-case, UPPER_CASE)
- string usages: SQL in strings, ORM field names, JSON keys, route strings, log messages
- dynamic access: `getattr`, `obj[key]`, reflection, templates, config lookups
- generated code and schemas: OpenAPI/JSON schema, GraphQL, protobuf, ORM models, TypeScript types

## 3. Find indirect dependents

Go one level further:

- **Data**: views, materialized views, triggers, indexes, constraints, stored procedures, ETL/ELT jobs, dbt models, dashboards, exports, scheduled queries
- **Contracts**: API consumers, webhooks, message/queue consumers, partner integrations, mobile or front-end clients
- **Config and infra**: env files and their examples, Helm/K8s manifests, Terraform, CI pipelines, feature flags
- **Docs and fixtures**: README, ADRs, API docs, seed data, sample payloads

## 4. Classify each dependent

For each hit, mark one of:

- **must change**: breaks if left as is
- **should check**: may behave differently (rounding, timezone, null handling, ordering, defaults)
- **external**: lives outside this repo; someone has to be told

## 5. Decide on compatibility

If any dependent is external or deployed separately, prefer a compatible sequence over a big-bang change: add the new thing → migrate readers → migrate writers → remove the old thing. Say which step this change covers.

## Output

## Change
one line from step 1

## Must change (same PR)
- path:line — what to update

## Should check
- path:line — what might behave differently and why

## External / notify
- consumer — what they need to know

## Rollout
big-bang | compatible sequence (and which step this is)

Give file:line references, not pasted code. If the search finds no dependents, list the patterns you searched so the result can be trusted.