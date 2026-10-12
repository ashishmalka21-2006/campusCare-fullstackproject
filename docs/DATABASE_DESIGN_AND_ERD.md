# CampusCare: Database Design & Entity Relationship Diagram (ERD)

## 1. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "employs"
    DEPARTMENTS ||--o{ COMPLAINTS : "receives"
    USERS ||--o{ COMPLAINTS : "submits (as student)"
    USERS ||--o{ COMPLAINTS : "works_on (as assigned staff)"
    USERS ||--o{ COMPLAINT_ASSIGNMENTS : "delegated_by (admin)"
    USERS ||--o{ COMPLAINT_ASSIGNMENTS : "assigned_to (staff)"
    USERS ||--o{ COMPLAINT_HISTORY : "changed_by"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ CHATBOT_SESSIONS : "initiates"

    COMPLAINTS ||--o{ COMPLAINT_ASSIGNMENTS : "tracks"
    COMPLAINTS ||--o{ COMPLAINT_HISTORY : "logs_state"
    COMPLAINTS ||--o{ NOTIFICATIONS : "triggers"

    CHATBOT_SESSIONS ||--o{ CHATBOT_MESSAGES : "contains"

    DEPARTMENTS {
        bigint id PK
        varchar name UK
        varchar code UK
        varchar description
        varchar contact_email
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    USERS {
        bigint id PK
        varchar full_name
        varchar email UK
        varchar password
        varchar role
        varchar identifier_code
        varchar phone_number
        bigint department_id FK
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    COMPLAINTS {
        bigint id PK
        varchar reference_number UK
        varchar title
        text description
        varchar category
        varchar location
        varchar priority
        varchar status
        bigint student_id FK
        bigint department_id FK
        bigint assigned_staff_id FK
        varchar attachment_path
        varchar attachment_original_name
        text resolution_notes
        timestamp resolved_at
        int reopened_count
        timestamp created_at
        timestamp updated_at
    }

    COMPLAINT_ASSIGNMENTS {
        bigint id PK
        bigint complaint_id FK
        bigint assigned_by_id FK
        bigint assigned_to_id FK
        varchar remarks
        timestamp assigned_at
    }

    COMPLAINT_HISTORY {
        bigint id PK
        bigint complaint_id FK
        bigint changed_by_id FK
        varchar from_status
        varchar to_status
        text remarks
        timestamp created_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        varchar title
        text message
        varchar type
        bigint complaint_id FK
        boolean is_read
        timestamp created_at
    }

    CHATBOT_SESSIONS {
        varchar id PK
        bigint user_id FK
        timestamp created_at
        timestamp updated_at
    }

    CHATBOT_MESSAGES {
        bigint id PK
        varchar session_id FK
        varchar sender
        text message
        varchar source
        timestamp created_at
    }

    COMPLAINT_SEQUENCES {
        int sequence_year PK
        bigint current_value
    }
```

---

## 2. Concurrency-Resistant Reference Generation Mechanism
Rather than computing `COUNT(*)` (which causes severe race conditions and duplicate primary keys under concurrent user requests), CampusCare implements an atomic sequence table `complaint_sequences`:
```sql
CREATE TABLE complaint_sequences (
    sequence_year INT PRIMARY KEY,
    current_value BIGINT NOT NULL
);
```
At runtime, `ReferenceNumberGenerator` executes inside an isolated transaction (`@Transactional(propagation = Propagation.REQUIRES_NEW)`) and locks the row for update:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT s FROM ComplaintSequence s WHERE s.sequenceYear = :year")
Optional<ComplaintSequence> findBySequenceYearForUpdate(@Param("year") Integer year);
```
This guarantees strictly unique, monotonic identifiers formatted as `CC-2026-000001`, `CC-2026-000002`, etc., without concurrency collisions.
