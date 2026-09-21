# Frontend-Backend Integration Guide

This guide outlines all the changes made to connect your NestJS backend with your Next.js frontend.

## Changes Made

### 1. CORS Configuration (main.ts)
Updated CORS to allow proper frontend communication:
- Origin: `http://localhost:3000` (configurable via FRONTEND_URL env var)
- Enabled credentials
- Added all necessary HTTP methods
- Added proper headers including Authorization

### 2. Environment Variables (.env)
Added missing configuration:
```env
PORT=3003
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:3000
DATABASE_URL=<your-database-url>
```

### 3. Authentication Endpoints (auth module)
All required endpoints are implemented:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout (client-side token removal)

Response format matches frontend expectations:
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 4. Employee Management (employees module)
Updated to work with Users table instead of separate Employee table:
- `GET /employees` - List all users
- `POST /employees` - Create new user
- `GET /employees/:id` - Get single user
- `PATCH /employees/:id` - Update user
- `PATCH /employees/:id/role` - Update user role
- `PATCH /employees/:id/status` - Update user status
- `DELETE /employees/:id` - Delete user

Response format includes:
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "role": "user",
  "status": "active",
  "department": "IT",
  "joined": "2024-01-15"
}
```

### 5. Leave Management (leaves module)
All required endpoints with approval/rejection:
- `GET /leaves` - Get leaves (filtered by role)
- `POST /leaves` - Create leave request
- `GET /leaves/:id` - Get single leave
- `PATCH /leaves/:id` - Update leave
- `PATCH /leaves/:id/approve` - Approve leave (admin only)
- `PATCH /leaves/:id/reject` - Reject leave (admin only)
- `DELETE /leaves/:id` - Delete leave

### 6. Room Bookings (room-bookings module)
All required endpoints:
- `GET /room-bookings` - Get bookings (filtered by role)
- `POST /room-bookings` - Create booking
- `GET /room-bookings/:id` - Get single booking
- `PATCH /room-bookings/:id` - Update booking
- `PATCH /room-bookings/:id/approve` - Approve booking (admin only)
- `PATCH /room-bookings/:id/reject` - Reject booking (admin only)
- `DELETE /room-bookings/:id` - Delete booking

### 7. Asset Requests (asset-requests module)
All required endpoints:
- `GET /asset-requests` - Get requests (filtered by role)
- `POST /asset-requests` - Create request
- `GET /asset-requests/:id` - Get single request
- `PATCH /asset-requests/:id` - Update request
- `PATCH /asset-requests/:id/approve` - Approve request (admin only)
- `PATCH /asset-requests/:id/reject` - Reject request (admin only)
- `DELETE /asset-requests/:id` - Delete request

### 8. Assets Management (assets module)
- `GET /assets` - List all assets
- `POST /assets` - Create asset (admin only)
- `GET /assets/:id` - Get single asset
- `PATCH /assets/:id` - Update asset (admin only)
- `DELETE /assets/:id` - Delete asset (admin only)

### 9. Rooms Management (rooms module)
- `GET /rooms` - List all rooms
- `POST /rooms` - Create room (admin only)
- `GET /rooms/:id` - Get single room
- `PATCH /rooms/:id` - Update room (admin only)
- `DELETE /rooms/:id` - Delete room (admin only)

### 10. Notices (notices module)
- `GET /notices` - List all active notices
- `POST /notices` - Create notice (admin only)
- `GET /notices/:id` - Get single notice
- `PATCH /notices/:id` - Update notice (admin only)
- `DELETE /notices/:id` - Delete notice (admin only)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
Make sure your DATABASE_URL in .env is correct, then run:
```bash
npx prisma generate
npx prisma db push
```

### 3. Create Admin User (Optional)
You can create an admin user by registering with role "admin" or update an existing user in the database:
```sql
UPDATE "User" SET role = 'admin' WHERE username = 'your-username';
```

### 4. Start the Backend
```bash
npm run start:dev
```

The backend will run on `http://localhost:3003`

### 5. Configure Frontend
In your Next.js frontend, ensure the `.env.local` file has:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 6. Start the Frontend
```bash
cd <your-frontend-directory>
npm run dev
```

## Testing the Connection

### 1. Test Registration
```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","name":"Test User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### 3. Test Protected Endpoint
```bash
curl -X GET http://localhost:3003/auth/me \
  -H "Authorization: Bearer <your-token>"
```

## Key Features

### Authentication
- JWT-based authentication
- Role-based access control (admin/user)
- Password hashing with bcrypt
- Token expiration (7 days)

### Authorization
- Admin-only endpoints protected
- Users can only see their own data
- Admins can see all data

### Data Validation
- DTO validation using class-validator
- Type safety with TypeScript
- Proper error handling

### Database
- PostgreSQL with Prisma ORM
- Type-safe queries
- Relation handling
- Enum types for status fields

## Common Issues & Solutions

### Issue: CORS errors
**Solution**: Ensure FRONTEND_URL in .env matches your frontend URL

### Issue: 401 Unauthorized
**Solution**: Check that the JWT token is being sent in Authorization header as "Bearer <token>"

### Issue: Database connection errors
**Solution**: Verify DATABASE_URL in .env and ensure database is running

### Issue: Enum value mismatches
**Solution**: Frontend expects lowercase enum values (e.g., "admin", "user", "pending")

## API Response Format

All responses follow consistent patterns:

### Success Response
```json
{
  "id": 1,
  "field1": "value",
  "field2": "value"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### List Response
```json
[
  { "id": 1, "field": "value" },
  { "id": 2, "field": "value" }
]
```

## Frontend Integration Points

### 1. API Base URL
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:3003
```

### 2. Authentication Header
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. Role-Based Rendering
```typescript
const isAdmin = user?.role === 'admin';
```

## Next Steps

1. Test all endpoints with your frontend
2. Create seed data for testing
3. Set up proper error handling in frontend
4. Implement loading states
5. Add proper TypeScript types matching backend responses
6. Consider adding refresh token mechanism
7. Set up logging and monitoring
8. Add input validation on frontend
9. Implement file upload if needed
10. Add pagination for large datasets

## Contact & Support

For issues or questions:
1. Check the logs: `npm run start:dev` shows detailed logs
2. Use browser DevTools Network tab to inspect requests
3. Check Prisma Studio: `npx prisma studio` to view database
4. Review this documentation

---

**Backend is now ready to connect with your Next.js frontend!** 🚀
