# Leaves Module API Documentation

## ✅ Module 1: LEAVES - COMPLETED

### Overview
The Leaves module allows users to request time off and admins to approve/reject leave requests. All endpoints require JWT authentication.

### Base URL
```
http://localhost:3003/leaves
```

---

## Endpoints

### 1. Create Leave Request
**POST** `/leaves`

Create a new leave request (any authenticated user).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "leaveType": "sick",
  "startDate": "2026-07-20",
  "endDate": "2026-07-22",
  "days": 3,
  "reason": "Medical appointment"
}
```

**Leave Types:** `sick`, `casual`, `annual`, `unpaid`, `emergency`

**Response (201):**
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
  "createdAt": "2026-07-17T10:00:00.000Z",
  "updatedAt": "2026-07-17T10:00:00.000Z",
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "department": "Engineering"
  }
}
```

---

### 2. Get All Leaves
**GET** `/leaves`

Get all leave requests. 
- Regular users: see only their own leaves
- Admins: see all leaves

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
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
    "createdAt": "2026-07-17T10:00:00.000Z",
    "updatedAt": "2026-07-17T10:00:00.000Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "department": "Engineering"
    },
    "approver": null
  }
]
```

---

### 3. Get Pending Leaves
**GET** `/leaves/pending`

Get all pending leave requests (admin only).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "leaveType": "sick",
    "status": "pending",
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

### 4. Get My Leave Statistics
**GET** `/leaves/my-stats`

Get current year leave statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "total": 5,
  "approved": 3,
  "pending": 1,
  "rejected": 1,
  "totalDaysApproved": 12,
  "byType": {
    "sick": 2,
    "casual": 1,
    "annual": 2,
    "unpaid": 0,
    "emergency": 0
  }
}
```

---

### 5. Get Leave by ID
**GET** `/leaves/:id`

Get details of a specific leave request.
- Regular users: can only view their own leaves
- Admins: can view any leave

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
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
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "department": "Engineering"
  },
  "approver": null
}
```

---

### 6. Update Leave Request
**PATCH** `/leaves/:id`

Update a pending leave request (only the owner can update their own leaves).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "days": 2,
  "endDate": "2026-07-21",
  "reason": "Updated reason"
}
```

**Response (200):**
```json
{
  "id": 1,
  "userId": 1,
  "leaveType": "sick",
  "startDate": "2026-07-20T00:00:00.000Z",
  "endDate": "2026-07-21T00:00:00.000Z",
  "days": 2,
  "reason": "Updated reason",
  "status": "pending",
  "updatedAt": "2026-07-17T11:00:00.000Z"
}
```

**Note:** Can only update pending leaves.

---

### 7. Approve/Reject Leave
**PATCH** `/leaves/:id/approve`

Approve or reject a leave request (admin only).

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
  "userId": 1,
  "leaveType": "sick",
  "startDate": "2026-07-20T00:00:00.000Z",
  "endDate": "2026-07-22T00:00:00.000Z",
  "days": 3,
  "status": "approved",
  "approvedBy": 2,
  "approvedAt": "2026-07-17T12:00:00.000Z",
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

### 8. Delete Leave Request
**DELETE** `/leaves/:id`

Delete a pending leave request.
- Regular users: can only delete their own pending leaves
- Admins: can delete any pending leave

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "message": "Leave request deleted successfully"
}
```

**Note:** Can only delete pending leaves.

---

## Status Flow

```
pending → approved (by admin)
        → rejected (by admin)
```

## Error Responses

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
  "message": "You can only view your own leave requests"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Leave with ID 1 not found"
}
```

---

## Testing with cURL

### 1. Login first (get JWT token)
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 2. Create leave request
```bash
curl -X POST http://localhost:3003/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "leaveType": "sick",
    "startDate": "2026-07-20",
    "endDate": "2026-07-22",
    "days": 3,
    "reason": "Medical appointment"
  }'
```

### 3. Get my leaves
```bash
curl -X GET http://localhost:3003/leaves \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Approve leave (admin only)
```bash
curl -X PATCH http://localhost:3003/leaves/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"status": "approved"}'
```

---

## Features Summary

✅ Create leave requests with validation
✅ View own leaves (users) or all leaves (admins)
✅ Update pending leave requests
✅ Approve/reject leaves (admin only)
✅ Delete pending leaves
✅ View pending leaves queue (admin)
✅ Get personal leave statistics
✅ JWT authentication on all endpoints
✅ Role-based access control
✅ Proper date validation
✅ Status workflow enforcement

---

## Next Steps

Ready to implement **Module 2: Room Bookings** when you're ready!
