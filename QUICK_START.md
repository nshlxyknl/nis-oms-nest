# Quick Start Guide - Backend Setup

## 🚀 Start the Backend

```bash
npm run start:dev
```

Backend will be available at: **http://localhost:3003**

## 📋 Prerequisites

✅ Node.js installed  
✅ npm installed  
✅ Database connection configured in `.env`  
✅ Dependencies installed (`npm install`)  
✅ Prisma client generated (`npx prisma generate`)  
✅ Database schema synced (`npx prisma db push`)  

## 🔧 Configuration

### Environment Variables (.env)
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration (.env.local in Next.js)
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

## 🧪 Test the Backend

### Method 1: PowerShell Script
```powershell
.\test-api.ps1
```

### Method 2: Manual Testing with cURL/PowerShell

#### Register a User
```powershell
$body = @{
    username = "testuser"
    password = "test123456"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/auth/register" -Method Post -Body $body -ContentType "application/json"
```

#### Login
```powershell
$body = @{
    username = "testuser"
    password = "test123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3003/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.access_token
```

#### Get Profile
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3003/auth/me" -Headers $headers
```

## 📚 Available Endpoints

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Authentication (Protected)
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout

### Employees (Admin Only)
- `GET /employees` - List all users
- `POST /employees` - Create new user
- `GET /employees/:id` - Get user details
- `PATCH /employees/:id` - Update user
- `PATCH /employees/:id/role` - Update user role
- `PATCH /employees/:id/status` - Update user status
- `DELETE /employees/:id` - Delete user

### Leaves
- `GET /leaves` - Get leaves (filtered by role)
- `POST /leaves` - Create leave request
- `PATCH /leaves/:id/approve` - Approve leave (admin)
- `PATCH /leaves/:id/reject` - Reject leave (admin)

### Room Bookings
- `GET /room-bookings` - Get bookings (filtered by role)
- `POST /room-bookings` - Create booking
- `PATCH /room-bookings/:id/approve` - Approve booking (admin)
- `PATCH /room-bookings/:id/reject` - Reject booking (admin)

### Asset Requests
- `GET /asset-requests` - Get requests (filtered by role)
- `POST /asset-requests` - Create request
- `PATCH /asset-requests/:id/approve` - Approve request (admin)
- `PATCH /asset-requests/:id/reject` - Reject request (admin)

### Rooms (Admin)
- `GET /rooms` - List all rooms
- `POST /rooms` - Create room
- `PATCH /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

### Assets (Admin)
- `GET /assets` - List all assets
- `POST /assets` - Create asset
- `PATCH /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

### Notices
- `GET /notices` - List active notices
- `POST /notices` - Create notice (admin)
- `DELETE /notices/:id` - Delete notice (admin)

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👤 User Roles

- **user** - Regular employee with limited access
- **admin** - Administrator with full access

## 🛠️ Common Commands

### Development
```bash
npm run start:dev    # Start with hot-reload
npm run start        # Start normally
npm run start:debug  # Start with debugging
```

### Build & Production
```bash
npm run build        # Build the project
npm run start:prod   # Run production build
```

### Database
```bash
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio GUI
```

### Testing
```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
```

## 🐛 Troubleshooting

### Backend not starting?
1. Check if port 3003 is already in use
2. Verify DATABASE_URL in .env
3. Run `npm install` to ensure dependencies are installed
4. Check logs for specific errors

### Database connection issues?
1. Verify DATABASE_URL format
2. Ensure database is running
3. Check network/firewall settings
4. Run `npx prisma db push` to sync schema

### CORS errors?
1. Check FRONTEND_URL in .env matches your frontend
2. Verify frontend is running on correct port
3. Check browser console for specific CORS errors

### 401 Unauthorized?
1. Verify token is being sent in header
2. Check token hasn't expired
3. Ensure user exists in database
4. Try logging in again to get fresh token

### Endpoints not found (404)?
1. Check endpoint URL spelling
2. Verify controller is properly imported in app.module.ts
3. Check that the server has restarted after code changes

## 📖 Additional Documentation

- [FRONTEND_INTEGRATION_COMPLETE.md](./FRONTEND_INTEGRATION_COMPLETE.md) - Complete integration guide
- [NESTJS_BACKEND_INTEGRATION_GUIDE.md](./NESTJS_BACKEND_INTEGRATION_GUIDE.md) - Original integration specs
- [API_COMPLETE_GUIDE.md](./API_COMPLETE_GUIDE.md) - Detailed API documentation

## 🎯 Next Steps

1. ✅ Backend is configured and ready
2. 🔄 Start the backend: `npm run start:dev`
3. 🧪 Test the endpoints: `.\test-api.ps1`
4. 🌐 Configure your frontend with `NEXT_PUBLIC_API_URL=http://localhost:3003`
5. 🚀 Start your frontend and test the connection
6. 👥 Create an admin user if needed
7. 📊 Add sample data for testing

## 💡 Pro Tips

- Use Prisma Studio (`npx prisma studio`) to view and edit database records visually
- Check the terminal logs while making requests to see detailed debug information
- Use the browser's Network tab in DevTools to inspect API requests/responses
- Keep the backend terminal open to see real-time logs

---

**Your backend is ready to connect with your Next.js frontend!** 🎉
