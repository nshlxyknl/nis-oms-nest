# Complete Test Steps - Leave Module

## Critical: You MUST restart the server and get a NEW token!

The JWT strategy was fixed, so old tokens won't work correctly.

---

## Step 1: Stop and Restart Server

**Stop your current server:**
- Press `Ctrl+C` in the terminal where server is running

**Start fresh:**
```bash
npm run start:dev
```

Wait for: `Application is running on: http://localhost:3003`

---

## Step 2: Login to Get NEW JWT Token

```bash
curl -X POST http://localhost:3003/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"your_password\"}"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUz...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin",
    "role": "admin"
  }
}
```

**Copy the `access_token` value!**

---

## Step 3: Test Health Endpoint (Optional)

```bash
curl http://localhost:3003/health
```

Should return database connected status.

---

## Step 4: Create a Leave Request

**Replace `YOUR_NEW_TOKEN` with the token from Step 2:**

```bash
curl -X POST http://localhost:3003/leaves ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_NEW_TOKEN" ^
  -d "{\"leaveType\":\"sick\",\"startDate\":\"2026-07-20\",\"endDate\":\"2026-07-22\",\"days\":3,\"reason\":\"Medical appointment\"}"
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "leaveType": "sick",
  "startDate": "2026-07-20T00:00:00.000Z",
  "endDate": "2026-07-22T00:00:00.000Z",
  "days": 3,
  "reason": "Medical appointment",
  "status": "pending",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2026-07-17T...",
  "updatedAt": "2026-07-17T...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin",
    "department": null
  }
}
```

---

## Step 5: Get All Leaves

```bash
curl -X GET http://localhost:3003/leaves ^
  -H "Authorization: Bearer YOUR_NEW_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "leaveType": "sick",
    "startDate": "2026-07-20T00:00:00.000Z",
    "endDate": "2026-07-22T00:00:00.000Z",
    "days": 3,
    "reason": "Medical appointment",
    "status": "pending",
    "approvedBy": null,
    "approvedAt": null,
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Admin"
    },
    "approver": null
  }
]
```

Note: `approver: null` is NORMAL for pending leaves!

---

## Troubleshooting

### Error: 401 Unauthorized
**Cause:** Token is missing or invalid
**Fix:** Make sure you're using the NEW token from Step 2

### Error: 500 Internal Server Error
**Cause:** Server not restarted after JWT fix
**Fix:** Stop server completely (Ctrl+C) and restart with `npm run start:dev`

### Error: 400 Bad Request
**Cause:** Invalid data in request
**Fix:** Check that:
- `leaveType` is one of: sick, casual, annual, unpaid, emergency
- Dates are in format: YYYY-MM-DD
- `days` is a number

### Warning about SSL modes
This is just a warning about PostgreSQL SSL settings. It won't prevent the API from working.

### Database Timeout
If you get ETIMEDOUT errors, your database might be slow or unreachable. Check:
- Database is running
- DATABASE_URL is correct
- Network connection is stable

---

## Success Checklist

- [  ] Server restarted successfully
- [  ] Got NEW JWT token from /auth/login
- [  ] Created leave request (got 201 status)
- [  ] Retrieved leaves list (got 200 status)
- [  ] `approver: null` in response (this is normal!)

---

## Important Notes

1. **Old tokens won't work!** The JWT strategy was fixed, so you MUST get a new token.

2. **`approver: null` is expected!** Pending leaves don't have an approver yet.

3. **The NULL in logs is normal!** The query `WHERE "public"."User"."id" IN (NULL)` is Prisma's way of handling the case where `approvedBy` is NULL. It will just return `approver: null` in the response.

4. **Restart is mandatory!** The TypeScript code needs to be recompiled with the fixed JWT strategy.
