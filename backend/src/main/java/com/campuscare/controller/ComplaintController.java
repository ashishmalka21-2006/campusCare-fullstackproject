package com.campuscare.controller;

import com.campuscare.dto.common.ApiResponse;
import com.campuscare.dto.common.PageResponse;
import com.campuscare.dto.complaint.*;
import com.campuscare.entity.ComplaintStatus;
import com.campuscare.entity.Priority;
import com.campuscare.entity.Role;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.security.UserPrincipal;
import com.campuscare.service.AssignmentService;
import com.campuscare.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AssignmentService assignmentService;

    public ComplaintController(ComplaintService complaintService, AssignmentService assignmentService) {
        this.complaintService = complaintService;
        this.assignmentService = assignmentService;
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaintWithFile(
            @Valid @RequestPart("data") CreateComplaintRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.createComplaint(request, file, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted successfully", response));
    }

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaintJson(
            @Valid @RequestBody CreateComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.createComplaint(request, null, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint submitted successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getMyComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> pageResult = complaintService.getStudentComplaints(
                principal.getId(), status, category, startDate, endDate, search, pageable
        );

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(pageResult, pageResult.getContent())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.getComplaintById(id, principal);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ComplaintHistoryResponse>>> getComplaintHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ComplaintHistoryResponse> history = complaintService.getComplaintHistory(id, principal);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<ComplaintResponse>>> getAllComplaints(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        // If staff member, enforce filtering to their own department if requested
        Long effectiveDeptId = departmentId;
        if (principal.getRole() == Role.STAFF) {
            effectiveDeptId = principal.getDepartmentId();
        }

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ComplaintResponse> pageResult = complaintService.getAllComplaints(
                effectiveDeptId, status, priority, startDate, endDate, search, pageable
        );

        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(pageResult, pageResult.getContent())));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.updateStatus(id, request, principal);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @PatchMapping("/{id}/reopen")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> reopenComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ReopenRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.reopenComplaint(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Complaint reopened successfully", response));
    }

    @PostMapping("/{id}/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = assignmentService.assignComplaint(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }

    @GetMapping("/{id}/assignments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<ComplaintAssignmentResponse>>> getAssignments(
            @PathVariable Long id) {
        List<ComplaintAssignmentResponse> assignments = assignmentService.getAssignmentsForComplaint(id);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }
}
