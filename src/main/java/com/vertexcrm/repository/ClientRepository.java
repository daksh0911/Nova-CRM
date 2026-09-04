package com.vertexcrm.repository;

import com.vertexcrm.model.Entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Client entity.
 * Spring automatically creates the database queries for you!
 * - findAll() = get all clients
 * - save(client) = insert or update a client
 * - findByOwnerIgnoreCase("Daksh") = get clients owned by "Daksh" (case-insensitive)
 */
@Repository
public interface ClientRepository extends JpaRepository<Client, String> {

    // Find all clients belonging to a specific owner (case-insensitive match)
    List<Client> findByOwnerIgnoreCase(String owner);
}

