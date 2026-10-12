package com.campuscare.service;

import com.campuscare.dto.complaint.*;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.ComplaintHistoryRepository;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import com.campuscare.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final ReferenceNumberGenerator referenceNumberGenerator;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            DepartmentRepository departmentRepository,
                            UserRepository userRepository,
                            ComplaintHistoryRepository historyRepository,
                            ReferenceNumberGenerator referenceNumberGenerator,
                            NotificationService notificationService,
                            FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.referenceNumberGenerator = referenceNumberGenerator;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request, MultipartFile file, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        if (!department.isActive()) {
            throw new BadRequestException("The selected department is currently inactive");
        }

        String refNumber = referenceNumberGenerator.generateNextReferenceNumber();

        Complaint complaint = new Complaint();
        complaint.setReferenceNumber(refNumber);
        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setCategory(request.getCategory().trim());
        complaint.setLocation(request.getLocation().trim());
        complaint.setPriority(request.getPriority());
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setStudent(student);
        complaint.setDepartment(department);

        if (file != null && !file.isEmpty()) {
            String storedFileName = fileStorageService.storeFile(file);
            complaint.setAttachmentPath(storedFileName);
            complaint.setAttachmentOriginalName(file.getOriginalFilename());
        }

        complaint = complaintRepository.save(complaint);

        // Record initial status history
        ComplaintHistory history = new ComplaintHistory(
                complaint, student, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student"
        );
        historyRepository.save(history);

        // Notify Student
        notificationService.createNotification(
                student,
                "Complaint Registered",
                "Your complaint has been submitted successfully with reference #" + refNumber,
                "COMPLAINT_SUBMITTED",
                complaint
        );

        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getStudentComplaints(Long studentId,
                                                        ComplaintStatus status,
                                                        String category,
                                                        LocalDateTime startDate,
                                                        LocalDateTime endDate,
                                                        String search,
                                                        Pageable pageable) {
        return complaintRepository.findStudentComplaints(studentId, status, category, startDate, endDate, search, pageable)
                .map(ComplaintResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getStaffComplaints(Long staffId,
                                                      ComplaintStatus status,
                                                      Priority priority,
                                                      String search,
                                                      Pageable pageable) {
        return complaintRepository.findStaffComplaints(staffId, status, priority, search, pageable)
                .map(ComplaintResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAllComplaints(Long deptId,
                                                    ComplaintStatus status,
                                                    Priority priority,
                                                    LocalDateTime startDate,
                                                    LocalDateTime endDate,
                                                    String search,
                                                    Pageable pageable) {
        return complaintRepository.findAllWithFilters(deptId, status, priority, startDate, endDate, search, pageable)
                .map(ComplaintResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        // Ownership and Role Check
        validateComplaintAccess(complaint, principal);

        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintHistoryResponse> getComplaintHistory(Long id, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        validateComplaintAccess(complaint, principal);

        return historyRepository.findByComplaintIdOrderByCreatedAtAsc(id)
                .stream()
                .map(ComplaintHistoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, UpdateStatusRequest request, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ComplaintStatus currentStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            throw new BadRequestException("Complaint is already in " + currentStatus + " status");
        }

        // Validate allowed transitions based on roles
        if (principal.getRole() == Role.STAFF) {
            if (complaint.getAssignedStaff() == null || !complaint.getAssignedStaff().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only update complaints assigned directly to you");
            }
            if (currentStatus == ComplaintStatus.ASSIGNED && newStatus != ComplaintStatus.IN_PROGRESS) {
                throw new BadRequestException("Staff can only transition assigned complaints to IN_PROGRESS");
            }
            if (currentStatus == ComplaintStatus.IN_PROGRESS && newStatus != ComplaintStatus.RESOLVED) {
                throw new BadRequestException("Staff can only transition in-progress complaints to RESOLVED");
            }
            if (currentStatus == ComplaintStatus.RESOLVED || currentStatus == ComplaintStatus.CLOSED) {
                throw new BadRequestException("Cannot modify an already resolved or closed complaint");
            }
        }

        if (newStatus == ComplaintStatus.RESOLVED) {
            if (request.getResolutionNotes() == null || request.getResolutionNotes().trim().length() < 5) {
                throw new BadRequestException("Resolution notes must be provided when marking a complaint as resolved");
            }
            complaint.setResolutionNotes(request.getResolutionNotes().trim());
            complaint.setResolvedAt(LocalDateTime.now());
        }

        complaint.setStatus(newStatus);
        complaint = complaintRepository.save(complaint);

        // Record history
        String remarks = request.getRemarks() != null ? request.getRemarks() : "Status updated to " + newStatus;
        if (newStatus == ComplaintStatus.RESOLVED && request.getResolutionNotes() != null) {
            remarks = "Resolved: " + request.getResolutionNotes();
        }
        ComplaintHistory history = new ComplaintHistory(complaint, currentUser, currentStatus, newStatus, remarks);
        historyRepository.save(history);

        // Notify Student
        notificationService.createNotification(
                complaint.getStudent(),
                "Complaint Status Updated",
                "Your complaint #" + complaint.getReferenceNumber() + " status is now " + newStatus,
                "STATUS_CHANGED",
                complaint
        );

        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional
    public ComplaintResponse reopenComplaint(Long id, ReopenRequest request, Long studentId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        if (!complaint.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You can only reopen complaints submitted by you");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Only complaints in RESOLVED status can be reopened");
        }

        User student = complaint.getStudent();
        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REOPENED);
        complaint.setReopenedCount(complaint.getReopenedCount() + 1);
        complaint = complaintRepository.save(complaint);

        // Record history
        ComplaintHistory history = new ComplaintHistory(
                complaint, student, oldStatus, ComplaintStatus.REOPENED,
                "Reopened by student: " + request.getReason()
        );
        historyRepository.save(history);

        // Notify assigned staff if present
        if (complaint.getAssignedStaff() != null) {
            notificationService.createNotification(
                    complaint.getAssignedStaff(),
                    "Complaint Reopened",
                    "Complaint #" + complaint.getReferenceNumber() + " has been reopened by student with reason: " + request.getReason(),
                    "COMPLAINT_REOPENED",
                    complaint
            );
        }

        return ComplaintResponse.fromEntity(complaint);
    }

    private void validateComplaintAccess(Complaint complaint, UserPrincipal principal) {
        if (principal.getRole() == Role.ADMIN) {
            return; // Admins have access to all complaints
        }
        if (principal.getRole() == Role.STUDENT) {
            if (!complaint.getStudent().getId().equals(principal.getId())) {
                throw new UnauthorizedException("You do not have permission to view this complaint");
            }
            return;
        }
        if (principal.getRole() == Role.STAFF) {
            boolean isAssigned = complaint.getAssignedStaff() != null && complaint.getAssignedStaff().getId().equals(principal.getId());
            boolean isSameDept = principal.getDepartmentId() != null && complaint.getDepartment().getId().equals(principal.getDepartmentId());
            if (!isAssigned && !isSameDept) {
                throw new UnauthorizedException("You do not have permission to view complaints outside your department");
            }
        }
    }
}
