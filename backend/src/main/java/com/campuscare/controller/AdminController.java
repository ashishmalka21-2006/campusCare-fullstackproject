package com.campuscare.controller;

import com.campuscare.dto.admin.CreateStaffUserRequest;
import com.campuscare.dto.admin.DashboardStatsResponse;
import com.campuscare.dto.admin.UserStatusUpdateRequest;
import com.campuscare.dto.auth.UserResponse;
import com.campuscare.dto.common.ApiResponse;
import com.campuscare.dto.common.PageResponse;
import com.campuscare.entity.Role;
import com.campuscare.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getReports() {
        DashboardStatsResponse reports = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> searchUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserResponse> pageResult = adminService.searchUsers(role, departmentId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(pageResult, pageResult.getContent())));
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserActiveStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        UserResponse response = adminService.updateUserActiveStatus(id, request.getActive());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", response));
    }

    @PostMapping("/users/staff")
    public ResponseEntity<ApiResponse<UserResponse>> createStaffUser(
            @Valid @RequestBody CreateStaffUserRequest request) {
        UserResponse response = adminService.createStaffUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Staff account created successfully", response));
    }

    @GetMapping("/staff-by-dept")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStaffMembers(
            @RequestParam(required = false) Long departmentId) {
        List<UserResponse> list = adminService.getStaffMembers(departmentId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
