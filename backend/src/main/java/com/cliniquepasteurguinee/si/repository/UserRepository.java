package com.cliniquepasteurguinee.si.repository;

import com.cliniquepasteurguinee.si.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("select case when count(u) > 0 then true else false end from User u join u.roles r " +
            "where r.name = 'SUPER_ADMIN' and u.enabled = true")
    boolean existsEnabledSuperAdmin();

    @Query("select count(u) from User u join u.roles r where r.name = 'SUPER_ADMIN' and u.enabled = true")
    long countEnabledSuperAdmins();
}
