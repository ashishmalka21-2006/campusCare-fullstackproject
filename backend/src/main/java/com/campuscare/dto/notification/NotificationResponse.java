package com.campuscare.dto.notification;

import com.campuscare.entity.Notification;
import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long complaintId;
    private String complaintReference;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public static NotificationResponse fromEntity(Notification notif) {
        if (notif == null) return null;
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notif.getId());
        dto.setTitle(notif.getTitle());
        dto.setMessage(notif.getMessage());
        dto.setType(notif.getType());
        if (notif.getComplaint() != null) {
            dto.setComplaintId(notif.getComplaint().getId());
            dto.setComplaintReference(notif.getComplaint().getReferenceNumber());
        }
        dto.setRead(notif.isRead());
        dto.setCreatedAt(notif.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getComplaintReference() {
        return complaintReference;
    }

    public void setComplaintReference(String complaintReference) {
        this.complaintReference = complaintReference;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
