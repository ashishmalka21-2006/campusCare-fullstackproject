package com.campuscare.controller;

import com.campuscare.dto.common.ApiResponse;
import com.campuscare.dto.common.PageResponse;
import com.campuscare.dto.complaint.ComplaintResponse;
import com.campuscare.entity.ComplaintStatus;
import com.campuscare.entity.Priority;
import com.campuscare.security.UserPrincipal;
import com.campuscare.service.ComplaintService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/staff")
@PreAuthorize("hasRole('STAFF')")
public class StaffController {

    private final ComplaintService complaintService;

    public StaffController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getAssignedComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> pageResult = complaintService.getStaffComplaints(
                principal.getId(), status, priority, search, pageable
        );

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(pageResult, pageResult.getContent())));
    }
}
