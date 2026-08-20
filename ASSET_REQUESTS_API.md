# Asset Requests Module API Documentation

## ✅ Module 3: ASSET REQUESTS - COMPLETED

### Overview
The Asset Requests module allows users to request company assets (laptops, monitors, phones, etc.) with approval workflow and automatic assignment tracking. All endpoints require JWT authentication.

### Base URL
```
http://localhost:3003/asset-requests
```

---

## Features

✅ **Request Assets** - Users can request available assets
✅ **Auto-Assignment** - Assets automatically assigned upon approval
✅ **Return Workflow** - Users can return assets when done
✅ **Availability Check** - View all available assets before requesting
✅ **Request History** - Track all your asset requests
✅ **Asset Tracking** - See all requests for specific assets
✅ **Duplicate Prevention** - Can't request same asset twice
✅ **Transaction Safety** - Atomic operations for assignment/return

---

## Endpoints

### 1. Create Asset Request
**POST** `/asset-requests`

Request a company asset (any authenticated user).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "assetId": 1,
  "reason": "Need laptop for new project"
}
```

**Response (201):**
```json
{
  "id": 1,
  "assetId": 1,
  "userId": 1,
  "reason": "Need laptop for new project",
  "status": "pending",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2026-07-17T10:00:00.000Z",
  "updatedAt": "2026-07-17T10:00:00.000Z",
  "asset": {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "type": "Laptop",
    "description": "M3 Max, 32GB RAM",
    "category": "Computer",
    "value": 3500.00,
    "location": "IT Storage",
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
- ✅ Asset must exist
- ✅ Asset must be available (not assigned/maintenance/disposed)
- ✅ User cannot have duplicate pending requests for same asset

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "You already have a pending request for this asset"
}
```

---

### 2. Get All Asset Requests
**GET** `/asset-requests`

Get all asset requests.
- Regular users: see only their own requests
- Admins: see all requests

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "assetId": 1,
    "userId": 1,
    "reason": "Need laptop for new project",
    "status": "approved",
    "approvedBy": 2,
    "approvedAt": "2026-07-17T12:00:00.000Z",
    "asset": {
      "id": 1,
      "name": "MacBook Pro 16\"",
      "type": "Laptop",
      "status": "assigned",
      "assignedToId": 1
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

### 3. Get Pending Requests
**GET** `/asset-requests/pending`

Get all pending asset requests (admin only).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 2,
    "assetId": 3,
    "userId": 5,
    "reason": "Need monitor for desk setup",
    "status": "pending",
    "asset": {
      "id": 3,
      "name": "Dell UltraSharp 27\"",
      "type": "Monitor",
      "status": "available"
    },
    "user": {
      "id": 5,
      "username": "jane_smith",
      "name": "Jane Smith",
      "department": "Design"
    }
  }
]
```

---

### 4. Get My Assets
**GET** `/asset-requests/my-assets`

Get all currently assigned assets for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "assetId": 1,
    "userId": 1,
    "reason": "Need laptop for new project",
    "status": "approved",
    "approvedBy": 2,
    "approvedAt": "2026-07-17T12:00:00.000Z",
    "asset": {
      "id": 1,
      "name": "MacBook Pro 16\"",
      "type": "Laptop",
      "description": "M3 Max, 32GB RAM",
      "category": "Computer",
      "value": 3500.00,
      "location": "Assigned to John Doe",
      "status": "assigned",
      "assignedToId": 1
    }
  }
]
```

---

### 5. Get My Request Statistics
**GET** `/asset-requests/my-stats`

Get asset request statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "total": 8,
  "approved": 5,
  "pending": 1,
  "rejected": 1,
  "returned": 1,
  "currentlyAssigned": 2
}
```

---

### 6. Get Available Assets
**GET** `/asset-requests/available-assets`

Get all available assets that can be requested.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "type": "Laptop",
    "description": "M3 Max, 32GB RAM",
    "category": "Computer",
    "value": 3500.00,
    "location": "IT Storage",
    "status": "available",
    "assignedToId": null
  },
  {
    "id": 3,
    "name": "Dell UltraSharp 27\"",
    "type": "Monitor",
    "description": "4K Display",
    "category": "Display",
    "value": 600.00,
    "location": "IT Storage",
    "status": "available",
    "assignedToId": null
  }
]
```

---

### 7. Get Requests by Asset
**GET** `/asset-requests/asset/:assetId`

Get all requests for a specific asset (request history).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "assetId": 1,
    "userId": 1,
    "reason": "Need laptop for new project",
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
  },
  {
    "id": 5,
    "assetId": 1,
    "userId": 3,
    "reason": "Previous laptop broken",
    "status": "returned",
    "approvedBy": 2,
    "approvedAt": "2026-06-15T10:00:00.000Z"
  }
]
```

---

### 8. Get Request by ID
**GET** `/asset-requests/:id`

Get details of a specific asset request.
- Regular users: can only view their own requests
- Admins: can view any request

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "id": 1,
  "assetId": 1,
  "userId": 1,
  "reason": "Need laptop for new project",
  "status": "approved",
  "approvedBy": 2,
  "approvedAt": "2026-07-17T12:00:00.000Z",
  "asset": {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "type": "Laptop",
    "status": "assigned",
    "assignedTo": {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "department": "Engineering"
    }
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

### 9. Update Asset Request
**PATCH** `/asset-requests/:id`

Update a pending asset request (only the owner can update).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "reason": "Updated reason - urgent need for project",
  "assetId": 2
}
```

**Response (200):**
```json
{
  "id": 1,
  "assetId": 2,
  "userId": 1,
  "reason": "Updated reason - urgent need for project",
  "status": "pending",
  "updatedAt": "2026-07-17T11:00:00.000Z"
}
```

**Note:** Can only update pending requests. If changing asset, new asset must be available.

---

### 10. Approve/Reject Asset Request
**PATCH** `/asset-requests/:id/approve`

Approve or reject an asset request (admin only).

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
  "assetId": 1,
  "userId": 1,
  "reason": "Need laptop for new project",
  "status": "approved",
  "approvedBy": 2,
  "approvedAt": "2026-07-17T12:00:00.000Z",
  "asset": {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "type": "Laptop",
    "status": "assigned",
    "assignedToId": 1,
    "assignedTo": {
      "id": 1,
      "username": "john_doe",
      "name": "John Doe",
      "department": "Engineering"
    }
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

**Important:** 
- When approved, asset is **automatically assigned** to the user
- Asset status changes from `available` to `assigned`
- Transaction ensures atomic operation

---

### 11. Return Asset
**PATCH** `/asset-requests/:id/return`

Return an assigned asset.
- Regular users: can return their own assets
- Admins: can return any asset

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "id": 1,
  "assetId": 1,
  "userId": 1,
  "status": "returned",
  "asset": {
    "id": 1,
    "name": "MacBook Pro 16\"",
    "status": "available",
    "assignedToId": null
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "department": "Engineering"
  }
}
```

**Important:**
- Asset status changes from `assigned` back to `available`
- Request status changes to `returned`
- Transaction ensures atomic operation
- Asset becomes available for new requests

---

### 12. Delete Asset Request
**DELETE** `/asset-requests/:id`

Delete an asset request.
- Regular users: can only delete their own pending/rejected requests
- Admins: can delete any pending/rejected request

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "message": "Asset request deleted successfully"
}
```

**Note:** Cannot delete approved or returned requests (maintain audit trail).

---

## Status Flow

```
pending → approved (by admin) → returned (by user/admin)
        ↓
        rejected (by admin)
```

### Asset Status Changes

When request is **approved**:
```
Asset: available → assigned
Asset.assignedToId: null → userId
```

When asset is **returned**:
```
Asset: assigned → available
Asset.assignedToId: userId → null
Request: approved → returned
```

---

## Transaction Safety

The module uses **database transactions** for critical operations:

1. **Approve Request:**
   - Update asset status to `assigned`
   - Set asset `assignedToId` to user
   - Update request status to `approved`
   - All in one atomic transaction

2. **Return Asset:**
   - Update asset status to `available`
   - Clear asset `assignedToId`
   - Update request status to `returned`
   - All in one atomic transaction

This ensures data consistency and prevents partial updates.

---

## Testing with cURL

### 1. Login first (get JWT token)
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 2. View available assets
```bash
curl -X GET http://localhost:3003/asset-requests/available-assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Request an asset
```bash
curl -X POST http://localhost:3003/asset-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "assetId": 1,
    "reason": "Need laptop for new project"
  }'
```

### 4. View my requests
```bash
curl -X GET http://localhost:3003/asset-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Approve request (admin only)
```bash
curl -X PATCH http://localhost:3003/asset-requests/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"status": "approved"}'
```

### 6. View my currently assigned assets
```bash
curl -X GET http://localhost:3003/asset-requests/my-assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Return an asset
```bash
curl -X PATCH http://localhost:3003/asset-requests/1/return \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. View asset history
```bash
curl -X GET http://localhost:3003/asset-requests/asset/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Asset is not available. Current status: assigned"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only view your own asset requests"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Asset with ID 1 not found"
}
```

---

## Features Summary

✅ Create asset requests with validation
✅ View own requests (users) or all requests (admins)
✅ Update pending requests
✅ Approve/reject requests (admin only)
✅ **Automatic asset assignment** on approval
✅ Return assigned assets
✅ Delete pending/rejected requests
✅ View pending requests queue (admin)
✅ View all available assets
✅ View currently assigned assets
✅ View request history by asset
✅ Get personal request statistics
✅ JWT authentication on all endpoints
✅ Role-based access control
✅ **Duplicate request prevention**
✅ **Transaction safety** for assignments
✅ Proper status workflow enforcement
✅ Audit trail maintained

---

## All Modules Complete! 🎉

### Summary of All 3 Modules:

1. ✅ **Leaves Module** - Time off requests with approval
2. ✅ **Room Bookings Module** - Meeting room reservations with conflict detection
3. ✅ **Asset Requests Module** - Company asset management with auto-assignment

All modules are fully integrated with JWT authentication and role-based access control!
