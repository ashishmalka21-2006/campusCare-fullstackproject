package com.campuscare.service;

import com.campuscare.dto.department.DepartmentRequest;
import com.campuscare.dto.department.DepartmentResponse;
import com.campuscare.entity.Department;
import com.campuscare.exception.BadRequestException;
import com.campuscare.exception.ResourceNotFoundException;
import com.campuscare.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(DepartmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(DepartmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return DepartmentResponse.fromEntity(dept);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Department with name '" + request.getName() + "' already exists");
        }
        if (departmentRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Department with code '" + request.getCode() + "' already exists");
        }

        Department dept = new Department();
        dept.setName(request.getName().trim());
        dept.setCode(request.getCode().trim().toUpperCase());
        dept.setDescription(request.getDescription());
        dept.setContactEmail(request.getContactEmail());
        dept.setActive(request.getActive() != null ? request.getActive() : true);

        dept = departmentRepository.save(dept);
        return DepartmentResponse.fromEntity(dept);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!dept.getName().equalsIgnoreCase(request.getName()) &&
                departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Department with name '" + request.getName() + "' already exists");
        }
        if (!dept.getCode().equalsIgnoreCase(request.getCode()) &&
                departmentRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Department with code '" + request.getCode() + "' already exists");
        }

        dept.setName(request.getName().trim());
        dept.setCode(request.getCode().trim().toUpperCase());
        dept.setDescription(request.getDescription());
        dept.setContactEmail(request.getContactEmail());
        if (request.getActive() != null) {
            dept.setActive(request.getActive());
        }

        dept = departmentRepository.save(dept);
        return DepartmentResponse.fromEntity(dept);
    }
}
