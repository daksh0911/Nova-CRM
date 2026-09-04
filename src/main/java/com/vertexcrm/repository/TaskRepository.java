package com.vertexcrm.repository;

import com.vertexcrm.model.Entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Task entity.
 * - findAll() = get all tasks
 * - save(task) = insert or update a task
 * - findByAssignedToIgnoreCase("Daksh") = get tasks assigned to "Daksh"
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    // Find tasks assigned to a specific user (case-insensitive)
    List<Task> findByAssignedToIgnoreCase(String assignedTo);
}

