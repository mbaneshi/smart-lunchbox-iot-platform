# Smart Lunchbox API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## User Endpoints

### Register User
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": {
      "temperatureUnit": "celsius",
      "notificationsEnabled": true,
      "theme": "auto",
      "language": "en"
    }
  },
  "token": "jwt_token"
}
```

### Login
```http
POST /api/users/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": { /* user object */ },
  "token": "jwt_token"
}
```

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": { /* preferences object */ },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "preferences": {
    "temperatureUnit": "fahrenheit",
    "notificationsEnabled": false
  }
}
```

**Response:** `200 OK`

### Delete Account
```http
DELETE /api/users/account
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Device Endpoints

### Register Device
```http
POST /api/devices
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Lunchbox",
  "firmwareVersion": "1.0.0",
  "wifiSSID": "HomeWiFi"
}
```

**Response:** `201 Created`
```json
{
  "message": "Device registered successfully",
  "device": {
    "id": "uuid",
    "name": "My Lunchbox",
    "firmwareVersion": "1.0.0",
    "status": "offline",
    "settings": { /* device settings */ },
    "registeredAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Devices
```http
GET /api/devices
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "devices": [
    {
      "id": "uuid",
      "name": "My Lunchbox",
      "firmwareVersion": "1.0.0",
      "status": "online",
      "lastOnline": "2024-01-01T00:00:00.000Z",
      "registeredAt": "2024-01-01T00:00:00.000Z",
      "wifiSSID": "HomeWiFi",
      "settings": { /* device settings */ }
    }
  ],
  "count": 1
}
```

### Get Device by ID
```http
GET /api/devices/:deviceId
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Update Device
```http
PUT /api/devices/:deviceId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Lunchbox",
  "settings": {
    "notificationsEnabled": false,
    "autoUpdate": true
  }
}
```

**Response:** `200 OK`

### Delete Device
```http
DELETE /api/devices/:deviceId
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Send Command to Device
```http
POST /api/devices/:deviceId/command
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "command": "heat_start",
  "targetTemp": 45,
  "maxDuration": 3600
}
```

**Available Commands:**
- `heat_start` - Start heating
- `heat_stop` - Stop heating
- `cool_start` - Start cooling
- `cool_stop` - Stop cooling
- `set_target_temp` - Set target temperature
- `power_off` - Power off device

**Response:** `200 OK`

### Get Device Status
```http
GET /api/devices/:deviceId/status
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "deviceId": "uuid",
  "status": "online",
  "isOnline": true,
  "lastOnline": "2024-01-01T00:00:00.000Z",
  "firmwareVersion": "1.0.0"
}
```

---

## Temperature Endpoints

### Get Current Temperature
```http
GET /api/temperature/:deviceId/current
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "deviceId": "uuid",
  "reading": {
    "foodTemp": 25.5,
    "ambientTemp": 22.0,
    "humidity": 45.0,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "unit": "celsius",
    "mode": "idle",
    "targetTemp": null
  }
}
```

### Get Temperature History
```http
GET /api/temperature/:deviceId/history?startDate=2024-01-01&endDate=2024-01-02&limit=100&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional) - ISO 8601 date
- `endDate` (optional) - ISO 8601 date
- `limit` (optional) - Number of records (default: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "deviceId": "uuid",
  "readings": [
    {
      "id": "uuid",
      "foodTemp": 25.5,
      "ambientTemp": 22.0,
      "humidity": 45.0,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "unit": "celsius",
      "mode": "heating",
      "targetTemp": 40
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Temperature Statistics
```http
GET /api/temperature/:deviceId/stats?hours=24
Authorization: Bearer <token>
```

**Query Parameters:**
- `hours` (optional) - Time range in hours (default: 24)

**Response:** `200 OK`
```json
{
  "deviceId": "uuid",
  "timeRange": "24 hours",
  "stats": {
    "avgTemp": 28.5,
    "minTemp": 20.0,
    "maxTemp": 35.0,
    "readingsCount": 144,
    "modeDistribution": {
      "idle": 50,
      "heating": 60,
      "cooling": 34
    },
    "latestReading": { /* reading object */ }
  }
}
```

### Record Temperature
```http
POST /api/temperature/:deviceId/record
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "foodTemp": 35.5,
  "ambientTemp": 25.0,
  "humidity": 50.0,
  "unit": "celsius",
  "mode": "heating",
  "targetTemp": 40.0
}
```

**Response:** `201 Created`

### Delete Old Readings
```http
DELETE /api/temperature/:deviceId/old-readings?days=30
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional) - Delete readings older than X days (default: 30)

**Response:** `200 OK`

---

## Schedule Endpoints

### Create Schedule
```http
POST /api/schedules/:deviceId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Lunch Heating",
  "mode": "heating",
  "targetTemp": 45,
  "startTime": "2024-01-01T12:00:00.000Z",
  "duration": 1800,
  "recurring": {
    "enabled": true,
    "pattern": "daily",
    "daysOfWeek": []
  },
  "enabled": true,
  "notifications": true
}
```

**Mode Options:**
- `idle`, `heating`, `cooling`, `maintaining`

**Recurring Pattern Options:**
- `once`, `daily`, `weekdays`, `weekends`, `custom`

**Response:** `201 Created`

### Get All Schedules
```http
GET /api/schedules/:deviceId
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "deviceId": "uuid",
  "schedules": [
    {
      "id": "uuid",
      "name": "Lunch Heating",
      "mode": "heating",
      "targetTemp": 45,
      "startTime": "2024-01-01T12:00:00.000Z",
      "duration": 1800,
      "recurring": { /* recurring settings */ },
      "enabled": true,
      "notifications": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Schedule by ID
```http
GET /api/schedules/:deviceId/:scheduleId
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Update Schedule
```http
PUT /api/schedules/:deviceId/:scheduleId
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Schedule",
  "targetTemp": 50,
  "enabled": false
}
```

**Response:** `200 OK`

### Delete Schedule
```http
DELETE /api/schedules/:deviceId/:scheduleId
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Toggle Schedule
```http
PATCH /api/schedules/:deviceId/:scheduleId/toggle
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## MQTT Topics

### Device to Server (Subscribe)

- `smartlunchbox/{deviceId}/temperature/current` - Current temperature data
- `smartlunchbox/{deviceId}/status/online` - Device online status
- `smartlunchbox/{deviceId}/alerts` - Device alerts
- `smartlunchbox/{deviceId}/firmware/version` - Firmware version

### Server to Device (Publish)

- `smartlunchbox/{deviceId}/control/heat` - Heating control commands
- `smartlunchbox/{deviceId}/control/cool` - Cooling control commands
- `smartlunchbox/{deviceId}/temperature/target` - Set target temperature
- `smartlunchbox/{deviceId}/timer/schedule` - Schedule configuration

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": [] // Optional validation details
}
```

### Common Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Device offline

---

## Validation Rules

### User Registration
- Email: Valid email format
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- Name: 2-100 characters

### Device
- Name: 1-100 characters
- Temperature: -20 to 100 (celsius)
- Duration: 60 to 28800 seconds

### Schedule
- Name: 1-100 characters
- Start time: Valid ISO 8601 date
- Duration: Minimum 60 seconds
