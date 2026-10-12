# CampusCare: REST API Specification (Postman Compatible)

Base URL: `http://localhost:8080/api/v1`

All responses follow the unified envelope:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-10-11T22:44:38.586"
}
```

---

## 1. Authentication Endpoints

### 1.1 Register Student
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Aarav Gupta",
  "email": "aarav@campuscare.edu",
  "password": "Password@123",
  "studentId": "CS202401",
  "phoneNumber": "+91 9876543210"
}
```
- **Response**: `201 Created` with JWT token and student profile.

### 1.2 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@campuscare.edu",
  "password": "Admin@123"
}
```
- **Response**: `200 OK` with JWT token and role profile.

### 1.3 Get Current User Profile
- **Endpoint**: `GET /auth/me`
- **Access**: Authenticated (`Authorization: Bearer <token>`)

---

## 2. Department Endpoints

### 2.1 Get Departments
- **Endpoint**: `GET /departments?activeOnly=true`
- **Access**: Public / Authenticated

### 2.2 Create Department
- **Endpoint**: `POST /departments`
- **Access**: Role `ADMIN`
- **Request Body**:
```json
{
  "name": "Hostel Facilities",
  "code": "HST",
  "description": "Hostel rooms, water, washrooms, mess",
  "contactEmail": "hostel@campuscare.edu",
  "active": true
}
```

---

## 3. Complaint Endpoints

### 3.1 Submit Complaint
- **Endpoint**: `POST /complaints`
- **Access**: Role `STUDENT`
- **Format**: JSON or Multipart (`data` + optional `file`)
- **Request Body**:
```json
{
  "title": "Projector bulb fused in LH-2",
  "description": "The ceiling projector in LH-2 displays a red warning light and refuses to turn on.",
  "departmentId": 1,
  "category": "Audio / Visual",
  "location": "Academic Block A, 1st Floor, LH-2",
  "priority": "HIGH"
}
```
- **Response**: `201 Created` with generated reference `CC-2026-000005`.

### 3.2 Get My Complaints
- **Endpoint**: `GET /complaints/my?status=IN_PROGRESS&page=0&size=10`
- **Access**: Role `STUDENT`

### 3.3 Get Complaint Details
- **Endpoint**: `GET /complaints/{id}`
- **Access**: Authenticated (Validated by ownership or department assignment)

### 3.4 Update Complaint Status
- **Endpoint**: `PATCH /complaints/{id}/status`
- **Access**: Role `STAFF` (for assigned tickets) or `ADMIN`
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "remarks": "Replaced bulb and verified with instructor",
  "resolutionNotes": "Tested HDMI video projection for 15 minutes."
}
```

### 3.5 Reopen Complaint
- **Endpoint**: `PATCH /complaints/{id}/reopen`
- **Access**: Role `STUDENT` (must own complaint; status must be `RESOLVED`)
- **Request Body**:
```json
{
  "reason": "The projector worked for 5 minutes then shut down again."
}
```

### 3.6 Assign Staff
- **Endpoint**: `POST /complaints/{id}/assignments`
- **Access**: Role `ADMIN`
- **Request Body**:
```json
{
  "staffId": 2,
  "remarks": "Please resolve before 2 PM lab session."
}
```

---

## 4. AI Chatbot Endpoints

### 4.1 Send Message
- **Endpoint**: `POST /chatbot/messages`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "sessionId": "optional-uuid",
  "message": "My classroom projector is not turning on. Where should I complain?"
}
```
- **Response**: `200 OK` with answer, suggestions, and source indicator (`FAQ` or `AI`).
