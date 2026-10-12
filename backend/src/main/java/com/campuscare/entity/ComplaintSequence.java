package com.campuscare.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "complaint_sequences")
public class ComplaintSequence {

    @Id
    @Column(name = "sequence_year", nullable = false)
    private Integer sequenceYear;

    @Column(name = "current_value", nullable = false)
    private Long currentValue;

    public ComplaintSequence() {
    }

    public ComplaintSequence(Integer sequenceYear, Long currentValue) {
        this.sequenceYear = sequenceYear;
        this.currentValue = currentValue;
    }

    public Integer getSequenceYear() {
        return sequenceYear;
    }

    public void setSequenceYear(Integer sequenceYear) {
        this.sequenceYear = sequenceYear;
    }

    public Long getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Long currentValue) {
        this.currentValue = currentValue;
    }
}
