package com.campuscare.dto.complaint;

import com.campuscare.entity.Complaint;
import com.campuscare.entity.ComplaintStatus;
import com.campuscare.entity.Priority;

import java.time.LocalDateTime;

public class ComplaintResponse {
    private Long id;
    private String referenceNumber;
    private String title;
    private String description;
    private String category;
    private String location;
    private Priority priority;
    private ComplaintStatus status;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long departmentId;
    private String departmentName;
    private Long assignedStaffId;
    private String assignedStaffName;
    private String attachmentPath;
    private String attachmentOriginalName;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private int reopenedCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplaintResponse() {
    }

    public static ComplaintResponse fromEntity(Complaint complaint) {
        if (complaint == null) return null;
        ComplaintResponse dto = new ComplaintResponse();
        dto.setId(complaint.getId());
        dto.setReferenceNumber(complaint.getReferenceNumber());
        dto.setTitle(complaint.getTitle());
        dto.setDescription(complaint.getDescription());
        dto.setCategory(complaint.getCategory());
        dto.setLocation(complaint.getLocation());
        dto.setPriority(complaint.getPriority());
        dto.setStatus(complaint.getStatus());
        if (complaint.getStudent() != null) {
            dto.setStudentId(complaint.getStudent().getId());
            dto.setStudentName(complaint.getStudent().getFullName());
            dto.setStudentEmail(complaint.getStudent().getEmail());
        }
        if (complaint.getDepartment() != null) {
            dto.setDepartmentId(complaint.getDepartment().getId());
            dto.setDepartmentName(complaint.getDepartment().getName());
        }
        if (complaint.getAssignedStaff() != null) {
            dto.setAssignedStaffId(complaint.getAssignedStaff().getId());
            dto.setAssignedStaffName(complaint.getAssignedStaff().getFullName());
        }
        dto.setAttachmentPath(complaint.getAttachmentPath());
        dto.setAttachmentOriginalName(complaint.getAttachmentOriginalName());
        dto.setResolutionNotes(complaint.getResolutionNotes());
        dto.setResolvedAt(complaint.getResolvedAt());
        dto.setReopenedCount(complaint.getReopenedCount());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Long getAssignedStaffId() {
        return assignedStaffId;
    }

    public void setAssignedStaffId(Long assignedStaffId) {
        this.assignedStaffId = assignedStaffId;
    }

    public String getAssignedStaffName() {
        return assignedStaffName;
    }

    public void setAssignedStaffName(String assignedStaffName) {
        this.assignedStaffName = assignedStaffName;
    }

    public String getAttachmentPath() {
        return attachmentPath;
    }

    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }

    public String getAttachmentOriginalName() {
        return attachmentOriginalName;
    }

    public void setAttachmentOriginalName(String attachmentOriginalName) {
        this.attachmentOriginalName = attachmentOriginalName;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public int getReopenedCount() {
        return reopenedCount;
    }

    public void setReopenedCount(int reopenedCount) {
        this.reopenedCount = reopenedCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
