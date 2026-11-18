# PlacePro – Campus Placement Management System

A full-stack web application designed to manage campus placement activities, student profiles, job opportunities, applications, and placement-related information.

## Tech Stack

**Backend**
- Java 21
- Spring Boot 4.1.0
- Spring Security
- Spring Data JPA / Hibernate
- JWT Authentication
- Maven

**Frontend**
- React 18
- Vite
- React Router
- Bootstrap 5
- Bootstrap Icons

**Database**
- PostgreSQL

## Features and Modules

- Student management and student profiles
- Job posting management
- Job application management
- Company and college management
- Interview schedule management
- Skills and certificates management
- Authentication and role-based access control

The application includes Student, Admin, and Placement Officer roles.

## Project Structure

```text
PlacementManagement/
├── src/
│   └── main/
│       ├── java/             # Spring Boot backend
│       └── resources/        # Application configuration
├── frontend/                 # React frontend
├── pom.xml                   # Maven configuration
├── mvnw                      # Maven wrapper
├── mvnw.cmd                  # Maven wrapper for Windows
├── docker-compose.yml        # Docker configuration
├── Dockerfile
└── README.md
```

## Prerequisites

Install the following:

- Java JDK 21
- Node.js
- PostgreSQL 14 or later
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sarthak6537/Placement-Management-System.git
cd Placement-Management-System
```

### 2. Create PostgreSQL Database

Open pgAdmin or PostgreSQL SQL Shell and execute:

```sql
CREATE DATABASE placementdb;
```

### 3. Configure Environment Variables

The backend reads database credentials and the JWT secret from environment variables.

For Windows PowerShell, configure them in the backend terminal:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/placementdb"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_postgresql_password"
$env:JWT_SECRET="your_long_random_secret"
```

Replace the example values with your own credentials.

Do not commit actual credentials or secrets to GitHub.

### 4. Start the Backend

From the project root directory, run:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

**Mac/Linux:**

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

Backend URL:

http://localhost:8080

### 5. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

http://localhost:3000

### 6. Access the Application

Open your browser and visit:

http://localhost:3000

Register an account to get started.

## API and Architecture

The backend uses a layered Spring Boot architecture:

- Controller layer – Handles HTTP requests.
- Service layer – Contains business logic.
- Repository layer – Handles database operations.
- Entity layer – Represents database entities.

The frontend communicates with backend REST endpoints through Vite's development proxy.

## Troubleshooting

**Database connection error**
- Ensure PostgreSQL is running.
- Verify the database name and environment variables.

**Port 8080 already in use**
- Stop the other application or configure another backend port.

**Frontend dependencies issue**
- Run `npm install` inside the frontend directory.

**Java version issue**
- Verify that Java 21 is installed using `java -version`.

## Author

**Sarthak Mahamuni**

GitHub: https://github.com/sarthak6537

---

This project was developed as a Java Full Stack development project using Spring Boot, React, and PostgreSQL.