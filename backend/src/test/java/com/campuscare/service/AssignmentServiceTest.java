package com.campuscare.service;

import com.campuscare.dto.complaint.AssignComplaintRequest;
import com.campuscare.dto.complaint.ComplaintResponse;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.repository.ComplaintAssignmentRepository;
import com.campuscare.repository.ComplaintHistoryRepository;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ComplaintAssignmentRepository assignmentRepository;

    @Mock
    private ComplaintHistoryRepository historyRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AssignmentService assignmentService;

    private Complaint complaint;
    private User admin;
    private User staff;
    private Department itDept;
    private Department hostelDept;

    @BeforeEach
    void setUp() {
        itDept = new Department(1L, "IT Support", "ITS", "IT", "it@college.edu", true);
        hostelDept = new Department(2L, "Hostel", "HST", "Hostel", "hostel@college.edu", true);

        User student = new User();
        student.setId(5L);
        student.setFullName("Student");

        admin = new User();
        admin.setId(1L);
        admin.setFullName("Admin User");
        admin.setRole(Role.ADMIN);

        staff = new User();
        staff.setId(2L);
        staff.setFullName("IT Staff");
        staff.setRole(Role.STAFF);
        staff.setDepartment(itDept);
        staff.setActive(true);

        complaint = new Complaint();
        complaint.setId(10L);
        complaint.setReferenceNumber("CC-2026-000001");
        complaint.setTitle("Wi-Fi Broken");
        complaint.setDepartment(itDept);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setStudent(student);
    }

    @Test
    void testAssignComplaint_Success() {
        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staff));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

        AssignComplaintRequest request = new AssignComplaintRequest(2L, "Please fix ASAP");

        ComplaintResponse response = assignmentService.assignComplaint(10L, request, 1L);

        assertNotNull(response);
        assertEquals(staff, complaint.getAssignedStaff());
        assertEquals(ComplaintStatus.ASSIGNED, complaint.getStatus());
        verify(assignmentRepository).save(any(ComplaintAssignment.class));
        verify(historyRepository).save(any(ComplaintHistory.class));
    }

    @Test
    void testAssignComplaint_DepartmentMismatch_ThrowsBadRequest() {
        // Staff belongs to hostelDept, but complaint is in itDept
        staff.setDepartment(hostelDept);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staff));

        AssignComplaintRequest request = new AssignComplaintRequest(2L, "Please fix");

        assertThrows(BadRequestException.class, () -> assignmentService.assignComplaint(10L, request, 1L));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void testAssignComplaint_NotStaffRole_ThrowsBadRequest() {
        staff.setRole(Role.STUDENT);

        when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(staff));

        AssignComplaintRequest request = new AssignComplaintRequest(2L, "Please fix");

        assertThrows(BadRequestException.class, () -> assignmentService.assignComplaint(10L, request, 1L));
    }
}
