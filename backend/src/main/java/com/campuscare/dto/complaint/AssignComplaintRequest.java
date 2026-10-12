package com.campuscare.dto.complaint;

import jakarta.validation.constraints.NotNull;

public class AssignComplaintRequest {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    private String remarks;

    public AssignComplaintRequest() {
    }

    public AssignComplaintRequest(Long staffId, String remarks) {
        this.staffId = staffId;
        this.remarks = remarks;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
