# Nexaminds Backend Technical Test

A robust, containerized microservices architecture designed to handle user authentication, complex logic processing, and asynchronous email dispatching using **Node.js**, **RabbitMQ**, and **MongoDB**.

## 🏗️ Architecture

The system follows a **Microservices** pattern orchestrated via an **API Gateway**:

*   **🚪 API Gateway (Port 3000):** Single entry point that handles routing and aggregates Swagger documentation.
*   **🔐 Auth Service (Port 3001):** Manages Users, JWT Authentication, and MongoDB storage.
*   **⚙️ URL Builder Service (Port 3002):** Handles complex logic (median/duration calculation) and orchestrates the workflow.
*   **📧 Email Service (Port 3003):** A hybrid service (REST API + Background Worker) using **RabbitMQ** to handle high-volume email dispatching reliably with a retry mechanism.

---

## 🚀 Quick Start

### Prerequisites
*   **Docker Desktop** (Ensure it is running)
*   **Git**

### Installation & Running
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd nexaminds-test
    ```

2.  **Start the ecosystem:**
    ```bash
    docker compose up --build
    ```

3.  **Access the Application:**
    *   **Unified API Docs:** [http://localhost:3000](http://localhost:3000) (Swagger UI)
    *   **API Gateway Root:** `http://localhost:3000/api/v1/...`

---


## ⚙️ CI/CD Pipeline

This project utilizes **GitHub Actions** to ensure code quality and architectural integrity before every deployment. The pipeline is defined in `.github/workflows/ci.yml`.

### Workflow Stages:

1.  **🛡️ Quality & Security:**
    *   **Linting:** Runs `ESLint` to enforce code style and catch syntax errors.
    *   **Audit:** Runs `npm audit` to scan dependencies for known security vulnerabilities.

2.  **🧪 Parallel Unit Testing:**
    *   Uses a **Matrix Strategy** to run tests for `auth-service`, `url-builder-service`, and `email-service` simultaneously.
    *   Tests are isolated using **Mocks** (Jest) for MongoDB, RabbitMQ, and external APIs, ensuring execution in milliseconds.

3.  **🐳 Integration & Build Verification:**
    *   **Build Check:** Validates that all `Dockerfiles` build successfully.
    *   **Live Integration Test:** Spins up the entire stack using `docker compose up`, waits for health checks, and executes real HTTP requests via `curl` against the API Gateway to verify service-to-service communication.

---

## ✨ Key Features

*   **RabbitMQ Asynchronous Queuing:** Decouples the Email Service from the HTTP response cycle, allowing the system to handle high-volume traffic without latency.
*   **Resilient Retry Logic:** The Email Worker implements an exponential retry mechanism (Max 3 attempts) to handle temporary failures (e.g., SMTP downtime) without losing messages or entering infinite loops.
*   **API Gateway Pattern:** A single entry point (Port 3000) that handles routing, request aggregation, and provides a unified Swagger Documentation UI.
*   **Robust Error Handling:** Implements centralized error handling, strict input validation (Regex/Types), and graceful degradation if dependent services are down.
*   **Docker Orchestration:** Uses `depends_on` and `healthcheck` directives to ensure the Database and Queue are fully ready before microservices attempt to connect.
*   **Code Quality:** Enforces clean code via **ESLint** (configured for CommonJS/Node.js) and **Prettier**.

---

## 📂 Project Structure

```text
nexaminds-test/
│
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD Pipeline Configuration
│
├── api-gateway/                  # Entry Point
│   ├── src/index.js              # Proxy Logic & Swagger Aggregation
│   └── Dockerfile
│
├── auth-service/                 # Authentication Microservice
│   ├── src/
│   │   ├── config/               # DB Connection
│   │   ├── controllers/          # Auth Logic (Register/Login)
│   │   ├── models/               # Mongoose Schemas
│   │   └── routes/               # API Routes
│   └── tests/                    # Unit Tests
│
├── url-builder-service/          # Logic Microservice
│   ├── src/
│   │   └── controllers/          # Math Logic & Orchestration
│   └── tests/
│
├── email-service/                # Hybrid Service (API + Worker)
│   ├── src/
│   │   ├── config/               # RabbitMQ & Nodemailer Config
│   │   ├── controllers/          # API Endpoint Logic
│   │   ├── workers/              # Background Job Processor
│   │   └── templates/            # HTML Email Templates
│   └── tests/
│
└── docker-compose.yml            # Container Orchestration
