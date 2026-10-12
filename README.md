# CampusCare: AI-Enabled College Complaint Management & Resolution System

> **Academic Capstone Project** | B.Tech 3rd-Year Computer Science & Engineering (CSE)

CampusCare is an enterprise-grade full-stack web application designed to digitize, accelerate, and audit the lifecycle of campus infrastructure and facility complaints for universities and colleges.

---

## 🛠️ Mandatory Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Bootstrap 5, Bootstrap Icons, Recharts
- **Backend**: Java 17, Spring Boot 3.3.4, Spring Security 6, JWT (`jjwt 0.12.5`), Hibernate / JPA, BCrypt, Maven Wrapper (`mvnw.cmd` / `mvnw`)
- **Database**: MySQL 8.0, foreign keys, unique constraints, pessimistic lock sequences, and audit history tables
- **AI Integration**: Backend-mediated AI Chatbot service with rule-based fallback FAQ engine
- **Testing & DevOps**: JUnit 5, Mockito, Spring Boot Test, Multi-stage Dockerfiles, Docker Compose

---

## 🚀 Quick Start (Local Development)

### 1. Database Configuration
Ensure MySQL 8.0 is running locally on port 3306. The database `campuscare` will be created automatically.
Credentials in `backend/src/main/resources/application.yml`:
- Username: `root`
- Password: `varun123` (or set via `DB_PASSWORD` env variable)

### 2. Run the Spring Boot Backend
```bash
cd backend
# Run automated tests (10/10 passed)
.\mvnw.cmd test

# Start the Spring Boot server
.\mvnw.cmd spring-boot:run
```
Backend runs on `http://localhost:8080/`. Initial departments, demo users, and realistic sample complaints are automatically seeded into MySQL on first boot.

### 3. Run the React Frontend
```bash
cd frontend
# Start Vite development server
npm run dev
```
Frontend runs on `http://localhost:5173/`.

---

## 🔑 Pre-Seeded Academic Demo Credentials

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campuscare.edu` | `Admin@123` | Executive Dashboard, User/Staff Management, Department Config, Ticket Routing |
| **Staff (IT)** | `staff.it@campuscare.edu` | `Staff@123` | Assigned Complaints Queue, Diagnostic & Resolution Notes |
| **Staff (Hostel)** | `staff.hostel@campuscare.edu` | `Staff@123` | Hostel Plumbing, Electrical & Room Maintenance Tickets |
| **Student** | `student1@campuscare.edu` | `Student@123` | File Complaints, Live Timeline Tracking, Reopen Tickets, AI Chatbot |
| **Student 2** | `student2@campuscare.edu` | `Student@123` | File Complaints, Multi-category Student Testing |

*Quick-Fill buttons are integrated directly on the `/login` page for fast testing!*

---

## 📁 Repository Structure

```text
campuscare/
├── backend/
│   ├── .mvn/                      # Embedded Apache Maven 3.9.6 distribution
│   ├── mvnw.cmd / mvnw            # Self-contained Maven wrapper scripts
│   ├── pom.xml                    # Spring Boot 3 & dependency configuration
│   ├── Dockerfile                 # Multi-stage production container build
│   └── src/
│       ├── main/java/com/campuscare/
│       │   ├── config/            # SecurityConfig, CorsConfig, DataInitializer
│       │   ├── controller/        # Auth, Dept, Complaint, Staff, Admin, Notif, Chatbot, File
│       │   ├── dto/               # Strongly-typed request and response DTOs
│       │   ├── entity/            # JPA entities (Department, User, Complaint, History, etc.)
│       │   ├── exception/         # RestControllerAdvice GlobalExceptionHandler
│       │   ├── repository/        # Spring Data JPA repositories with query methods
│       │   ├── security/          # JwtTokenProvider, UserPrincipal, Filters
│       │   └── service/           # Business logic, Concurrency Sequences, AI integration
│       └── test/                  # Automated JUnit 5 & Mockito test suites
├── frontend/
│   ├── package.json               # React, Vite, Bootstrap, Recharts, Axios
│   ├── vite.config.js             # Vite configuration with /api backend proxy
│   ├── Dockerfile                 # Multi-stage Nginx container build
│   ├── nginx.conf                 # Nginx SPA routing and reverse-proxy config
│   └── src/
│       ├── api/                   # Axios client and centralized API services
│       ├── components/            # Reusable badges, modals, timeline, Navbar, Sidebar
│       ├── context/               # AuthContext (JWT) and NotificationContext
│       └── pages/                 # Landing, Login, Register, Student, Staff, Admin pages
├── docs/
│   ├── SYSTEM_ARCHITECTURE.md     # Architectural overview & Mermaid diagram
│   ├── DATABASE_DESIGN_AND_ERD.md # Relational ERD & Sequence mechanism
│   ├── API_SPECIFICATION.md       # Postman compatible REST API docs
│   ├── TESTING_AND_EVALUATION_REPORT.md # Test execution results (10/10 tests passed)
│   └── USER_MANUAL_AND_DEPLOYMENT_GUIDE.md # User guide & B.Tech CO mapping
├── docker-compose.yml             # Full-stack container orchestration
├── .env.example / .env            # Environment configuration template
└── README.md
```

---

## 🏆 Course Outcomes (CO) Validation

- **CO1**: Responsive React 18 frontend with reusable components and Recharts data analytics.
- **CO2**: REST microservices on Spring Boot 3.3.4 with 8 interconnected MySQL tables and JPA relationships.
- **CO3**: Secure JWT authentication, BCrypt password hashing, and role authorization (`STUDENT`, `STAFF`, `ADMIN`).
- **CO4**: Intelligent AI Assistant with Google Gemini integration and rule-based FAQ fallback.
- **CO5**: Automated tests (10/10 passed), Docker Compose deployment, and full SRS/ERD documentation.
