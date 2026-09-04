package com.vertexcrm.repository;

import com.vertexcrm.model.Entities.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Lead/Deal entity.
 * - findAll() = get all deals
 * - save(lead) = insert or update a deal
 * - findByAssignedIgnoreCase("Sarah") = get deals assigned to "Sarah"
 */
@Repository
public interface LeadRepository extends JpaRepository<Lead, String> {

    // Find all leads assigned to a specific sales rep (case-insensitive)
    List<Lead> findByAssignedIgnoreCase(String assigned);
}

