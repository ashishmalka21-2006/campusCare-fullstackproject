package com.campuscare.service;

import com.campuscare.entity.ComplaintSequence;
import com.campuscare.repository.ComplaintSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Service
public class ReferenceNumberGenerator {

    private final ComplaintSequenceRepository sequenceRepository;

    public ReferenceNumberGenerator(ComplaintSequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized String generateNextReferenceNumber() {
        int currentYear = Year.now().getValue();

        ComplaintSequence sequence = sequenceRepository.findBySequenceYearForUpdate(currentYear)
                .orElseGet(() -> {
                    ComplaintSequence newSeq = new ComplaintSequence(currentYear, 0L);
                    return sequenceRepository.saveAndFlush(newSeq);
                });

        long nextVal = sequence.getCurrentValue() + 1;
        sequence.setCurrentValue(nextVal);
        sequenceRepository.saveAndFlush(sequence);

        return String.format("CC-%d-%06d", currentYear, nextVal);
    }
}
