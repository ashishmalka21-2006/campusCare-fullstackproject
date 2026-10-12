# CampusCare: Automated Testing & Verification Report

## 1. Test Suite Summary
Automated unit, service-layer, and security authorization tests were executed using JUnit 5, Mockito, and Spring Boot Test via the Maven Wrapper.

```text
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.campuscare.service.AssignmentServiceTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 3.523 s

Running com.campuscare.service.AuthServiceTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.464 s

Running com.campuscare.service.ComplaintServiceTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.185 s

Results:
Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
Total time: 31.967 s
Finished at: 2026-10-11T22:31:13+05:30
```

---

## 2. Test Case Specifications

| Test ID | Test Class | Method | Scenario Tested | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `AuthServiceTest` | `testRegisterStudent_Success` | Registers new student, hashes password with BCrypt, enforces STUDENT role | **PASSED** |
| **TC-02** | `AuthServiceTest` | `testRegisterStudent_EmailAlreadyExists` | Throws `BadRequestException` when email is already registered | **PASSED** |
| **TC-03** | `AuthServiceTest` | `testLogin_Success` | Authenticates valid credentials, issues HMAC-SHA256 JWT | **PASSED** |
| **TC-04** | `ComplaintServiceTest` | `testCreateComplaint_Success` | Verifies atomic reference number generation (`CC-2026-000001`) and audit logging | **PASSED** |
| **TC-05** | `ComplaintServiceTest` | `testReopenComplaint_Success` | Allows student to reopen complaint when in `RESOLVED` state | **PASSED** |
| **TC-06** | `ComplaintServiceTest` | `testReopenComplaint_NotAuthor` | Throws `UnauthorizedException` when a different student attempts to reopen | **PASSED** |
| **TC-07** | `ComplaintServiceTest` | `testReopenComplaint_NotResolved` | Throws `BadRequestException` when complaint is not in `RESOLVED` state | **PASSED** |
| **TC-08** | `AssignmentServiceTest` | `testAssignComplaint_Success` | Admin assigns complaint to eligible staff member in the same department | **PASSED** |
| **TC-09** | `AssignmentServiceTest` | `testAssignComplaint_DepartmentMismatch` | Rejects assigning staff member belonging to a different department | **PASSED** |
| **TC-10** | `AssignmentServiceTest` | `testAssignComplaint_NotStaffRole` | Rejects assigning complaint to a non-STAFF user account | **PASSED** |

---

## 3. Frontend Build Validation
Frontend bundling and compilation was tested using Vite production build:
```text
> campuscare-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 924 modules transformed.
dist/index.html                               1.04 kB │ gzip:   0.62 kB
dist/assets/bootstrap-icons-DJdhg9lH.woff2  134.01 kB
dist/assets/bootstrap-icons-BHUGvtHM.woff   180.29 kB
dist/assets/index-DiLpWwkD.css              313.15 kB │ gzip:  46.51 kB
dist/assets/index-BAKTjwum.js               757.26 kB │ gzip: 210.18 kB
✓ built in 2.43s
Exit code: 0
```
All JSX files, components, and route guards compiled with 0 errors.
