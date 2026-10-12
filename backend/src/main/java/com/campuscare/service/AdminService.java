package com.campuscare.service;

import com.campuscare.dto.admin.CreateStaffUserRequest;
import com.campuscare.dto.admin.DashboardStatsResponse;
import com.campuscare.dto.auth.UserResponse;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(ComplaintRepository complaintRepository,
                        UserRepository userRepository,
                        DepartmentRepository departmentRepository,
                        PasswordEncoder passwordEncoder) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long total = complaintRepository.count();
        long submitted = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long reopened = complaintRepository.countByStatus(ComplaintStatus.REOPENED);
        long closed = complaintRepository.countByStatus(ComplaintStatus.CLOSED);

        stats.setTotalComplaints(total);
        stats.setPendingComplaints(submitted + assigned);
        stats.setInProgressComplaints(inProgress);
        stats.setResolvedComplaints(resolved);
        stats.setReopenedComplaints(reopened);
        stats.setClosedComplaints(closed);

        stats.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        stats.setTotalStaff(userRepository.countByRole(Role.STAFF));
        stats.setTotalDepartments(departmentRepository.count());

        // Department breakdown
        Map<String, Long> byDept = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByDepartment()) {
            byDept.put((String) row[0], ((Number) row[1]).longValue());
        }
        stats.setComplaintsByDepartment(byDept);

        // Priority breakdown
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByPriority()) {
            byPriority.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        stats.setComplaintsByPriority(byPriority);

        // Status breakdown
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Object[] row : complaintRepository.countComplaintsByStatus()) {
            byStatus.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        stats.setComplaintsByStatus(byStatus);

        // Monthly breakdown
        List<Map<String, Object>> byMonth = new ArrayList<>();
        for (Object[] row : complaintRepository.countComplaintsByMonth()) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", row[0]);
            item.put("count", ((Number) row[1]).longValue());
            byMonth.add(item);
        }
        stats.setComplaintsByMonth(byMonth);

        // Average resolution time (calculated from resolved complaints)
        List<Complaint> resolvedList = complaintRepository.findAll().stream()
                .filter(c -> c.getResolvedAt() != null && c.getCreatedAt() != null)
                .collect(Collectors.toList());

        if (!resolvedList.isEmpty()) {
            double totalHours = resolvedList.stream()
                    .mapToDouble(c -> Duration.between(c.getCreatedAt(), c.getResolvedAt()).toMinutes() / 60.0)
                    .sum();
            stats.setAvgResolutionHours(Math.round((totalHours / resolvedList.size()) * 10.0) / 10.0);
        } else {
            stats.setAvgResolutionHours(0.0);
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(Role role, Long deptId, String search, Pageable pageable) {
        return userRepository.searchUsers(role, deptId, search, pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getStaffMembers(Long deptId) {
        if (deptId != null) {
            return userRepository.findByDepartmentIdAndRoleAndActiveTrue(deptId, Role.STAFF)
                    .stream()
                    .map(UserResponse::fromEntity)
                    .collect(Collectors.toList());
        } else {
            return userRepository.findByRoleAndActiveTrue(Role.STAFF)
                    .stream()
                    .map(UserResponse::fromEntity)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public UserResponse updateUserActiveStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(active);
        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createStaffUser(CreateStaffUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("A user with this email already exists");
        }

        Department dept = null;
        if (request.getRole() == Role.STAFF) {
            if (request.getDepartmentId() == null) {
                throw new BadRequestException("Department is required for staff accounts");
            }
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setIdentifierCode(request.getEmployeeId());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(dept);
        user.setActive(true);

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }
}
