package com.vertexcrm.repository;

import com.vertexcrm.model.Entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for Notification entity.
 * - findAll() = get all notifications
 * - save(notification) = insert a notification
 * - findByUserIgnoreCase("Daksh") = get notifications for "Daksh"
 * - deleteByUserIgnoreCase("Daksh") = clear notifications for "Daksh"
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    // Find notifications for a specific user
    List<Notification> findByUserIgnoreCase(String user);

    // Delete all notifications for a specific user
    void deleteByUserIgnoreCase(String user);
}

