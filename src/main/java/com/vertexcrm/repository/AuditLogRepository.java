package com.vertexcrm.repository;

import com.vertexcrm.model.Entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for AuditLog entity.
 * - findAll() = get all audit logs
 * - save(log) = insert an audit log entry
 * - findByCategoryIgnoreCase("PIPELINE") = filter logs by category
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    // Find logs by category (e.g., PIPELINE, SECURITY, ACCOUNTS)
    List<AuditLog> findByCategoryIgnoreCase(String category);
}

