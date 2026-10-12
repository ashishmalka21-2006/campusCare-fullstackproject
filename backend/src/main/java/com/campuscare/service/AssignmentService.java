package com.campuscare.service;

import com.campuscare.dto.complaint.AssignComplaintRequest;
import com.campuscare.dto.complaint.ComplaintAssignmentResponse;
import com.campuscare.dto.complaint.ComplaintResponse;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.repository.ComplaintAssignmentRepository;
import com.campuscare.repository.ComplaintHistoryRepository;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final NotificationService notificationService;

    public AssignmentService(ComplaintRepository complaintRepository,
                             UserRepository userRepository,
                             ComplaintAssignmentRepository assignmentRepository,
                             ComplaintHistoryRepository historyRepository,
                             NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.historyRepository = historyRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long complaintId, AssignComplaintRequest request, Long adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with id: " + adminId));

        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with id: " + request.getStaffId()));

        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("Complaints can only be assigned to users with the STAFF role");
        }

        if (!staff.isActive()) {
            throw new BadRequestException("Cannot assign complaint to an inactive staff member");
        }

        // Validate department matching
        if (staff.getDepartment() == null || !staff.getDepartment().getId().equals(complaint.getDepartment().getId())) {
            throw new BadRequestException("Staff member must belong to the complaint's department (" + complaint.getDepartment().getName() + ")");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedStaff(staff);
        if (complaint.getStatus() == ComplaintStatus.SUBMITTED || complaint.getStatus() == ComplaintStatus.REOPENED) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
        }

        complaint = complaintRepository.save(complaint);

        // Record Assignment History
        ComplaintAssignment assignment = new ComplaintAssignment(
                complaint, admin, staff, request.getRemarks()
        );
        assignmentRepository.save(assignment);

        // Record Status History if status changed
        if (oldStatus != complaint.getStatus()) {
            ComplaintHistory history = new ComplaintHistory(
                    complaint, admin, oldStatus, complaint.getStatus(),
                    "Assigned to " + staff.getFullName() + (request.getRemarks() != null ? ": " + request.getRemarks() : "")
            );
            historyRepository.save(history);
        }

        // Notify Staff Member
        notificationService.createNotification(
                staff,
                "New Complaint Assigned",
                "You have been assigned complaint #" + complaint.getReferenceNumber() + ": " + complaint.getTitle(),
                "COMPLAINT_ASSIGNED",
                complaint
        );

        // Notify Student
        notificationService.createNotification(
                complaint.getStudent(),
                "Complaint Assigned",
                "Your complaint #" + complaint.getReferenceNumber() + " has been assigned to staff member " + staff.getFullName(),
                "COMPLAINT_ASSIGNED",
                complaint
        );

        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintAssignmentResponse> getAssignmentsForComplaint(Long complaintId) {
        return assignmentRepository.findByComplaintIdOrderByAssignedAtDesc(complaintId)
                .stream()
                .map(ComplaintAssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
