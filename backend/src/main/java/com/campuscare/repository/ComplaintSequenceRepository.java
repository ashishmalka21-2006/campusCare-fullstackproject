package com.campuscare.repository;

import com.campuscare.entity.ComplaintSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintSequenceRepository extends JpaRepository<ComplaintSequence, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ComplaintSequence s WHERE s.sequenceYear = :year")
    Optional<ComplaintSequence> findBySequenceYearForUpdate(@Param("year") Integer year);
}
