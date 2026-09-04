package com.vertexcrm.model;

import com.vertexcrm.interfaces.Interfaces.Exportable;
import com.vertexcrm.interfaces.Interfaces.Searchable;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Entities {

    // =====================================================
    //  AUDIT LOG - Stores every action performed in the CRM
    // =====================================================
    @Entity
    @Table(name = "audit_logs")
    public static class AuditLog {

        @Id
        private String id;

        private String actor;
        @Column(name = "log_action")
        private String action;
        private String target;
        private String icon;
        @Column(name = "log_timestamp")
        private String timestamp;
        private String category;

        public AuditLog() {}

        public AuditLog(String id, String actor, String action, String target, String icon, String timestamp, String category) {
            this.id = id;
            this.actor = actor;
            this.action = action;
            this.target = target;
            this.icon = icon;
            this.timestamp = timestamp;
            this.category = category;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getActor() { return actor; }
        public void setActor(String actor) { this.actor = actor; }

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    // =====================================================
    //  BASE ENTITY - Parent class for Client and Lead
    // =====================================================
    @MappedSuperclass
    public abstract static class BaseEntity implements Searchable, Exportable {

        public static int totalEntitiesCount = 0;
        public static final String CRM_VERSION = "1.0.0-ENTERPRISE";

        @Id
        protected String id;

        protected String createdAt;

        public BaseEntity() {
            this("GEN-" + System.currentTimeMillis());
        }

        public BaseEntity(String id) {
            this.id = id;
            this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            totalEntitiesCount++;
        }

        public abstract String getDisplaySummary();

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        @Override
        public String exportToSummary() {
            return "ID: " + id + " | Created: " + createdAt;
        }
    }

    // =====================================================
    //  CLIENT - Corporate accounts stored in database
    // =====================================================
    @Entity
    @Table(name = "clients")
    public static class Client extends BaseEntity {

        private String name;
        private String industry;
        private String email;
        private String phone;
        private String location;
        private String owner;
        private String lastContact;
        private String status;
        private String logo;
        private String arr;

        public Client() {
            this("ACC-" + (1000 + (int)(Math.random()*9000)), "Unnamed Client", "General", "client@vertex.com", "+1 555-0000", "Remote", "Daksh Patel", "Just Now", "Active", "", "$100k ARR");
        }

        public Client(String id, String name, String industry, String email, String phone,
                      String location, String owner, String lastContact, String status, String logo, String arr) {
            super(id);
            this.name = name;
            this.industry = industry;
            this.email = email;
            this.phone = phone;
            this.location = location;
            this.owner = owner;
            this.lastContact = lastContact;
            this.status = status;
            this.logo = logo;
            this.arr = arr;
        }

        @Override
        public String getDisplaySummary() {
            return "Client: " + name + " (" + industry + ") - Owner: " + owner + " [" + status + "]";
        }

        @Override
        public boolean matches(String query) {
            if (query == null || query.isBlank()) return true;
            String q = query.toLowerCase();
            return (name != null && name.toLowerCase().contains(q)) ||
                   (industry != null && industry.toLowerCase().contains(q)) ||
                   (owner != null && owner.toLowerCase().contains(q)) ||
                   (location != null && location.toLowerCase().contains(q));
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }

        public String getLastContact() { return lastContact; }
        public void setLastContact(String lastContact) { this.lastContact = lastContact; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getLogo() { return logo; }
        public void setLogo(String logo) { this.logo = logo; }

        public String getArr() { return arr; }
        public void setArr(String arr) { this.arr = arr; }
    }

    // =====================================================
    //  DASHBOARD METRICS
    // =====================================================
    public static class DashboardMetrics {
        private int activeClients;
        private int totalDeals;
        private double pipelineValue;
        private double wonRevenue;
        private int wonDeals;
        private double forecast30d;
        private int winConversionRate;
        private int priorityDealsCount;
        private int pipelineVelocity;

        public DashboardMetrics() {}

        public DashboardMetrics(int activeClients, int totalDeals, double pipelineValue, double wonRevenue,
                                int wonDeals, double forecast30d, int winConversionRate, int priorityDealsCount, int pipelineVelocity) {
            this.activeClients = activeClients;
            this.totalDeals = totalDeals;
            this.pipelineValue = pipelineValue;
            this.wonRevenue = wonRevenue;
            this.wonDeals = wonDeals;
            this.forecast30d = forecast30d;
            this.winConversionRate = winConversionRate;
            this.priorityDealsCount = priorityDealsCount;
            this.pipelineVelocity = pipelineVelocity;
        }

        public int getActiveClients() { return activeClients; }
        public void setActiveClients(int activeClients) { this.activeClients = activeClients; }

        public int getTotalDeals() { return totalDeals; }
        public void setTotalDeals(int totalDeals) { this.totalDeals = totalDeals; }

        public double getPipelineValue() { return pipelineValue; }
        public void setPipelineValue(double pipelineValue) { this.pipelineValue = pipelineValue; }

        public double getWonRevenue() { return wonRevenue; }
        public void setWonRevenue(double wonRevenue) { this.wonRevenue = wonRevenue; }

        public int getWonDeals() { return wonDeals; }
        public void setWonDeals(int wonDeals) { this.wonDeals = wonDeals; }

        public double getForecast30d() { return forecast30d; }
        public void setForecast30d(double forecast30d) { this.forecast30d = forecast30d; }

        public int getWinConversionRate() { return winConversionRate; }
        public void setWinConversionRate(int winConversionRate) { this.winConversionRate = winConversionRate; }

        public int getPriorityDealsCount() { return priorityDealsCount; }
        public void setPriorityDealsCount(int priorityDealsCount) { this.priorityDealsCount = priorityDealsCount; }

        public int getPipelineVelocity() { return pipelineVelocity; }
        public void setPipelineVelocity(int pipelineVelocity) { this.pipelineVelocity = pipelineVelocity; }
    }

    // =====================================================
    //  LEAD - Pipeline deals stored in database
    // =====================================================
    @Entity
    @Table(name = "leads")
    public static class Lead extends BaseEntity {

        private String name;
        private String tag;
        private String contact;
        private String email;
        private String phone;
        private String assigned;
        @Column(name = "target_date")
        private String date;
        private int probability;
        @Column(name = "deal_value")
        private double value;
        private String stage;
        private String nextStep;
        private String priority;
        private String stageAge;

        public Lead() {
            super();
        }

        public Lead(String id, String name, String tag, String contact, String email, String phone,
                    String assigned, String date, int probability, double value, String stage,
                    String nextStep, String priority, String stageAge) {
            super(id);
            this.name = name;
            this.tag = tag;
            this.contact = contact;
            this.email = email;
            this.phone = phone;
            this.assigned = assigned;
            this.date = date;
            this.probability = probability;
            this.value = value;
            this.stage = stage;
            this.nextStep = nextStep;
            this.priority = priority;
            this.stageAge = stageAge;
        }

        @Override
        public String getDisplaySummary() {
            return "Deal: " + name + " | $" + value + " | Stage: " + stage + " (" + probability + "%)";
        }

        @Override
        public boolean matches(String query) {
            if (query == null || query.isBlank()) return true;
            String q = query.toLowerCase();
            return (name != null && name.toLowerCase().contains(q)) ||
                   (tag != null && tag.toLowerCase().contains(q)) ||
                   (assigned != null && assigned.toLowerCase().contains(q)) ||
                   (contact != null && contact.toLowerCase().contains(q));
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }

        public String getContact() { return contact; }
        public void setContact(String contact) { this.contact = contact; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAssigned() { return assigned; }
        public void setAssigned(String assigned) { this.assigned = assigned; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public int getProbability() { return probability; }
        public void setProbability(int probability) { this.probability = probability; }

        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }

        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }

        public String getNextStep() { return nextStep; }
        public void setNextStep(String nextStep) { this.nextStep = nextStep; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getStageAge() { return stageAge; }
        public void setStageAge(String stageAge) { this.stageAge = stageAge; }
    }

    // =====================================================
    //  NOTIFICATION - User notifications stored in database
    // =====================================================
    @Entity
    @Table(name = "notifications")
    public static class Notification {

        @Id
        private String id;

        private String type;
        private String title;
        @Column(name = "description")
        private String desc;
        @Column(name = "notif_time")
        private String time;
        @Column(name = "username")
        private String user;

        public Notification() {}

        public Notification(String id, String type, String title, String desc, String time, String user) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.desc = desc;
            this.time = time;
            this.user = user;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDesc() { return desc; }
        public void setDesc(String desc) { this.desc = desc; }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public String getUser() { return user; }
        public void setUser(String user) { this.user = user; }
    }

    // =====================================================
    //  TASK - Personal tasks stored in database
    // =====================================================
    @Entity
    @Table(name = "tasks")
    public static class Task {

        @Id
        private String id;

        private String title;
        private String assignedTo;
        private String priority;
        private boolean completed;

        public Task() {}

        public Task(String id, String title, String assignedTo, String priority, boolean completed) {
            this.id = id;
            this.title = title;
            this.assignedTo = assignedTo;
            this.priority = priority;
            this.completed = completed;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    // =====================================================
    //  USER - CRM users stored in database
    // =====================================================
    @Entity
    @Table(name = "crm_users")
    public static class User {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long dbId;

        private String name;
        private String email;
        private String role;
        private String dept;
        private int accountsCount;
        private int dealsCount;

        public User() {}

        public User(String name, String email, String role, String dept, int accountsCount, int dealsCount) {
            this.name = name;
            this.email = email;
            this.role = role;
            this.dept = dept;
            this.accountsCount = accountsCount;
            this.dealsCount = dealsCount;
        }

        public Long getDbId() { return dbId; }
        public void setDbId(Long dbId) { this.dbId = dbId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getDept() { return dept; }
        public void setDept(String dept) { this.dept = dept; }

        public int getAccountsCount() { return accountsCount; }
        public void setAccountsCount(int accountsCount) { this.accountsCount = accountsCount; }

        public int getDealsCount() { return dealsCount; }
        public void setDealsCount(int dealsCount) { this.dealsCount = dealsCount; }
    }

}
