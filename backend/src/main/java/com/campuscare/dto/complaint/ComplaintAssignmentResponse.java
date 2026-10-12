package com.campuscare.dto.complaint;

import com.campuscare.entity.ComplaintAssignment;
import java.time.LocalDateTime;

public class ComplaintAssignmentResponse {
    private Long id;
    private Long assignedById;
    private String assignedByName;
    private Long assignedToId;
    private String assignedToName;
    private String remarks;
    private LocalDateTime assignedAt;

    public ComplaintAssignmentResponse() {
    }

    public static ComplaintAssignmentResponse fromEntity(ComplaintAssignment assignment) {
        if (assignment == null) return null;
        ComplaintAssignmentResponse dto = new ComplaintAssignmentResponse();
        dto.setId(assignment.getId());
        if (assignment.getAssignedBy() != null) {
            dto.setAssignedById(assignment.getAssignedBy().getId());
            dto.setAssignedByName(assignment.getAssignedBy().getFullName());
        }
        if (assignment.getAssignedTo() != null) {
            dto.setAssignedToId(assignment.getAssignedTo().getId());
            dto.setAssignedToName(assignment.getAssignedTo().getFullName());
        }
        dto.setRemarks(assignment.getRemarks());
        dto.setAssignedAt(assignment.getAssignedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssignedById() {
        return assignedById;
    }

    public void setAssignedById(Long assignedById) {
        this.assignedById = assignedById;
    }

    public String getAssignedByName() {
        return assignedByName;
    }

    public void setAssignedByName(String assignedByName) {
        this.assignedByName = assignedByName;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
