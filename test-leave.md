# Test Leave Request

## 1. First, Login to get JWT token

```bash
curl -X POST http://localhost:3003/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"your_username\",\"password\":\"your_password\"}"
```

## 2. Create Leave Request (use the token from step 1)

```bash
curl -X POST http://localhost:3003/leaves ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
  -d "{\"leaveType\":\"sick\",\"startDate\":\"2026-07-20\",\"endDate\":\"2026-07-22\",\"days\":3,\"reason\":\"Medical appointment\"}"
```

## Common Issues and Solutions

### Issue 1: 500 Internal Server Error
**Possible causes:**
1. Prisma client not generated - Run: `npx prisma generate`
2. Database connection issue - Check your DATABASE_URL in .env
3. Invalid userId from JWT token
4. Missing required fields

### Issue 2: 401 Unauthorized
**Solution:** Make sure you're sending the JWT token in the Authorization header

### Issue 3: 400 Bad Request
**Possible causes:**
1. Invalid date format (use ISO format: YYYY-MM-DD)
2. Invalid leaveType (must be: sick, casual, annual, unpaid, or emergency)
3. Missing required fields

## Valid Leave Request Example

```json
{
  "leaveType": "sick",
  "startDate": "2026-07-20",
  "endDate": "2026-07-22",
  "days": 3,
  "reason": "Medical appointment"
}
```

### Valid Leave Types:
- sick
- casual
- annual
- unpaid
- emergency

## Check Server Logs

If you get 500 error, check your server console for detailed error messages.
