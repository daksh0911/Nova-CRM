package com.vertexcrm;

import com.vertexcrm.dto.Requests.*;
import com.vertexcrm.model.Entities.Lead;
import com.vertexcrm.model.Entities.Client;
import com.vertexcrm.model.Entities.User;
import com.vertexcrm.model.Entities.Task;
import com.vertexcrm.model.Entities.Notification;
import com.vertexcrm.model.Entities.AuditLog;
import com.vertexcrm.model.Entities.DashboardMetrics;
import com.vertexcrm.model.Entities.BaseEntity;
import com.vertexcrm.service.CrmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Spring Boot REST Controller for Vertex CRM.
 * Exposes endpoints for Accounts, Pipeline Deals, User Administration, Tasks, and Metrics.
 * 
 * Every POST/PUT/DELETE here saves data LIVE to the database.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CrmController {

    private final CrmService crmService;

    public CrmController(CrmService crmService) {
        this.crmService = crmService;
    }

    // ================= CLIENTS =================
    @GetMapping("/clients")
    public ResponseEntity<List<Client>> getClients(@RequestParam(required = false) String owner) {
        return ResponseEntity.ok(crmService.getClients(owner));
    }

    @PostMapping("/clients")
    public ResponseEntity<Client> addClient(@RequestBody CreateClientRequest req) {
        return ResponseEntity.ok(crmService.addClient(req));
    }

    @DeleteMapping("/clients/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable String id) {
        boolean deleted = crmService.deleteClient(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Client deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ================= LEADS / PIPELINE =================
    @GetMapping("/leads")
    public ResponseEntity<List<Lead>> getLeads(@RequestParam(required = false) String assigned) {
        return ResponseEntity.ok(crmService.getLeads(assigned));
    }

    @PostMapping("/leads")
    public ResponseEntity<Lead> addLead(@RequestBody CreateLeadRequest req) {
        return ResponseEntity.ok(crmService.addLead(req));
    }

    @PutMapping("/leads/{id}/stage")
    public ResponseEntity<?> updateLeadStage(@PathVariable String id, @RequestBody UpdateLeadStageRequest req) {
        Lead updated = crmService.updateLeadStage(id, req.stage);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<?> deleteLead(@PathVariable String id) {
        boolean deleted = crmService.deleteLead(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Lead deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ================= USERS =================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(crmService.getUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(crmService.addUser(req));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        boolean deleted = crmService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "User removed successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ================= TASKS =================
    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getTasks(@RequestParam(required = false) String user) {
        return ResponseEntity.ok(crmService.getTasks(user));
    }

    @PostMapping("/tasks")
    public ResponseEntity<Task> addTask(@RequestBody CreateTaskRequest req) {
        return ResponseEntity.ok(crmService.addTask(req));
    }

    @PutMapping("/tasks/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable String id) {
        Task toggled = crmService.toggleTask(id);
        if (toggled != null) {
            return ResponseEntity.ok(toggled);
        }
        return ResponseEntity.notFound().build();
    }

    // ================= NOTIFICATIONS =================
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam(required = false) String user) {
        return ResponseEntity.ok(crmService.getNotifications(user));
    }

    @DeleteMapping("/notifications")
    public ResponseEntity<?> clearNotifications(@RequestParam(required = false) String user) {
        crmService.clearNotifications(user);
        return ResponseEntity.ok(Map.of("message", "Notifications cleared"));
    }

    // ================= AUDIT LOGS =================
    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getLogs() {
        return ResponseEntity.ok(crmService.getAuditLogs());
    }

    // ================= DASHBOARD & METRICS =================
    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardMetrics> getSummary(@RequestParam(required = false) String user) {
        return ResponseEntity.ok(crmService.getMetrics(user));
    }

    // ================= HEALTH CHECK =================
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "system", "Vertex CRM Enterprise Java Engine",
                "version", "1.0.0",
                "database", "H2 (File-Based, Live Persistence)",
                "clusterNode", "IN-AHM-01",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
