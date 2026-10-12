# CampusCare: User Manual, Course Outcomes & Deployment Guide

## 1. Mapping to B.Tech Course Outcomes (COs)

| Course Outcome | Implementation Proof in CampusCare |
| :--- | :--- |
| **CO1: Responsive Frontend Applications (React)** | Built with React 18 & Vite, reusable components (`StatusBadge`, `PriorityBadge`, `Modal`, `EmptyState`, `Navbar`, `Sidebar`), React Router v6 role-protected routes, Axios HTTP client, Bootstrap 5 responsive grid, and Recharts interactive analytics charts. |
| **CO2: Backend APIs with Spring Boot & MySQL** | REST microservices on Spring Boot 3.3.4, Hibernate ORM, 8 interconnected MySQL entity tables (`departments`, `users`, `complaints`, `complaint_assignments`, `complaint_history`, `notifications`, `chatbot_sessions`, `chatbot_messages`), and pessimistic locking sequence generator. |
| **CO3: Authentication, Authorization & Security** | BCrypt password encryption, stateless JWT authentication (`jjwt 0.12.5`), Spring Security 6 filter chain, strict server-side resource ownership validation, and prohibition of non-student self-registration. |
| **CO4: AI-Powered Chatbot Integration** | Dedicated Spring Boot `ChatbotService` connecting to Google Gemini AI API with fallback rule-based FAQ engine covering complaint filing, category routing, and status lifecycle explanations without requiring frontend exposure of API credentials. |
| **CO5: Testing, Containerization & Deployment** | 10 automated JUnit 5/Mockito test cases passed with 0 errors, multi-stage production Dockerfiles for frontend (Nginx) and backend (Temurin JRE), and docker-compose orchestration. |

---

## 2. User Manual by Role

### 2.1 Student Workflow
1. **Accessing the Portal**: Navigate to `http://localhost:5173/` and click **Register as Student** or **Sign In**.
2. **Submitting a Problem**:
   - Go to **Submit Complaint** in the sidebar.
   - Enter title, select department (e.g., IT Support), category, exact campus location, and priority.
   - Optionally attach an image photo proof (.png, .jpg, .webp).
   - Click **Register Complaint** to obtain your tracking ID (`CC-2026-XXXXXX`).
3. **Tracking & Reopening**:
   - View your complaints in **My Complaints**.
   - Open any ticket to inspect the live audit timeline.
   - If a technician marks the problem **RESOLVED** but the issue persists, click the orange **Reopen Complaint** button, enter the reason, and transition the status to **REOPENED**.
4. **AI Assistant**:
   - Click the floating robot icon on the bottom right to query category advice, Wi-Fi assistance, or status meanings.

### 2.2 Staff Workflow
1. **Sign In**: Log in using `staff.it@campuscare.edu` / `Staff@123` (or your assigned staff account).
2. **Review Workload**: The **Staff Dashboard** displays tickets assigned specifically to you in your department.
3. **Transition to In-Progress**: When starting work, open the complaint and click **Start Work (Mark In-Progress)**.
4. **Resolve Complaint**: When repairs are verified, input detailed resolution notes and click **Complete & Mark as Resolved**.

### 2.3 Administrator Workflow
1. **Sign In**: Log in using `admin@campuscare.edu` / `Admin@123`.
2. **Dispatch Unassigned Issues**: Open **Complaint Assignment** or the dashboard quick queue. Select an eligible departmental staff technician and click **Dispatch Assignment**.
3. **Department Management**: Open **Departments** to add new college departments or toggle their active status.
4. **User Management**: Open **Users** to search students, activate/deactivate accounts, or provision new staff technicians.
5. **Analytics & Reports**: Open **Analytics & Reports** to inspect Recharts visualizations for department volume, priority breakdowns, monthly velocity, and resolution SLA times.

---

## 3. Local Development & Deployment Instructions

### Prerequisites
- Java 17+ (Adoptium / Oracle JDK)
- Node.js 18+ and npm
- MySQL 8.0 (Windows Service `MySQL80` running locally or Docker)

### 3.1 Backend Execution
```powershell
cd C:\Users\DAND\.gemini\antigravity-ide\scratch\campuscare\backend
# Run automated tests:
.\mvnw.cmd test

# Run Spring Boot application locally:
.\mvnw.cmd spring-boot:run
```
Backend runs on `http://localhost:8080/`.

### 3.2 Frontend Execution
```powershell
cd C:\Users\DAND\.gemini\antigravity-ide\scratch\campuscare\frontend
# Install dependencies:
npm install

# Run Vite dev server:
npm run dev
```
Frontend runs on `http://localhost:5173/`.

### 3.3 Production Docker Deployment
```powershell
cd C:\Users\DAND\.gemini\antigravity-ide\scratch\campuscare
docker compose up --build -d
```
All 3 containers (MySQL 8, Spring Boot 3, and Nginx React) start up with persistent database volumes.
