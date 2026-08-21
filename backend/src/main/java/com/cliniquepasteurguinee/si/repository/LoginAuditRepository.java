package com.cliniquepasteurguinee.si.repository;

import com.cliniquepasteurguinee.si.domain.LoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAuditRepository extends JpaRepository<LoginAudit, Long> {
}
