package com.vertexcrm.service;

import com.vertexcrm.dto.Requests.*;
import com.vertexcrm.model.Entities.Lead;
import com.vertexcrm.model.Entities.Client;
import com.vertexcrm.model.Entities.User;
import com.vertexcrm.model.Entities.Task;
import com.vertexcrm.model.Entities.Notification;
import com.vertexcrm.model.Entities.AuditLog;
import com.vertexcrm.model.Entities.DashboardMetrics;
import com.vertexcrm.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise Service Layer for Vertex CRM.
 * 
 * HOW IT WORKS:
 * - Every method here talks to the DATABASE through "Repository" objects
 * - When you call save() -> data is INSTANTLY written to the H2 database file
 * - When you call findAll() -> data is read FROM the database
 * - Data survives server restarts because it's stored in ./data/vertexcrm file
 */
@Service
public class CrmService {

    // These are the DATABASE connections - Spring auto-creates them from our Repository interfaces
    private final ClientRepository clientRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    // Counter for generating unique IDs
    private int nextLeadNumber = 10;
    private int nextTaskNumber = 5;

    // Constructor: Spring automatically injects all repositories
    public CrmService(ClientRepository clientRepository,
                      LeadRepository leadRepository,
                      UserRepository userRepository,
                      TaskRepository taskRepository,
                      NotificationRepository notificationRepository,
                      AuditLogRepository auditLogRepository) {
        this.clientRepository = clientRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // ==========================================================
    //  CLIENT OPERATIONS - Saved to "clients" table in database
    // ==========================================================

    /**
     * Get all clients, or filter by owner name.
     * If owner is null/blank/Admin -> returns ALL clients from database.
     */
    public List<Client> getClients(String owner) {
        if (owner == null || owner.isBlank() || "Admin User".equalsIgnoreCase(owner) || "all".equalsIgnoreCase(owner)) {
            return clientRepository.findAll();  // SELECT * FROM clients
        }
        return clientRepository.findByOwnerIgnoreCase(owner);  // SELECT * FROM clients WHERE owner = ?
    }

    /**
     * Add a new client -> INSTANTLY saved to database.
     */
    public Client addClient(CreateClientRequest req) {
        String id = "ACC-" + (1000 + (int) (Math.random() * 9000));
        String owner = (req.owner == null || req.owner.isBlank()) ? "Daksh Patel" : req.owner;
        String logoName = (req.name == null ? "company" : req.name.split(" ")[0].toLowerCase());

        Client client = new Client(
                id,
                req.name,
                (req.industry == null || req.industry.isBlank()) ? "General" : req.industry,
                req.email,
                "+1 (555) 234-5678",
                (req.location == null || req.location.isBlank()) ? "Remote" : req.location,
                owner,
                "Just Now",
                "Active",
                "https://logo.clearbit.com/" + logoName + ".com",
                "$100k ARR"
        );
        clientRepository.save(client);  // INSERT INTO clients (...) VALUES (...)
        logAction(owner, "registered corporate account '" + req.name + "'.", id, "🏢", "ACCOUNTS");
        return client;
    }

    public boolean deleteClient(String id) {
        if (clientRepository.existsById(id)) {
            clientRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ==========================================================
    //  LEAD / DEAL OPERATIONS - Saved to "leads" table
    // ==========================================================

    /**
     * Get all leads/deals, or filter by assigned sales rep.
     */
    public List<Lead> getLeads(String assigned) {
        if (assigned == null || assigned.isBlank() || "Admin User".equalsIgnoreCase(assigned) || "all".equalsIgnoreCase(assigned)) {
            return leadRepository.findAll();  // SELECT * FROM leads
        }
        return leadRepository.findByAssignedIgnoreCase(assigned);  // SELECT * FROM leads WHERE assigned = ?
    }

    /**
     * Add a new deal -> INSTANTLY saved to database.
     */
    public Lead addLead(CreateLeadRequest req) {
        String id = (req.id != null && !req.id.isBlank()) ? req.id : "lead-" + UUID.randomUUID().toString().substring(0, 8);
        String assigned = (req.assigned == null || req.assigned.isBlank()) ? "Daksh Patel" : req.assigned;
        String stage = (req.stage == null || req.stage.isBlank()) ? "Lead In" : req.stage;
        String priority = (req.priority == null || req.priority.isBlank()) ? "High" : req.priority;
        String nextStep = (req.nextStep == null || req.nextStep.isBlank()) ? "Initial architectural review and scoping" : req.nextStep;

        Lead lead = new Lead(
                id,
                req.name,
                (req.tag == null || req.tag.isBlank()) ? "Enterprise Tech" : req.tag,
                (req.contact == null || req.contact.isBlank()) ? "Executive Contact" : req.contact,
                (req.email == null || req.email.isBlank()) ? "contact@company.com" : req.email,
                (req.phone == null || req.phone.isBlank()) ? "+1 (555) 019-2831" : req.phone,
                assigned,
                "Q3 2026",
                30,
                req.value > 0 ? req.value : 50000.0,
                stage,
                nextStep,
                priority,
                "New"
        );
        leadRepository.save(lead);  // INSERT INTO leads (...) VALUES (...)
        logAction(assigned, "created deal '" + req.name + "' ($" + (int) req.value + ").", id, "➕", "PIPELINE");
        return lead;
    }

    public boolean deleteLead(String id) {
        if (leadRepository.existsById(id)) {
            leadRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Move a deal to a new stage (e.g., "Lead In" -> "Contacted" -> "Proposal Sent" -> "Closed Won")
     * Update is INSTANTLY saved to database.
     */
    public Lead updateLeadStage(String id, String newStage) {
        Optional<Lead> optionalLead = leadRepository.findById(id);  // SELECT * FROM leads WHERE id = ?
        if (optionalLead.isPresent()) {
            Lead lead = optionalLead.get();
            lead.setStage(newStage);
            if ("Closed Won".equalsIgnoreCase(newStage)) {
                lead.setProbability(100);
                lead.setStageAge("Won Today");
            } else if ("Proposal Sent".equalsIgnoreCase(newStage)) {
                lead.setProbability(Math.max(75, lead.getProbability()));
                lead.setStageAge("1d in stage");
            }
            leadRepository.save(lead);  // UPDATE leads SET stage = ?, probability = ? WHERE id = ?
            logAction(lead.getAssigned(), "advanced '" + lead.getName() + "' to " + newStage + ".", id, "⚡", "PIPELINE");
            return lead;
        }
        return null;
    }

    // ==========================================================
    //  USER OPERATIONS - Saved to "crm_users" table
    // ==========================================================

    /**
     * Get all CRM users from database.
     */
    public List<User> getUsers() {
        return userRepository.findAll();  // SELECT * FROM crm_users
    }

    /**
     * Add a new user -> INSTANTLY saved to database.
     */
    public User addUser(CreateUserRequest req) {
        User user = new User(
                req.name,
                req.email,
                (req.role == null || req.role.isBlank()) ? "Team Member" : req.role,
                (req.dept == null || req.dept.isBlank()) ? "Operations" : req.dept,
                0,
                0
        );
        userRepository.save(user);  // INSERT INTO crm_users (...) VALUES (...)
        logAction("Admin User", "granted workspace access to " + req.name + " (" + user.getRole() + ").", req.email, "🔑", "IDENTITY");
        return user;
    }

    /**
     * Delete a user by their database ID.
     */
    public boolean deleteUser(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);  // SELECT * FROM crm_users WHERE db_id = ?
        if (optionalUser.isPresent()) {
            User removed = optionalUser.get();
            userRepository.deleteById(id);  // DELETE FROM crm_users WHERE db_id = ?
            logAction("Admin User", "revoked access for " + removed.getName() + ".", removed.getEmail(), "🚫", "SECURITY");
            return true;
        }
        return false;
    }

    // ==========================================================
    //  TASK OPERATIONS - Saved to "tasks" table
    // ==========================================================

    /**
     * Get tasks, optionally filtered by assigned user.
     */
    public List<Task> getTasks(String user) {
        if (user == null || user.isBlank()) return taskRepository.findAll();
        return taskRepository.findByAssignedToIgnoreCase(user);
    }

    /**
     * Add a new task -> INSTANTLY saved to database.
     */
    public Task addTask(CreateTaskRequest req) {
        String id = "task-" + (nextTaskNumber++);
        Task task = new Task(
                id,
                req.title,
                (req.assignedTo == null || req.assignedTo.isBlank()) ? "Daksh Patel" : req.assignedTo,
                (req.priority == null || req.priority.isBlank()) ? "High" : req.priority,
                false
        );
        taskRepository.save(task);  // INSERT INTO tasks (...) VALUES (...)
        return task;
    }

    /**
     * Toggle task completion status -> saved to database.
     */
    public Task toggleTask(String id) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task t = optionalTask.get();
            t.setCompleted(!t.isCompleted());
            taskRepository.save(t);  // UPDATE tasks SET completed = ? WHERE id = ?
            return t;
        }
        return null;
    }

    // ==========================================================
    //  NOTIFICATION OPERATIONS - Saved to "notifications" table
    // ==========================================================

    public List<Notification> getNotifications(String user) {
        if (user == null || user.isBlank()) return notificationRepository.findAll();
        return notificationRepository.findByUserIgnoreCase(user);
    }

    @Transactional
    public void clearNotifications(String user) {
        if (user == null || user.isBlank()) {
            notificationRepository.deleteAll();  // DELETE FROM notifications
        } else {
            notificationRepository.deleteByUserIgnoreCase(user);  // DELETE FROM notifications WHERE username = ?
        }
    }

    // ==========================================================
    //  AUDIT LOG OPERATIONS - Saved to "audit_logs" table
    //  Every action in the CRM is recorded here permanently
    // ==========================================================

    public List<AuditLog> getAuditLogs() {
        List<AuditLog> allLogs = auditLogRepository.findAll();  // SELECT * FROM audit_logs
        // Sort newest first
        allLogs.sort((a, b) -> b.getId().compareTo(a.getId()));
        return allLogs;
    }

    /**
     * Record an action in the audit trail -> INSTANTLY saved to database.
     */
    public void logAction(String actor, String action, String target, String icon, String category) {
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
        String id = "log-" + UUID.randomUUID().toString().substring(0, 8);
        AuditLog log = new AuditLog(id, actor, action, target, icon, time, category);
        auditLogRepository.save(log);  // INSERT INTO audit_logs (...) VALUES (...)
    }

    // ==========================================================
    //  DASHBOARD METRICS - Calculated live from database data
    //  Not stored in any table - computed on every request
    // ==========================================================

    public DashboardMetrics getMetrics(String user) {
        List<Client> userClients = getClients(user);
        List<Lead> userLeads = getLeads(user);

        int activeClients = (int) userClients.stream().filter(c -> "Active".equalsIgnoreCase(c.getStatus())).count();
        double pipeline = userLeads.stream().mapToDouble(Lead::getValue).sum();
        List<Lead> won = userLeads.stream().filter(l -> "Closed Won".equalsIgnoreCase(l.getStage())).collect(Collectors.toList());
        double wonRev = won.stream().mapToDouble(Lead::getValue).sum();

        List<Lead> highConf = userLeads.stream().filter(l -> !"Closed Won".equalsIgnoreCase(l.getStage()) && l.getProbability() >= 70).collect(Collectors.toList());
        double forecast30d = highConf.stream().mapToDouble(Lead::getValue).sum();
        int winRate = userLeads.isEmpty() ? 0 : (int) Math.round(((double) won.size() / userLeads.size()) * 100);

        List<Lead> openDeals = userLeads.stream().filter(l -> !"Closed Won".equalsIgnoreCase(l.getStage())).collect(Collectors.toList());
        int velocity = openDeals.isEmpty() ? 0 : (int) Math.round(openDeals.stream().mapToInt(Lead::getProbability).average().orElse(0));

        return new DashboardMetrics(
                activeClients,
                userLeads.size(),
                pipeline,
                wonRev,
                won.size(),
                forecast30d,
                winRate,
                highConf.size(),
                velocity
        );
    }
}
