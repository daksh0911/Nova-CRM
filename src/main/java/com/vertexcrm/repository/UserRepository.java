package com.vertexcrm.repository;

import com.vertexcrm.model.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for User entity.
 * - findAll() = get all users
 * - save(user) = insert or update a user
 * - deleteById(id) = remove a user by their database ID
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}

