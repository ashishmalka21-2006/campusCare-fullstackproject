package com.campuscare.repository;

import com.campuscare.entity.Complaint;
import com.campuscare.entity.ComplaintStatus;
import com.campuscare.entity.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("SELECT c FROM Complaint c WHERE c.student.id = :studentId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:startDate IS NULL OR c.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR c.createdAt <= :endDate) " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> findStudentComplaints(@Param("studentId") Long studentId,
                                          @Param("status") ComplaintStatus status,
                                          @Param("category") String category,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate,
                                          @Param("search") String search,
                                          Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.assignedStaff.id = :staffId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:priority IS NULL OR c.priority = :priority) " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> findStaffComplaints(@Param("staffId") Long staffId,
                                        @Param("status") ComplaintStatus status,
                                        @Param("priority") Priority priority,
                                        @Param("search") String search,
                                        Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:deptId IS NULL OR c.department.id = :deptId) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:priority IS NULL OR c.priority = :priority) " +
           "AND (:startDate IS NULL OR c.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR c.createdAt <= :endDate) " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> findAllWithFilters(@Param("deptId") Long deptId,
                                       @Param("status") ComplaintStatus status,
                                       @Param("priority") Priority priority,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       @Param("search") String search,
                                       Pageable pageable);

    long countByStatus(ComplaintStatus status);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, ComplaintStatus status);

    long countByAssignedStaffId(Long staffId);

    long countByAssignedStaffIdAndStatus(Long staffId, ComplaintStatus status);

    @Query("SELECT c.department.name, COUNT(c) FROM Complaint c GROUP BY c.department.name")
    List<Object[]> countComplaintsByDepartment();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countComplaintsByPriority();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countComplaintsByStatus();

    @Query("SELECT FUNCTION('DATE_FORMAT', c.createdAt, '%Y-%m') as m, COUNT(c) FROM Complaint c GROUP BY m ORDER BY m DESC")
    List<Object[]> countComplaintsByMonth();
}
