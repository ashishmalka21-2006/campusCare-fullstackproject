package com.campuscare.dto.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReopenRequest {

    @NotBlank(message = "Reason for reopening is required")
    @Size(min = 10, message = "Please provide an explanation of why the complaint is being reopened (min 10 chars)")
    private String reason;

    public ReopenRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
