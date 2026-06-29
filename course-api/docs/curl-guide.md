# curl Testing Guide

Start the server first:

```bash
npm run dev
```

All examples assume the server is running at `http://localhost:3000`.

---

## 1. Health check

```bash
curl http://localhost:3000/health
```

Expected: `200 { "status": "ok", "uptime": ... }`

---

## 2. Tokens

### Issue a token (POST /tokens)

```bash
curl -s -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{"email": "ada@example.com"}' | tee /tmp/token.json
```

Save the token for the requests below:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{"email": "ada@example.com"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

Expected: `201 { "token": "<hex string>" }`

### Missing email → 400

```bash
curl -s -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `400 { "error": "email is required" }`

### Unknown email → 401

```bash
curl -s -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{"email": "nobody@example.com"}'
```

Expected: `401 { "error": "Invalid credentials" }`

### Revoke a token (DELETE /tokens/:token)

```bash
curl -s -X DELETE http://localhost:3000/tokens/$TOKEN
```

Expected: `204` (empty body)

### Revoke unknown token → 404

```bash
curl -s -X DELETE http://localhost:3000/tokens/doesnotexist
```

Expected: `404 { "error": "Token not found" }`

---

## 3. Users (all routes require a Bearer token)

Get a fresh token before running these:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{"email": "ada@example.com"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

### No token → 401

```bash
curl -s http://localhost:3000/users
```

Expected: `401 { "error": "Unauthorized" }`

### Invalid token → 401

```bash
curl -s http://localhost:3000/users \
  -H "Authorization: Bearer bogus"
```

Expected: `401 { "error": "Unauthorized" }`

### List all users (GET /users)

```bash
curl -s http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 [ { "id": 1, ... }, { "id": 2, ... } ]`

### Get one user (GET /users/:id)

```bash
curl -s http://localhost:3000/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com" }`

### Get missing user → 404

```bash
curl -s http://localhost:3000/users/999 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "User not found" }`

### Create a user (POST /users)

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Grace Hopper", "email": "grace@example.com"}'
```

Expected: `201 { "id": 3, "name": "Grace Hopper", "email": "grace@example.com" }`

### Create with missing fields → 400

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "No Email"}'
```

Expected: `400 { "error": "name and email are required" }`

### Update a user (PUT /users/:id)

```bash
curl -s -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ada L."}'
```

Expected: `200 { "id": 1, "name": "Ada L.", "email": "ada@example.com" }`

### Update missing user → 404

```bash
curl -s -X PUT http://localhost:3000/users/999 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nobody"}'
```

Expected: `404 { "error": "User not found" }`

### Delete a user (DELETE /users/:id)

```bash
curl -s -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `204` (empty body)

### Confirm deletion → 404

```bash
curl -s http://localhost:3000/users/2 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "User not found" }`

### Delete missing user → 404

```bash
curl -s -X DELETE http://localhost:3000/users/999 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "User not found" }`

---

## 4. Bank Accounts (nested under users, all routes require a Bearer token)

Get a fresh token and save an account ID as you go:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/tokens \
  -H "Content-Type: application/json" \
  -d '{"email": "ada@example.com"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

### No token → 401

```bash
curl -s http://localhost:3000/users/1/bank-accounts
```

Expected: `401 { "error": "Unauthorized" }`

### Invalid token → 401

```bash
curl -s http://localhost:3000/users/1/bank-accounts \
  -H "Authorization: Bearer bogus"
```

Expected: `401 { "error": "Unauthorized" }`

### Unknown user → 404

```bash
curl -s http://localhost:3000/users/999/bank-accounts \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "User not found" }`

### List bank accounts — empty (GET /users/:userId/bank-accounts)

```bash
curl -s http://localhost:3000/users/1/bank-accounts \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 []`

### Create a bank account (POST /users/:userId/bank-accounts)

```bash
ACCOUNT_ID=$(curl -s -X POST http://localhost:3000/users/1/bank-accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "12345678", "bankName": "First Bank"}' | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "Account ID: $ACCOUNT_ID"
```

Expected: `201 { "id": 1, "userId": 1, "accountNumber": "12345678", "bankName": "First Bank" }`

### Missing accountNumber → 400

```bash
curl -s -X POST http://localhost:3000/users/1/bank-accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bankName": "First Bank"}'
```

Expected: `400 { "error": "accountNumber and bankName are required" }`

### Missing bankName → 400

```bash
curl -s -X POST http://localhost:3000/users/1/bank-accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "12345678"}'
```

Expected: `400 { "error": "accountNumber and bankName are required" }`

### Create for unknown user → 404

```bash
curl -s -X POST http://localhost:3000/users/999/bank-accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountNumber": "12345678", "bankName": "First Bank"}'
```

Expected: `404 { "error": "User not found" }`

### List bank accounts after creating one

```bash
curl -s http://localhost:3000/users/1/bank-accounts \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 [ { "id": 1, "userId": 1, ... } ]`

### Get one bank account (GET /users/:userId/bank-accounts/:id)

```bash
curl -s http://localhost:3000/users/1/bank-accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 { "id": 1, "userId": 1, "accountNumber": "12345678", "bankName": "First Bank" }`

### Get missing account → 404

```bash
curl -s http://localhost:3000/users/1/bank-accounts/999 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "Bank account not found" }`

### Cross-user isolation → 404

```bash
curl -s http://localhost:3000/users/2/bank-accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "Bank account not found" }` (account belongs to user 1, not user 2)

### Delete a bank account (DELETE /users/:userId/bank-accounts/:id)

```bash
curl -s -X DELETE http://localhost:3000/users/1/bank-accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `204` (empty body)

### Confirm deletion → 404

```bash
curl -s http://localhost:3000/users/1/bank-accounts/$ACCOUNT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "Bank account not found" }`

### Delete missing account → 404

```bash
curl -s -X DELETE http://localhost:3000/users/1/bank-accounts/999 \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `404 { "error": "Bank account not found" }`
