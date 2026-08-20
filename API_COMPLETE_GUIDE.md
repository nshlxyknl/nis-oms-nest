# 🎉 Complete NIS-OMS API Documentation

## Overview

This is a complete Office Management System API built with NestJS, Prisma, and PostgreSQL. All three major modules are now fully implemented and tested!

---

## 🚀 Quick Start

### 1. Environment Setup
Make sure your `.env` file is configured:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
PORT=3003
```

### 2. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 3. Start the Server
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server will run on: `http://localhost:3003`

---

## 🔐 Authentication

All modules require JWT authentication. First, obtain a token:

### Login
```bash
POST http://localhost:3003/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "username": "john_doe",
    "role": "user"
  }
}
```

Use this token in all subsequent requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Implemented Modules

### ✅ Module 1: Leaves Management
**Base URL:** `/leaves`

**Features:**
- Request time off (sick, casual, annual, unpaid, emergency)
- Approve/reject leave requests (admin)
- View leave history
- Personal leave statistics
- Automatic date validation

**[View Full Documentation](./LEAVES_API.md)**

**Quick Example:**
```bash
# Request leave
curl -X POST http://localhost:3003/leaves \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveType": "sick",
    "startDate": "2026-07-20",
    "endDate": "2026-07-22",
    "days": 3,
    "reason": "Medical appointment"
  }'
```

---

### ✅ Module 2: Room Bookings
**Base URL:** `/room-bookings`

**Features:**
- Book meeting rooms
- **Smart conflict detection** (prevents double bookings)
- Find available rooms for time slots
- View room schedules
- Approve/reject bookings (admin)
- Mark bookings as completed
- Cannot book in the past or maintenance rooms

**[View Full Documentation](./ROOM_BOOKINGS_API.md)**

**Quick Example:**
```bash
# Check available rooms
curl -X GET "http://localhost:3003/room-bookings/available-rooms?startTime=2026-07-20T09:00:00Z&endTime=2026-07-20T11:00:00Z" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Book a room
curl -X POST http://localhost:3003/room-bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": 1,
    "startTime": "2026-07-20T09:00:00Z",
    "endTime": "2026-07-20T11:00:00Z",
    "purpose": "Team meeting"
  }'
```

---

### ✅ Module 3: Asset Requests
**Base URL:** `/asset-requests`

**Features:**
- Request company assets (laptops, monitors, phones, etc.)
- **Automatic assignment** upon approval
- Return assets when done
- View available assets
- Track asset history
- Duplicate request prevention
- **Transaction safety** for atomic operations

**[View Full Documentation](./ASSET_REQUESTS_API.md)**

**Quick Example:**
```bash
# View available assets
curl -X GET http://localhost:3003/asset-requests/available-assets \
  -H "Authorization: Bearer YOUR_TOKEN"

# Request an asset
curl -X POST http://localhost:3003/asset-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": 1,
    "reason": "Need laptop for new project"
  }'

# Return an asset
curl -X PATCH http://localhost:3003/asset-requests/1/return \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 👥 User Roles

### Regular User (`user`)
- ✅ Create own requests (leaves, room bookings, asset requests)
- ✅ View own records
- ✅ Update own pending requests
- ✅ Delete own pending requests
- ✅ Return own assets
- ✅ View statistics
- ❌ Cannot approve/reject requests
- ❌ Cannot view other users' data

### Admin (`admin`)
- ✅ All user permissions
- ✅ View all records across system
- ✅ Approve/reject any request
- ✅ Delete any pending request
- ✅ Access admin-only endpoints
- ✅ View pending queues

---

## 🔄 Common Workflows

### Workflow 1: Request and Get Leave Approved
```bash
# 1. User: Create leave request
POST /leaves
{
  "leaveType": "annual",
  "startDate": "2026-08-01",
  "endDate": "2026-08-05",
  "days": 5,
  "reason": "Family vacation"
}

# 2. Admin: View pending leaves
GET /leaves/pending

# 3. Admin: Approve leave
PATCH /leaves/1/approve
{
  "status": "approved"
}

# 4. User: Check leave status
GET /leaves/1
```

---

### Workflow 2: Book a Meeting Room
```bash
# 1. User: Check available rooms
GET /room-bookings/available-rooms?startTime=2026-07-20T14:00:00Z&endTime=2026-07-20T16:00:00Z

# 2. User: Book a room
POST /room-bookings
{
  "roomId": 1,
  "startTime": "2026-07-20T14:00:00Z",
  "endTime": "2026-07-20T16:00:00Z",
  "purpose": "Project kickoff"
}

# 3. Admin: Approve booking
PATCH /room-bookings/1/approve
{
  "status": "approved"
}

# 4. User: After meeting, mark as completed
PATCH /room-bookings/1/complete
```

---

### Workflow 3: Request and Return Asset
```bash
# 1. User: View available assets
GET /asset-requests/available-assets

# 2. User: Request asset
POST /asset-requests
{
  "assetId": 1,
  "reason": "Development work"
}

# 3. Admin: Approve request (auto-assigns asset)
PATCH /asset-requests/1/approve
{
  "status": "approved"
}

# 4. User: View my current assets
GET /asset-requests/my-assets

# 5. User: Return asset when done
PATCH /asset-requests/1/return
```

---

## 📊 Common Status Values

### Leave Status
- `pending` - Awaiting approval
- `approved` - Approved by admin
- `rejected` - Rejected by admin

### Room Booking Status
- `pending` - Awaiting approval
- `approved` - Approved and confirmed
- `rejected` - Rejected by admin
- `completed` - Meeting finished

### Asset Request Status
- `pending` - Awaiting approval
- `approved` - Approved and asset assigned
- `rejected` - Rejected by admin
- `returned` - Asset returned to pool

---

## 🛡️ Security Features

- ✅ JWT authentication on all endpoints
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ User can only access own data (unless admin)
- ✅ Protected routes with guards
- ✅ Input validation with class-validator
- ✅ SQL injection protection via Prisma
- ✅ CORS enabled for frontend integration

---

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── guards/             # JWT & local guards
│   ├── strategies/         # Passport strategies
│   └── dto/                # Login/register DTOs
├── users/                   # User management
├── leaves/                  # Leave requests module ✅
│   ├── dto/
│   ├── leaves.service.ts
│   └── leaves.controller.ts
├── room-bookings/          # Room booking module ✅
│   ├── dto/
│   ├── room-bookings.service.ts
│   └── room-bookings.controller.ts
├── asset-requests/         # Asset requests module ✅
│   ├── dto/
│   ├── asset-requests.service.ts
│   └── asset-requests.controller.ts
├── rooms/                   # Room management
├── assets/                  # Asset management
├── employees/              # Employee records
├── notices/                # Notice board
└── prisma/                 # Database service

prisma/
└── schema.prisma           # Complete database schema
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3003/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-17T10:00:00.000Z",
  "database": "connected",
  "modules": [
    "Auth",
    "Users",
    "Employees",
    "Assets",
    "Rooms",
    "Notices",
    "Leaves ✅",
    "RoomBookings ✅",
    "AssetRequests ✅"
  ]
}
```

---

## 📈 Statistics Endpoints

Each module provides statistics:

### Leaves Statistics
```bash
GET /leaves/my-stats
```
Returns: total, approved, pending, rejected, total days, breakdown by type

### Room Bookings Statistics
```bash
GET /room-bookings/my-stats
```
Returns: total, approved, pending, rejected, completed, upcoming

### Asset Requests Statistics
```bash
GET /asset-requests/my-stats
```
Returns: total, approved, pending, rejected, returned, currently assigned

---

## 🔧 Database Schema

### Key Models

**User** - System users with roles
**Leave** - Time off requests
**Room** - Meeting rooms
**RoomBooking** - Room reservations
**Asset** - Company assets
**AssetRequest** - Asset requests and assignments
**Employee** - Employee records
**Notice** - Company notices

[View complete schema in `prisma/schema.prisma`]

---

## 🚨 Error Handling

All endpoints return standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Start date must be before end date"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only view your own requests"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Room is already booked during this time"
}
```

---

## 📚 Additional Resources

- **Leaves API:** [LEAVES_API.md](./LEAVES_API.md)
- **Room Bookings API:** [ROOM_BOOKINGS_API.md](./ROOM_BOOKINGS_API.md)
- **Asset Requests API:** [ASSET_REQUESTS_API.md](./ASSET_REQUESTS_API.md)

---

## 🎯 Features Summary

### What's Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Secure password hashing

✅ **Leaves Management**
- Multiple leave types
- Approval workflow
- Statistics tracking

✅ **Room Bookings**
- Conflict detection
- Available room search
- Room schedules
- Booking lifecycle

✅ **Asset Management**
- Asset requests
- Auto-assignment
- Return workflow
- Asset tracking

✅ **Data Validation**
- Input validation on all endpoints
- Business logic validation
- Date/time validation

✅ **Database**
- PostgreSQL with Prisma ORM
- Transaction safety
- Relational integrity

---

## 🤝 Contributing

All three major modules are complete! To extend the system:

1. Add new modules following the existing pattern
2. Use JWT authentication guard on all routes
3. Implement role-based access where needed
4. Follow the service/controller/DTO structure
5. Add validation with class-validator
6. Document new endpoints

---

## 📞 Support

For questions or issues:
1. Check the individual module documentation
2. Review the Prisma schema
3. Test endpoints with the provided cURL examples

---

## 🎉 Congratulations!

All three modules are fully implemented, tested, and documented:
- ✅ Leaves Module
- ✅ Room Bookings Module  
- ✅ Asset Requests Module

Your Office Management System is ready for use! 🚀
