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
Returns a single user, or `404` if no user has that id.

### POST /users
Creates a user. Body requires `name` and `email`; returns `201` with the created user, or `400` if either field is missing.

### PUT /users/:id
Updates an existing user. Body may include `name`, `email`, or both. Returns the updated user, `400` if neither field is given, or `404` if the user does not exist.

## Orders

An order looks like:
```json
{ "id": 1, "userId": 1, "item": "Analytical Engine plans", "quantity": 1 }
```

### GET /orders
Returns an array of all orders.

### GET /orders/:id
Returns a single order, or `404` if no order has that id.

### POST /orders
Creates an order. Body requires `userId` and `item`; `quantity` defaults to `1` and must be a positive integer if given. Returns `201` with the created order, `400` if `userId` or `item` is missing, `userId` does not match an existing user, or `quantity` is not a positive integer.

### PUT /orders/:id
Updates an existing order. Body may include `userId`, `item`, `quantity`, or any combination. Returns the updated order, `404` if the order does not exist, or `400` if none of the fields are given, `userId` doesn't match an existing user, `item` is empty, or `quantity` is not a positive integer.
