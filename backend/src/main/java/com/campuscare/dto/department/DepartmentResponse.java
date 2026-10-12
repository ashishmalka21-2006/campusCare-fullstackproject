package com.campuscare.dto.department;

import com.campuscare.entity.Department;
import java.time.LocalDateTime;

public class DepartmentResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String contactEmail;
    private boolean active;
    private LocalDateTime createdAt;

    public DepartmentResponse() {
    }

    public static DepartmentResponse fromEntity(Department dept) {
        if (dept == null) return null;
        DepartmentResponse response = new DepartmentResponse();
        response.setId(dept.getId());
        response.setName(dept.getName());
        response.setCode(dept.getCode());
        response.setDescription(dept.getDescription());
        response.setContactEmail(dept.getContactEmail());
        response.setActive(dept.isActive());
        response.setCreatedAt(dept.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
