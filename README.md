# Vertex CRM — Enterprise Java Project

A full-stack Customer Relationship Management (CRM) platform built with **Java 17 / Spring Boot** on the backend and a **modern 3D glassmorphic Web UI (HTML5 / CSS3 / ES6)** on the frontend.

---

## 🏛️ Project Architecture & Java Design Patterns

This project follows the industry-standard **Layered Enterprise Architecture (MVC / Controller-Service-Model Pattern)**:

```
src/main/java/com/vertexcrm/
│
├── VertexCrmApplication.java       # Spring Boot Application Entrypoint
├── CrmController.java              # REST Controller exposing endpoints (/api/...)
│
├── model/                          # Domain Data Models (POJOs)
│   ├── Client.java                 # Corporate account entity with ARR & health metrics
│   ├── Lead.java                   # Deal opportunity with probability & next step
│   ├── User.java                   # Operator identity with role & department
│   ├── Task.java                   # Assigned personal task item
│   ├── Notification.java           # Workspace notification object
│   ├── AuditLog.java               # Cryptographic/telemetry log entry
│   └── DashboardMetrics.java       # Aggregated KPI & pipeline analytics
│
├── dto/                            # Data Transfer Objects (Request/Response DTOs)
│   ├── CreateClientRequest.java    # Client registration payload
│   ├── CreateLeadRequest.java      # Pipeline deal creation payload
│   ├── CreateUserRequest.java      # User access grant payload
│   ├── CreateTaskRequest.java      # Personal task payload
│   ├── SaveNoteRequest.java        # User notes payload
│   └── UpdateLeadStageRequest.java # Kanban stage transition payload
│
└── service/                        # Business Logic Layer
    └── CrmService.java             # Core CRM business operations & calculation engine
```

---

## ☕ Core Java Concepts Implemented

1. **Object-Oriented Programming (OOP)**:
   - Encapsulation: Private fields with public getters, setters, and explicit constructors.
   - Domain Modelling: Clean separation of models (`Client`, `Lead`, `User`, `Task`, `Notification`, `AuditLog`).

2. **Collections & Java Stream API**:
   - Uses `CopyOnWriteArrayList` and `ConcurrentHashMap` for thread-safe in-memory state.
   - Java 8+ functional streams (`.filter()`, `.mapToDouble()`, `.sum()`, `.collect(Collectors.toList())`) for real-time KPI metrics and stage breakdowns.

3. **RESTful Web Services (Spring Web)**:
   - `@RestController` and `@RequestMapping("/api")`
   - `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
   - `@PathVariable`, `@RequestBody`, `@RequestParam`
   - `@CrossOrigin` support for web clients.

4. **Layered Decoupling**:
   - Controller handles HTTP request validation and status responses.
   - Service handles data persistence, state transitions, and business calculations.

---

## 🚀 How to Run the Project

### Option 1: Run with Maven / Command Line
```bash
# Navigate to the project directory:
cd "vertex-crm CLAUDE"

# Run Spring Boot:
mvn spring-boot:run
```
Once started, open your web browser at:
👉 **`http://localhost:8080/`**

---

### Option 2: Run in IntelliJ IDEA or Eclipse
1. Open the project directory in **IntelliJ IDEA** or **Eclipse** as a Maven Project.
2. Ensure Project SDK is set to **Java 17** (or Java 21).
3. Right-click on `VertexCrmApplication.java` -> **Run 'VertexCrmApplication'**.
4. Open **`http://localhost:8080/`** in your browser.

---

### Option 3: Standalone Browser Mode (No Java required for quick preview)
You can directly double-click or open **`src/main/resources/static/index.html`** in Chrome, Edge, Firefox, or Safari. The frontend has a built-in fallback store that mirrors the Java backend.

---

## 📡 REST API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck & system status node |
| `GET` | `/api/clients` | Retrieve all clients (supports `?owner=...` filter) |
| `POST` | `/api/clients` | Register a new client account |
| `GET` | `/api/leads` | Retrieve deals in pipeline (supports `?assigned=...`) |
| `POST` | `/api/leads` | Create a new deal opportunity |
| `PUT` | `/api/leads/{id}/stage` | Advance or move a deal to a new stage |
| `GET` | `/api/users` | List all authorized CRM operator identities |
| `POST` | `/api/users` | Grant access to a new user |
| `DELETE` | `/api/users/{index}` | Revoke workspace access |
| `GET` | `/api/tasks` | Get user task checklist |
| `POST` | `/api/tasks` | Add a new task item |
| `PUT` | `/api/tasks/{id}/toggle` | Toggle task completion |
| `GET` | `/api/notifications` | Get user notifications |
| `DELETE` | `/api/notifications` | Clear notifications for user |
| `GET` | `/api/logs` | Retrieve immutable audit trail events |
| `GET` | `/api/dashboard/summary` | Get aggregated KPI calculations and forecasts |

---

## 🌟 Key Features
- **Multi-User Role Switching**: Live switching between *Daksh Patel*, *Sarah Sales*, and *Admin User* with dynamic recalculation of metrics.
- **Interactive Drag-and-Drop Pipeline**: HTML5 Kanban with 3D Deal Dossier modal.
- **Upward-Animated Visual Charts**: Smooth bottom-to-top rising SVG graphs.
- **Client Directory & Live Search**: Filter by status, account owner, and keyword.
- **3D Perspective & Motion Engine**: 60fps parallax animations with zero lag.
