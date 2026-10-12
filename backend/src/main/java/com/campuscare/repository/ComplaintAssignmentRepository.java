package com.campuscare.repository;

import com.campuscare.entity.ComplaintAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintIdOrderByAssignedAtDesc(Long complaintId);
    List<ComplaintAssignment> findByAssignedToId(Long staffId);
}
