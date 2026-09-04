package com.vertexcrm;

import com.vertexcrm.model.Entities.*;
import com.vertexcrm.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DATA SEEDER - Loads demo data into the database on first startup.
 * 
 * HOW IT WORKS:
 * - This runs automatically when the Spring Boot app starts
 * - It checks if the database is EMPTY (first run)
 * - If empty, it inserts all the demo clients, leads, users, tasks, notifications
 * - On subsequent restarts, it does NOTHING (your real data is preserved)
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ClientRepository clientRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    public DataSeeder(ClientRepository clientRepository,
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

    @Override
    public void run(String... args) {
        // Only seed if the database is empty (first run)
        if (userRepository.count() > 0) {
            System.out.println("[DataSeeder] Database already has data. Skipping seed.");
            return;
        }

        System.out.println("[DataSeeder] First run detected! Seeding demo data into database...");

        seedUsers();
        seedClients();
        seedLeads();
        seedTasks();
        seedNotifications();
        seedAuditLogs();

        System.out.println("[DataSeeder] ✅ Demo data loaded successfully!");
        System.out.println("[DataSeeder] 📊 Users: " + userRepository.count());
        System.out.println("[DataSeeder] 🏢 Clients: " + clientRepository.count());
        System.out.println("[DataSeeder] 💼 Leads/Deals: " + leadRepository.count());
        System.out.println("[DataSeeder] ✅ Tasks: " + taskRepository.count());
        System.out.println("[DataSeeder] 🔔 Notifications: " + notificationRepository.count());
        System.out.println("[DataSeeder] 📋 Audit Logs: " + auditLogRepository.count());
    }

    private void seedUsers() {
        userRepository.save(new User("Admin User", "admin@vertex.com", "System Administrator", "Operations", 1, 1));
        userRepository.save(new User("Sarah Sales", "s.sales@vertex.com", "Enterprise Sales Rep", "Revenue", 3, 3));
        userRepository.save(new User("Daksh Patel", "daksh@vertex.com", "Senior Account Manager", "Client Growth", 4, 5));
    }

    private void seedClients() {
        clientRepository.save(new Client("ACC-1045", "TechCorp Solutions", "Software", "contact@techcorp.com", "+1 (555) 123-4567", "New York, NY", "Daksh Patel", "Aug 14, 2026", "Active", "https://logo.clearbit.com/techcorp.com", "$120k ARR"));
        clientRepository.save(new Client("ACC-1046", "Globalize Inc.", "Logistics", "info@globalize.net", "+1 (555) 987-6543", "London, UK", "Sarah Sales", "Aug 12, 2026", "Active", "https://logo.clearbit.com/dhl.com", "$85k ARR"));
        clientRepository.save(new Client("ACC-1047", "Quantum Dynamics", "Engineering", "s.jenkins@quantum.io", "+1 (555) 456-7890", "Austin, TX", "Daksh Patel", "Aug 13, 2026", "Active", "https://logo.clearbit.com/qualcomm.com", "$450k ARR"));
        clientRepository.save(new Client("ACC-1048", "Meridian Healthcare", "Healthcare", "admin@meridian.org", "+1 (555) 333-2222", "Chicago, IL", "Sarah Sales", "Aug 10, 2026", "Active", "https://logo.clearbit.com/mayoclinic.org", "$320k ARR"));
        clientRepository.save(new Client("ACC-1049", "LJ Education Trust", "Education", "admin@ljpoly.edu", "+91 98765 43210", "Ahmedabad, India", "Daksh Patel", "Aug 14, 2026", "Onboarding", "https://logo.clearbit.com/harvard.edu", "$110k ARR"));
        clientRepository.save(new Client("ACC-1050", "Royal Challengers Sports", "Entertainment", "partnerships@rcb.in", "+91 99887 77665", "Bengaluru, India", "Daksh Patel", "Aug 12, 2026", "Active", "https://logo.clearbit.com/rcb.royalchallengers.com", "$850k ARR"));
        clientRepository.save(new Client("ACC-1051", "Nirman Educational Group", "Education", "admin@nirman.edu", "+91 88776 55443", "Ahmedabad, India", "Admin User", "Aug 05, 2026", "Inactive", "https://logo.clearbit.com/stanford.edu", "$42k ARR"));
        clientRepository.save(new Client("ACC-1052", "Apex Corp", "Retail", "vendor@apex.com", "+1 (555) 000-1111", "Seattle, WA", "Sarah Sales", "Aug 01, 2026", "Churned", "https://logo.clearbit.com/target.com", "$0 ARR"));
    }

    private void seedLeads() {
        leadRepository.save(new Lead("lead-1", "TechCorp Solutions", "Software", "John Doe (CTO)", "john@techcorp.com", "+1 (555) 123-4567", "Daksh Patel", "Aug 30, 2026", 25, 50000.0, "Lead In", "Initial architectural review", "Medium", "4d in stage"));
        leadRepository.save(new Lead("lead-2", "Globalize Inc.", "Logistics", "Emma Stone (VP Ops)", "e.stone@globalize.net", "+1 (555) 987-6543", "Sarah Sales", "Sep 12, 2026", 35, 85000.0, "Lead In", "Product demo with EU director", "Medium", "2d in stage"));
        leadRepository.save(new Lead("lead-8", "Nirman Educational", "Education", "Dr. V. K. Patel (Dean)", "principal@nirman.edu", "+91 88776 55443", "Daksh Patel", "Oct 01, 2026", 20, 110000.0, "Lead In", "Campus ERP security scoping", "High", "6d in stage"));
        leadRepository.save(new Lead("lead-5", "Alpha Industries", "Manufacturing", "Robert King (Director)", "rking@alphaind.com", "+1 (555) 777-8899", "Admin User", "Sep 20, 2026", 15, 42500.0, "Lead In", "Enterprise license agreement", "Low", "8d in stage"));
        leadRepository.save(new Lead("lead-3", "NexaLogistics", "Supply Chain", "Marcus Chen (Head Supply)", "m.chen@nexalog.com", "+1 (555) 345-6789", "Daksh Patel", "Aug 22, 2026", 55, 125000.0, "Contacted", "Send custom integration specs", "High", "3d in stage"));
        leadRepository.save(new Lead("lead-6", "Zenith Financial", "Finance & Banking", "Amanda Roberts (VP Risk)", "aroberts@zenithfin.com", "+1 (555) 654-3210", "Sarah Sales", "Aug 28, 2026", 60, 210000.0, "Contacted", "Security & compliance sign-off", "High", "5d in stage"));
        leadRepository.save(new Lead("lead-4", "Quantum Dynamics", "DeepTech AI", "Sarah Jenkins (CPO)", "sjenkins@quantum.io", "+1 (555) 456-7890", "Daksh Patel", "Aug 25, 2026", 85, 450000.0, "Proposal Sent", "Final pricing committee review", "Urgent", "2d in stage"));
        leadRepository.save(new Lead("lead-9", "Royal Challengers", "Sports & Entertainment", "Virat K. (Sponsorship Head)", "partnerships@rcb.in", "+91 99887 77665", "Daksh Patel", "Aug 29, 2026", 90, 850000.0, "Proposal Sent", "Sign finalized multi-season deal", "Urgent", "1d in stage"));
        leadRepository.save(new Lead("lead-7", "Meridian Healthcare", "Health Tech", "Dr. Alan Smith (CIO)", "asmith@meridian.org", "+1 (555) 333-2222", "Sarah Sales", "Aug 10, 2026", 100, 320000.0, "Closed Won", "Enterprise deployment underway", "Won", "Closed Aug 10"));
    }

    private void seedTasks() {
        taskRepository.save(new Task("task-1", "Finalize $850,000 RCB sponsorship contract revision", "Daksh Patel", "Urgent", false));
        taskRepository.save(new Task("task-2", "Follow up with Quantum Dynamics CPO on proposal approval ($450k)", "Daksh Patel", "High", false));
        taskRepository.save(new Task("task-3", "Send finalized contract to Amanda Roberts at Zenith Financial ($210k)", "Sarah Sales", "High", false));
        taskRepository.save(new Task("task-4", "Audit new user permissions and API scope policies", "Admin User", "Medium", false));
    }

    private void seedNotifications() {
        notificationRepository.save(new Notification("n-1", "deal", "RCB Sponsorship ($850k)", "Virat K. approved the updated multi-season clause.", "3 min ago", "Daksh Patel"));
        notificationRepository.save(new Notification("n-2", "client", "LJ Education Trust", "Onboarding packet confirmed by registrar office.", "18 min ago", "Daksh Patel"));
        notificationRepository.save(new Notification("n-3", "deal", "Zenith Financial ($210k)", "Amanda Roberts requested digital contract signing.", "1 min ago", "Sarah Sales"));
        notificationRepository.save(new Notification("n-4", "access", "Security Audit Clear", "All 3 operator tokens verified with zero anomalies.", "Just now", "Admin User"));
    }

    private void seedAuditLogs() {
        auditLogRepository.save(new AuditLog("log-seed-001", "System", "completed enterprise microservice startup on IN-AHM-01.", "SYSTEM", "⚡", "Startup", "SYSTEM"));
        auditLogRepository.save(new AuditLog("log-seed-002", "Daksh Patel", "signed multi-season sponsorship draft with Royal Challengers ($850,000).", "lead-9", "🏆", "Startup", "PIPELINE"));
        auditLogRepository.save(new AuditLog("log-seed-003", "Sarah Sales", "closed won contract with Meridian Healthcare for $320,000.", "lead-7", "💼", "Startup", "PIPELINE"));
    }
}

