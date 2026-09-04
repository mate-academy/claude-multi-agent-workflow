# API reference

Base URL: `http://localhost:3000`

All request and response bodies are JSON. Errors come back as `{ "error": "message" }`.

## Health

### GET /health
Returns the service status.

Response `200`:
```json
{ "status": "ok", "uptime": 12.34 }
```

## Users

A user looks like:
```json
{ "id": 1, "name": "Ada Lovelace", "email": "ada@example.com" }
```

### GET /users
Returns an array of all users.

### GET /users/:id
Returns a single user, `400` if `:id` is not a positive integer, or `404` if no user has
that id.

### POST /users
Creates a user. Body requires non-empty string `name` and `email`; returns `201` with the
created user, or `400` if either field is missing or empty.

### PUT /users/:id
Updates an existing user. Body may include `name`, `email`, or both, each a non-empty string.
Returns the updated user, `400` if `:id` is not a positive integer, if neither field is given,
or if a given field is empty, or `404` if the user does not exist.
