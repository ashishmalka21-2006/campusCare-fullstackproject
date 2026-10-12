package com.campuscare.config;

import com.campuscare.entity.*;
import com.campuscare.repository.*;
import com.campuscare.service.ReferenceNumberGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintHistoryRepository historyRepository;
    private final ComplaintAssignmentRepository assignmentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReferenceNumberGenerator referenceNumberGenerator;

    public DataInitializer(DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           ComplaintRepository complaintRepository,
                           ComplaintHistoryRepository historyRepository,
                           ComplaintAssignmentRepository assignmentRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder,
                           ReferenceNumberGenerator referenceNumberGenerator) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.referenceNumberGenerator = referenceNumberGenerator;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data population.");
            return;
        }

        logger.info("Initializing CampusCare seed data...");

        // 1. Create Default Departments
        Department itDept = departmentRepository.save(new Department(null, "IT Support", "ITS", "Campus networks, computers, smart classrooms, Wi-Fi, audio/visual equipment", "it.support@campuscare.edu", true));
        Department hostelDept = departmentRepository.save(new Department(null, "Hostel", "HST", "Student hostels, rooms, water supply, washrooms, and hostel facilities", "hostel.warden@campuscare.edu", true));
        Department maintDept = departmentRepository.save(new Department(null, "Maintenance", "MNT", "Campus electrical, plumbing, civil infrastructure, air conditioning, and carpentry", "maintenance@campuscare.edu", true));
        Department libraryDept = departmentRepository.save(new Department(null, "Library", "LIB", "Central library, reading rooms, digital reference systems, books", "library@campuscare.edu", true));
        Department adminDept = departmentRepository.save(new Department(null, "Administration", "ADM", "Student affairs, transport, billing, campus security, and cafeteria", "admin.office@campuscare.edu", true));

        // 2. Create Users
        User admin = new User(null, "Dr. Rajesh Sharma", "admin@campuscare.edu", passwordEncoder.encode("Admin@123"), Role.ADMIN, "ADM-001", "+91 9876543210", adminDept, true);
        admin = userRepository.save(admin);

        User itStaff = new User(null, "Vikram Patel", "staff.it@campuscare.edu", passwordEncoder.encode("Staff@123"), Role.STAFF, "EMP-IT-101", "+91 9876543211", itDept, true);
        itStaff = userRepository.save(itStaff);

        User hostelStaff = new User(null, "Suresh Kumar", "staff.hostel@campuscare.edu", passwordEncoder.encode("Staff@123"), Role.STAFF, "EMP-HST-102", "+91 9876543212", hostelDept, true);
        hostelStaff = userRepository.save(hostelStaff);

        User maintStaff = new User(null, "Ramesh Rao", "staff.maint@campuscare.edu", passwordEncoder.encode("Staff@123"), Role.STAFF, "EMP-MNT-103", "+91 9876543213", maintDept, true);
        maintStaff = userRepository.save(maintStaff);

        User student1 = new User(null, "Aarav Gupta", "student1@campuscare.edu", passwordEncoder.encode("Student@123"), Role.STUDENT, "CS202401", "+91 9876543214", null, true);
        student1 = userRepository.save(student1);

        User student2 = new User(null, "Ananya Singh", "student2@campuscare.edu", passwordEncoder.encode("Student@123"), Role.STUDENT, "CS202402", "+91 9876543215", null, true);
        student2 = userRepository.save(student2);

        // 3. Seed Realistic Complaints
        // Complaint 1: Wi-Fi Issue (Assigned to IT Staff)
        Complaint c1 = new Complaint();
        c1.setReferenceNumber(referenceNumberGenerator.generateNextReferenceNumber());
        c1.setTitle("College Wi-Fi Not Working in CSE Lab 3");
        c1.setDescription("Students are unable to connect to the campus Wi-Fi access point in CSE Lab 3. The SSID appears, but authentication consistently times out during lab hours.");
        c1.setCategory("Network & Internet");
        c1.setLocation("Computer Science Block, 2nd Floor, Lab 3");
        c1.setPriority(Priority.HIGH);
        c1.setStatus(ComplaintStatus.IN_PROGRESS);
        c1.setStudent(student1);
        c1.setDepartment(itDept);
        c1.setAssignedStaff(itStaff);
        c1 = complaintRepository.save(c1);

        historyRepository.save(new ComplaintHistory(c1, student1, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student"));
        historyRepository.save(new ComplaintHistory(c1, admin, ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, "Assigned to Vikram Patel (IT Support)"));
        historyRepository.save(new ComplaintHistory(c1, itStaff, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, "Diagnosing switch port configuration in CSE server room"));
        assignmentRepository.save(new ComplaintAssignment(c1, admin, itStaff, "Please inspect router AP-CSE-03 on priority"));

        // Complaint 2: Classroom Projector (Resolved)
        Complaint c2 = new Complaint();
        c2.setReferenceNumber(referenceNumberGenerator.generateNextReferenceNumber());
        c2.setTitle("Classroom Projector Not Functioning in Lecture Hall 2");
        c2.setDescription("The EPSON ceiling projector in LH-2 has a blinking orange lamp error and does not project HDMI video input from the instructor podium.");
        c2.setCategory("Audio / Visual");
        c2.setLocation("Academic Block A, 1st Floor, LH-2");
        c2.setPriority(Priority.MEDIUM);
        c2.setStatus(ComplaintStatus.RESOLVED);
        c2.setStudent(student1);
        c2.setDepartment(itDept);
        c2.setAssignedStaff(itStaff);
        c2.setResolutionNotes("Replaced the projector bulb and verified HDMI signal display with teaching staff.");
        c2.setResolvedAt(LocalDateTime.now().minusDays(1));
        c2 = complaintRepository.save(c2);

        historyRepository.save(new ComplaintHistory(c2, student1, null, ComplaintStatus.SUBMITTED, "Complaint submitted"));
        historyRepository.save(new ComplaintHistory(c2, admin, ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, "Assigned to Vikram Patel"));
        historyRepository.save(new ComplaintHistory(c2, itStaff, ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS, "Inspecting projector lamp and cabling"));
        historyRepository.save(new ComplaintHistory(c2, itStaff, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, "Replaced projector lamp. Tested and confirmed operational."));

        // Complaint 3: Hostel Water Supply (Assigned)
        Complaint c3 = new Complaint();
        c3.setReferenceNumber(referenceNumberGenerator.generateNextReferenceNumber());
        c3.setTitle("Hostel Block B 3rd Floor Water Supply Problem");
        c3.setDescription("Low water pressure and intermittent water supply on the 3rd floor west wing washrooms since yesterday evening.");
        c3.setCategory("Water Supply & Plumbing");
        c3.setLocation("Boys Hostel Block B, 3rd Floor, West Wing");
        c3.setPriority(Priority.URGENT);
        c3.setStatus(ComplaintStatus.ASSIGNED);
        c3.setStudent(student2);
        c3.setDepartment(hostelDept);
        c3.setAssignedStaff(hostelStaff);
        c3 = complaintRepository.save(c3);

        historyRepository.save(new ComplaintHistory(c3, student2, null, ComplaintStatus.SUBMITTED, "Complaint submitted"));
        historyRepository.save(new ComplaintHistory(c3, admin, ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED, "Assigned to Suresh Kumar for plumbing inspection"));
        assignmentRepository.save(new ComplaintAssignment(c3, admin, hostelStaff, "Check booster pump for Block B overhead tank"));

        // Complaint 4: Library Reading Room AC (Submitted)
        Complaint c4 = new Complaint();
        c4.setReferenceNumber(referenceNumberGenerator.generateNextReferenceNumber());
        c4.setTitle("Library 2nd Floor Reading Room AC Not Cooling");
        c4.setDescription("Air conditioner unit #2 in the quiet study zone is making a rattling noise and blowing room-temperature air.");
        c4.setCategory("HVAC & Cooling");
        c4.setLocation("Central Library, 2nd Floor, Quiet Reading Zone");
        c4.setPriority(Priority.LOW);
        c4.setStatus(ComplaintStatus.SUBMITTED);
        c4.setStudent(student2);
        c4.setDepartment(libraryDept);
        c4 = complaintRepository.save(c4);

        historyRepository.save(new ComplaintHistory(c4, student2, null, ComplaintStatus.SUBMITTED, "Complaint submitted by student"));

        // 4. Create Initial Notifications
        notificationRepository.save(new Notification(student1, "Complaint Assigned", "Your complaint #" + c1.getReferenceNumber() + " has been assigned to Vikram Patel", "COMPLAINT_ASSIGNED", c1));
        notificationRepository.save(new Notification(student1, "Complaint Resolved", "Your complaint #" + c2.getReferenceNumber() + " has been marked as RESOLVED", "RESOLVED", c2));
        notificationRepository.save(new Notification(student2, "Complaint Registered", "Your complaint #" + c3.getReferenceNumber() + " has been submitted successfully", "COMPLAINT_SUBMITTED", c3));
        notificationRepository.save(new Notification(itStaff, "New Complaint Assigned", "You have been assigned complaint #" + c1.getReferenceNumber() + ": College Wi-Fi Not Working", "COMPLAINT_ASSIGNED", c1));

        logger.info("CampusCare seed data initialized successfully!");
    }
}
