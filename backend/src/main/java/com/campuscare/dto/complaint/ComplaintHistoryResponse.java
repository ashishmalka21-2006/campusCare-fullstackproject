package com.campuscare.dto.complaint;

import com.campuscare.entity.ComplaintHistory;
import com.campuscare.entity.ComplaintStatus;

import java.time.LocalDateTime;

public class ComplaintHistoryResponse {
    private Long id;
    private Long changedById;
    private String changedByName;
    private String changedByRole;
    private ComplaintStatus fromStatus;
    private ComplaintStatus toStatus;
    private String remarks;
    private LocalDateTime createdAt;

    public ComplaintHistoryResponse() {
    }

    public static ComplaintHistoryResponse fromEntity(ComplaintHistory history) {
        if (history == null) return null;
        ComplaintHistoryResponse dto = new ComplaintHistoryResponse();
        dto.setId(history.getId());
        if (history.getChangedBy() != null) {
            dto.setChangedById(history.getChangedBy().getId());
            dto.setChangedByName(history.getChangedBy().getFullName());
            dto.setChangedByRole(history.getChangedBy().getRole().name());
        }
        dto.setFromStatus(history.getFromStatus());
        dto.setToStatus(history.getToStatus());
        dto.setRemarks(history.getRemarks());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getChangedById() {
        return changedById;
    }

    public void setChangedById(Long changedById) {
        this.changedById = changedById;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public String getChangedByRole() {
        return changedByRole;
    }

    public void setChangedByRole(String changedByRole) {
        this.changedByRole = changedByRole;
    }

    public ComplaintStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(ComplaintStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public ComplaintStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(ComplaintStatus toStatus) {
        this.toStatus = toStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
