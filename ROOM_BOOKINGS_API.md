# Room Bookings Module API Documentation

## ✅ Module 2: ROOM BOOKINGS - COMPLETED

### Overview
The Room Bookings module allows users to book meeting rooms with conflict detection and approval workflow. All endpoints require JWT authentication.

### Base URL
```
http://localhost:3003/room-bookings
```

---

## Features

✅ **Smart Conflict Detection** - Prevents double bookings
✅ **Approval Workflow** - Admin approval required
✅ **Available Room Search** - Find free rooms for specific time slots
✅ **Room Schedule View** - See all bookings for a specific room
✅ **Auto-validation** - Cannot book in the past or maintenance rooms
✅ **Booking Statistics** - Track your booking history
✅ **Complete Bookings** - Mark bookings as completed after use

---

## Endpoints

### 1. Create Room Booking
**POST** `/room-bookings`

Book a meeting room (any authenticated user).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "roomId": 1,
  "startTime": "2026-07-20T09:00:00Z",
  "endTime": "2026-07-20T11:00:00Z",
  "purpose": "Team meeting"
}
```

**Response (201):**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "startTime": "2026-07-20T09:00:00.000Z",
  "endTime": "2026-07-20T11:00:00.000Z",
  "purpose": "Team meeting",
  "status": "pending",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2026-07-17T10:00:00.000Z",
  "updatedAt": "2026-07-17T10:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "location": "2nd Floor",
    "equipment": "Projector, Whiteboard",
    "status": "available"
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "department": "Engineering"
  }
}
```

**Validations:**
- ✅ Room must exist
- ✅ Start time must be before end time
- ✅ Cannot book in the past
- ✅ Room must not be under maintenance
- ✅ No conflicting bookings

**Error (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "Room is already booked during this time. Conflicting booking: 5"
}
```

---

### 2. Get All Room Bookings
**GET** `/room-bookings`

Get all room bookings.
- Regular users: see only their own bookings
- Admins: see all bookings

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "startTime": "2026-07-20T09:00:00.000Z",
    "endTime": "2026-07-20T11:00:00.000Z",
    "purpose": "Team meeting",
    "status": "approved",
    "approvedBy": 2,
    "approvedAt": "2026-07-17T12:00:00.000Z",
    "room": {
      "id": 1,
      "name": "Conference Room A",
      "capacity": 10,
      "location": "2nd Floor"
    },
    "user": {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "department": "Engineering"
    },
    "approver": {
      "id": 2,
      "username": "admin",
      "name": "Admin User"
    }
  }
]
```

---

### 3. Get Pending Bookings
**GET** `/room-bookings/pending`

Get all pending room bookings (admin only).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "startTime": "2026-07-20T09:00:00.000Z",
    "endTime": "2026-07-20T11:00:00.000Z",
    "status": "pending",
    "room": {
      "id": 1,
      "name": "Conference Room A"
    },
    "user": {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "department": "Engineering"
    }
  }
]
```

---

### 4. Get My Booking Statistics
**GET** `/room-bookings/my-stats`

Get booking statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "total": 10,
  "approved": 7,
  "pending": 1,
  "rejected": 1,
  "completed": 5,
  "upcoming": 2
}
```

---

### 5. Get Available Rooms
**GET** `/room-bookings/available-rooms?startTime=2026-07-20T09:00:00Z&endTime=2026-07-20T11:00:00Z`

Find available rooms for a specific time slot.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `startTime` (required): ISO 8601 datetime
- `endTime` (required): ISO 8601 datetime

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10,
    "location": "2nd Floor",
    "equipment": "Projector, Whiteboard",
    "status": "available"
  },
  {
    "id": 3,
    "name": "Meeting Room C",
    "capacity": 6,
    "location": "3rd Floor",
    "equipment": "TV Screen",
    "status": "available"
  }
]
```

---

### 6. Get Bookings by Room
**GET** `/room-bookings/room/:roomId`

Get all bookings for a specific room.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters (optional):**
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)

**Example:**
```
GET /room-bookings/room/1?startDate=2026-07-20&endDate=2026-07-25
```

**Response (200):**
```json
[
  {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "startTime": "2026-07-20T09:00:00.000Z",
    "endTime": "2026-07-20T11:00:00.000Z",
    "purpose": "Team meeting",
    "status": "approved",
    "user": {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "department": "Engineering"
    }
  }
]
```

---

### 7. Get Booking by ID
**GET** `/room-bookings/:id`

Get details of a specific room booking.
- Regular users: can only view their own bookings
- Admins: can view any booking

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "startTime": "2026-07-20T09:00:00.000Z",
  "endTime": "2026-07-20T11:00:00.000Z",
  "purpose": "Team meeting",
  "status": "approved",
  "room": {
    "id": 1,
    "name": "Conference Room A",
    "capacity": 10
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "department": "Engineering"
  },
  "approver": {
    "id": 2,
    "username": "admin",
    "name": "Admin User"
  }
}
```

---

### 8. Update Room Booking
**PATCH** `/room-bookings/:id`

Update a pending room booking (only the owner can update).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "startTime": "2026-07-20T10:00:00Z",
  "endTime": "2026-07-20T12:00:00Z",
  "purpose": "Updated meeting purpose"
}
```

**Response (200):**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "startTime": "2026-07-20T10:00:00.000Z",
  "endTime": "2026-07-20T12:00:00.000Z",
  "purpose": "Updated meeting purpose",
  "status": "pending",
  "updatedAt": "2026-07-17T11:00:00.000Z"
}
```

**Note:** Can only update pending bookings. Conflict detection runs on updates.

---

### 9. Approve/Reject Room Booking
**PATCH** `/room-bookings/:id/approve`

Approve or reject a room booking (admin only).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "status": "approved"
}
```

**Status Values:** `approved`, `rejected`

**Response (200):**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "startTime": "2026-07-20T09:00:00.000Z",
  "endTime": "2026-07-20T11:00:00.000Z",
  "purpose": "Team meeting",
  "status": "approved",
  "approvedBy": 2,
  "approvedAt": "2026-07-17T12:00:00.000Z",
  "room": {
    "id": 1,
    "name": "Conference Room A"
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "department": "Engineering"
  },
  "approver": {
    "id": 2,
    "username": "admin",
    "name": "Admin User"
  }
}
```

**Note:** Conflict detection runs again when approving to ensure no double bookings.

---

### 10. Mark Booking as Completed
**PATCH** `/room-bookings/:id/complete`

Mark an approved booking as completed after the meeting.
- Regular users: can mark their own bookings as completed
- Admins: can mark any booking as completed

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "status": "completed",
  "room": {
    "id": 1,
    "name": "Conference Room A"
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe"
  }
}
```

---

### 11. Delete Room Booking
**DELETE** `/room-bookings/:id`

Delete a room booking.
- Regular users: can only delete their own pending/rejected bookings
- Admins: can delete any pending/rejected booking

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "message": "Room booking deleted successfully"
}
```

**Note:** Cannot delete approved or completed bookings.

---

## Status Flow

```
pending → approved (by admin) → completed (by user/admin)
        ↓
        rejected (by admin)
```

---

## Conflict Detection Algorithm

The system prevents double bookings by checking for overlapping time slots:

1. **New booking starts during existing booking**
2. **New booking ends during existing booking**
3. **New booking completely contains existing booking**

Only `pending` and `approved` bookings are considered for conflicts.

---

## Testing with cURL

### 1. Login first (get JWT token)
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 2. Check available rooms
```bash
curl -X GET "http://localhost:3003/room-bookings/available-rooms?startTime=2026-07-20T09:00:00Z&endTime=2026-07-20T11:00:00Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Create room booking
```bash
curl -X POST http://localhost:3003/room-bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "roomId": 1,
    "startTime": "2026-07-20T09:00:00Z",
    "endTime": "2026-07-20T11:00:00Z",
    "purpose": "Team meeting"
  }'
```

### 4. Get my bookings
```bash
curl -X GET http://localhost:3003/room-bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Approve booking (admin only)
```bash
curl -X PATCH http://localhost:3003/room-bookings/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"status": "approved"}'
```

### 6. View room schedule
```bash
curl -X GET "http://localhost:3003/room-bookings/room/1?startDate=2026-07-20&endDate=2026-07-25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Mark as completed
```bash
curl -X PATCH http://localhost:3003/room-bookings/1/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Start time must be before end time"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only update your own room bookings"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Room with ID 1 not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Room is already booked during this time. Conflicting booking: 5"
}
```

---

## Features Summary

✅ Create room bookings with smart conflict detection
✅ View own bookings (users) or all bookings (admins)
✅ Update pending bookings with re-validation
✅ Approve/reject bookings (admin only)
✅ Mark bookings as completed
✅ Delete pending/rejected bookings
✅ View pending bookings queue (admin)
✅ Find available rooms for specific time slots
✅ View room schedule with optional date filtering
✅ Get personal booking statistics
✅ JWT authentication on all endpoints
✅ Role-based access control
✅ Cannot book in the past
✅ Cannot book maintenance rooms
✅ Automatic conflict detection on create/update/approve
✅ Proper status workflow enforcement

---

## Next Steps

Ready to implement **Module 3: Asset Requests** when you're ready!
