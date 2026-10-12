package com.campuscare.service;

import com.campuscare.dto.complaint.CreateComplaintRequest;
import com.campuscare.dto.complaint.ComplaintResponse;
import com.campuscare.dto.complaint.ReopenRequest;
import com.campuscare.dto.complaint.UpdateStatusRequest;
import com.campuscare.entity.*;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.UnauthorizedException;
import com.campuscare.repository.ComplaintHistoryRepository;
import com.campuscare.repository.ComplaintRepository;
import com.campuscare.repository.DepartmentRepository;
import com.campuscare.repository.UserRepository;
import com.campuscare.security.UserPrincipal;
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
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ComplaintHistoryRepository historyRepository;

    @Mock
    private ReferenceNumberGenerator referenceNumberGenerator;

    @Mock
    private NotificationService notificationService;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ComplaintService complaintService;

    private User student;
    private Department department;
    private Complaint complaint;

    @BeforeEach
    void setUp() {
        department = new Department(1L, "IT Support", "ITS", "IT desc", "it@college.edu", true);

        student = new User();
        student.setId(10L);
        student.setFullName("Student One");
        student.setEmail("s1@college.edu");
        student.setRole(Role.STUDENT);
        student.setActive(true);

        complaint = new Complaint();
        complaint.setId(100L);
        complaint.setReferenceNumber("CC-2026-000001");
        complaint.setTitle("Wi-Fi down");
        complaint.setDescription("Cannot connect to Wi-Fi");
        complaint.setCategory("Internet");
        complaint.setLocation("Lab 2");
        complaint.setPriority(Priority.HIGH);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setStudent(student);
        complaint.setDepartment(department);
    }

    @Test
    void testCreateComplaint_Success() {
        CreateComplaintRequest request = new CreateComplaintRequest();
        request.setTitle("Wi-Fi down");
        request.setDescription("Cannot connect to Wi-Fi");
        request.setDepartmentId(1L);
        request.setCategory("Internet");
        request.setLocation("Lab 2");
        request.setPriority(Priority.HIGH);

        when(userRepository.findById(10L)).thenReturn(Optional.of(student));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(referenceNumberGenerator.generateNextReferenceNumber()).thenReturn("CC-2026-000001");
        when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

        ComplaintResponse response = complaintService.createComplaint(request, null, 10L);

        assertNotNull(response);
        assertEquals("CC-2026-000001", response.getReferenceNumber());
        assertEquals(ComplaintStatus.SUBMITTED, response.getStatus());
        verify(historyRepository).save(any(ComplaintHistory.class));
    }

    @Test
    void testReopenComplaint_Success() {
        complaint.setStatus(ComplaintStatus.RESOLVED);
        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

        ReopenRequest request = new ReopenRequest();
        request.setReason("Problem is still occurring today");

        ComplaintResponse response = complaintService.reopenComplaint(100L, request, 10L);

        assertNotNull(response);
        assertEquals(ComplaintStatus.REOPENED, response.getStatus());
        assertEquals(1, complaint.getReopenedCount());
    }

    @Test
    void testReopenComplaint_NotAuthor_ThrowsUnauthorized() {
        complaint.setStatus(ComplaintStatus.RESOLVED);
        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));

        ReopenRequest request = new ReopenRequest();
        request.setReason("Problem still happening");

        // Another student (id 99L) tries to reopen
        assertThrows(UnauthorizedException.class, () -> complaintService.reopenComplaint(100L, request, 99L));
    }

    @Test
    void testReopenComplaint_NotResolved_ThrowsBadRequest() {
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        when(complaintRepository.findById(100L)).thenReturn(Optional.of(complaint));

        ReopenRequest request = new ReopenRequest();
        request.setReason("Problem still happening");

        assertThrows(BadRequestException.class, () -> complaintService.reopenComplaint(100L, request, 10L));
    }
}
