---
name: express-route
description: Conventions for writing Express routes in course-api/. Use whenever adding a new route, endpoint, or resource to course-api, or editing an existing route file under course-api/routes/.
---

# Express routes in course-api/

Follow these conventions exactly when adding or changing a route in `course-api/`.

## File layout

- One file per resource under `routes/` (e.g. `users.js`, `health.js`). A new resource gets its own new file, not a new section in an existing one.
- Each route file creates an `express.Router()`, defines its handlers on it, and does `module.exports = router;`.
- Mount the new router in `server.js` under its base path (e.g. `app.use('/widgets', require('./routes/widgets'));`).

## Data access

- Routes never hold state directly or reach into another route's data. All reads and writes go through `db/store.js`.
- If the resource needs new storage behavior, add the corresponding helper(s) to `db/store.js` rather than manipulating data in the route.

## Validation and status codes

- Validate required input in the route handler itself.
- Return `400` when the input is bad or missing required fields (e.g. a required field absent from the body).
- Return `404` when a specific record (by id or other key) doesn't exist.
- Only return `200`/`201` once validation and lookup have succeeded.

## Error response shape

Every error response is JSON shaped as:

```json
{ "error": "message" }
```

Success responses return the resource (or resource list) directly as JSON, with no wrapper object.

## Example shape to follow

Model new routes on `routes/users.js`: a `GET /` list handler, a `GET /:id` handler that 404s on a missing record, a `POST /` handler that 400s on missing required fields and otherwise creates via `store.js` and returns `201`, and a `PUT /:id` handler that 400s when no updatable field is given and 404s on a missing record.
