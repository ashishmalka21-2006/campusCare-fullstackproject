# CampusCare: System Architecture Specification

## 1. Executive Summary & Architecture Overview
**CampusCare** is an enterprise-grade, full-stack, AI-enabled College Complaint Management and Resolution System engineered for academic institutions. The system utilizes a modern three-tier decoupled architecture:
1. **Presentation Layer**: Single Page Application (SPA) built with React 18, Vite, Bootstrap 5, and Recharts.
2. **Application & Business Logic Layer**: RESTful Spring Boot 3 microservices with Spring Security, JWT stateless session authentication, Jakarta Bean Validation, and multi-provider AI integration.
3. **Data Persistence Layer**: MySQL 8.0 relational database with JPA/Hibernate ORM, atomic sequences, and audit histories.

---

## 2. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client Presentation Layer (React 18 + Vite)"]
        UI_Student["Student Portal<br/>(Dashboard, Filing, Tracking)"]
        UI_Staff["Staff Portal<br/>(Task Queue, Diagnostics, Resolution)"]
        UI_Admin["Admin Console<br/>(Dispatch, Users, Recharts Analytics)"]
        UI_Chatbot["AI Chatbot Widget<br/>(FAQ & Campus Guidance)"]
    end

    subgraph Gateway ["Reverse Proxy & Network Security"]
        Nginx["Nginx Reverse Proxy / Vite Proxy (:5173 / :80)"]
    end

    subgraph SecurityLayer ["Security & Authentication Pipeline"]
        JWT_Filter["JwtAuthenticationFilter<br/>(Bearer Token Validation)"]
        Auth_Manager["AuthenticationManager & BCrypt"]
        RBAC["Role-Based Access Control<br/>(STUDENT, STAFF, ADMIN)"]
    end

    subgraph ServiceLayer ["Spring Boot 3.3.4 Application Services"]
        AuthService["AuthService"]
        ComplaintService["ComplaintService<br/>(Lifecycle & Permissions)"]
        AssignmentService["AssignmentService<br/>(Department Routing)"]
        NotificationService["NotificationService<br/>(In-App Events)"]
        AdminService["AdminService<br/>(SQL Aggregations)"]
        ChatbotService["ChatbotService<br/>(AI Provider + FAQ Fallback)"]
        FileService["FileStorageService<br/>(Secure Photo Uploads)"]
    end

    subgraph DataLayer ["Persistence Layer (MySQL 8.0)"]
        DB_Users[("users")]
        DB_Departments[("departments")]
        DB_Complaints[("complaints")]
        DB_Assignments[("complaint_assignments")]
        DB_History[("complaint_history")]
        DB_Notifications[("notifications")]
        DB_Chat[("chatbot_sessions & messages")]
        DB_Seq[("complaint_sequences")]
    end

    subgraph ExternalServices ["External AI Service"]
        GeminiAI["Google Gemini AI / AI Provider API"]
    end

    UI_Student --> Nginx
    UI_Staff --> Nginx
    UI_Admin --> Nginx
    UI_Chatbot --> Nginx

    Nginx --> JWT_Filter
    JWT_Filter --> Auth_Manager
    JWT_Filter --> RBAC
    RBAC --> ServiceLayer

    AuthService --> DB_Users
    ComplaintService --> DB_Complaints
    ComplaintService --> DB_Seq
    ComplaintService --> DB_History
    AssignmentService --> DB_Assignments
    NotificationService --> DB_Notifications
    AdminService --> DB_Complaints
    FileService --> Storage[("./uploads Folder")]

    ChatbotService --> GeminiAI
    ChatbotService --> DB_Chat
```

---

## 3. Security Architecture
- **Stateless Authentication**: Every protected request presents an `Authorization: Bearer <JWT>` header verified with HMAC-SHA256 signature against server-side secret key.
- **Resource Ownership Validation**:
  - Students can query and view only their own complaints (`complaint.student.id == principal.id`).
  - Staff members can only view complaints assigned to them or matching their departmental scope.
  - Public registration strictly enforces role `STUDENT`. Staff and Admin accounts can only be created by an authenticated administrator.
- **Controlled Status State Machine**:
  - `SUBMITTED` -> `ASSIGNED` (by Admin)
  - `ASSIGNED` -> `IN_PROGRESS` (by assigned Staff)
  - `IN_PROGRESS` -> `RESOLVED` (by assigned Staff, requires resolution report)
  - `RESOLVED` -> `REOPENED` (by submitting Student)
  - `RESOLVED` / `REOPENED` -> `CLOSED`
