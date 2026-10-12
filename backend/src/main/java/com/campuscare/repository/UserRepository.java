package com.campuscare.repository;

import com.campuscare.entity.Role;
import com.campuscare.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRoleAndActiveTrue(Role role);
    List<User> findByDepartmentIdAndRoleAndActiveTrue(Long departmentId, Role role);

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:deptId IS NULL OR u.department.id = :deptId) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsers(@Param("role") Role role,
                           @Param("deptId") Long deptId,
                           @Param("search") String search,
                           Pageable pageable);

    long countByRole(Role role);
    long countByActiveTrue();
}
