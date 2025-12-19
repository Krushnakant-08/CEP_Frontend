# Backend API Sample Responses

This file documents the expected JSON structure for various API endpoints.

## 1. Authentication

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@university.edu",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "name": "John Student",
    "email": "john@university.edu"
  },
  "expiresIn": 86400
}
```

### POST /api/auth/register
**Request:**
```json
{
  "name": "John Student",
  "email": "john@university.edu",
  "password": "securePassword123",
  "phone": "+91 9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "userId": "user_12345"
}
```

## 2. Dashboard Data

### GET /api/dashboard
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user": {
    "id": "user_12345",
    "name": "John Student",
    "email": "john@university.edu",
    "phone": "+91 9876543210"
  },
  "stats": {
    "pendingOrders": 2,
    "completedOrders": 15,
    "totalSpent": 245,
    "totalPages": 523
  },
  "pendingOrders": [
    {
      "id": "ORD_001",
      "fileName": "Assignment_3.pdf",
      "pages": 15,
      "copies": 2,
      "printType": "blackAndWhite",
      "paperSize": "A4",
      "orientation": "portrait",
      "status": "processing",
      "price": 60,
      "uploadedAt": "2024-12-18T16:30:00Z",
      "estimatedReadyTime": "2024-12-18T18:00:00Z"
    }
  ],
  "completedOrders": [
    {
      "id": "ORD_003",
      "fileName": "Lab_Report.pdf",
      "price": 55
    },
    {
      "id": "ORD_004",
      "fileName": "Presentation.pdf",
      "price": 180
    }
  ]
}
```

## 3. File Upload

### POST /api/orders/upload
**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request (FormData):**
```
file: [PDF file]
copies: 2
printType: "blackAndWhite" | "color"
bindingType: "none" | "stapler" | "spiral" | "hardbound"
paperSize: "A4" | "A3" | "Letter"
orientation: "portrait" | "landscape"
notes: "Optional instructions"
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD_005",
  "message": "File uploaded successfully",
  "order": {
    "id": "ORD_005",
    "fileName": "Assignment_3.pdf",
    "pages": 15,
    "copies": 2,
    "printType": "blackAndWhite",
    "status": "pending",
    "price": 60,
    "estimatedReadyTime": "2024-12-18T18:00:00Z"
  }
}
```

## 4. Order Management

### GET /api/orders
**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status`: "pending" | "processing" | "ready" | "completed" | "cancelled"
- `page`: 1
- `limit`: 10

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "ORD_001",
      "fileName": "Assignment_3.pdf",
      "pages": 15,
      "copies": 2,
      "status": "processing",
      "price": 60,
      "uploadedAt": "2024-12-18T16:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 25
  }
}
```

### GET /api/orders/:orderId
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "ORD_001",
    "fileName": "Assignment_3.pdf",
    "fileUrl": "/uploads/documents/assignment_3_xyz.pdf",
    "pages": 15,
    "copies": 2,
    "printType": "blackAndWhite",
    "bindingType": "stapler",
    "status": "ready",
    "price": 65,
    "uploadedAt": "2024-12-18T16:30:00Z",
    "readyAt": "2024-12-18T17:45:00Z",
    "notes": "Please bind with stapler"
  }
}
```

### DELETE /api/orders/:orderId
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "refundAmount": 60
}
```

### PUT /api/orders/:orderId/collect
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Order marked as collected",
  "receiptUrl": "/receipts/ORD_001.pdf"
}
```

## 5. Pricing

### GET /api/pricing
**Response:**
```json
{
  "success": true,
  "pricing": {
    "blackAndWhitePerPage": 2,
    "colorPerPage": 10,
    "bindingTypes": {
      "none": 0,
      "stapler": 5,
      "spiral": 20,
      "hardbound": 50
    },
    "currency": "INR"
  }
}
```

## 6. Notifications

### GET /api/notifications
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif_001",
      "type": "order_ready",
      "title": "Your order is ready!",
      "message": "Assignment_3.pdf is ready for collection",
      "orderId": "ORD_001",
      "read": false,
      "createdAt": "2024-12-18T17:45:00Z"
    },
    {
      "id": "notif_002",
      "type": "order_completed",
      "title": "Thank you!",
      "message": "Order #ORD_003 has been marked as collected",
      "orderId": "ORD_003",
      "read": true,
      "createdAt": "2024-12-17T15:45:00Z"
    }
  ],
  "unreadCount": 1
}
```

## 7. User Profile

### GET /api/user/profile
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_12345",
    "name": "John Student",
    "email": "john@university.edu",
    "phone": "+91 9876543210",
    "createdAt": "2024-01-15T10:30:00Z",
    "totalOrders": 17,
    "totalSpent": 245
  }
}
```

### PUT /api/user/profile
**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "John Updated Student",
  "phone": "+91 9876543211"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_12345",
    "name": "John Updated Student",
    "email": "john@university.edu",
    "phone": "+91 9876543211"
  }
}
```

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED`: Invalid or missing authentication token
- `INVALID_INPUT`: Request validation failed
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: File is not a PDF
- `ORDER_NOT_FOUND`: Order ID doesn't exist
- `PAYMENT_FAILED`: Payment processing failed
- `ORDER_CANNOT_BE_CANCELLED`: Order is already being processed
