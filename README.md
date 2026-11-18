# PlacePro — Campus Placement Management System

## What You Need (Install Once)

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 21 | https://adoptium.net (Eclipse Temurin 21) |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download |

---

## Step 1 — PostgreSQL Setup (Do this once on every new system)

Open **pgAdmin** or **SQL Shell (psql)** and run:

```sql
CREATE DATABASE placementdb;
```

That's it. Username: `postgres`, Password: `root` (defaults already set in the app).

If your PostgreSQL password is different, edit this file:
```
PlacementManagement/src/main/resources/application.properties
```
Change line:
```
spring.datasource.password=${DB_PASSWORD:root}
```
Replace `root` with your actual PostgreSQL password.

---

## Step 2 — Start the Backend

Open a terminal in the `PlacementManagement` folder and run:

**Windows:**
```
mvnw.cmd spring-boot:run
```

**Mac / Linux:**
```
chmod +x mvnw
./mvnw spring-boot:run
```

Wait until you see:
```
Started PlacementManagementApplication in X seconds
```

Backend is now running at **http://localhost:8080**

---

## Step 3 — Start the Frontend

Open a **second terminal** in the `PlacementManagement/frontend` folder and run:

```
npm install
npm run dev
```

Frontend is now running at **http://localhost:3000**

---

## Step 4 — Open in Browser

Go to: **http://localhost:3000**

Register a new account and start using the system.

---

## Default Credentials (if you want to use existing data)

| Username | Password | Role |
|----------|----------|------|
| Register yourself | — | Student / Placement Officer / Admin |

---

## Folder Structure

```
PlacementManagement/
├── src/                  ← Spring Boot backend (Java 21)
├── frontend/             ← React frontend (Vite + Bootstrap)
├── pom.xml               ← Maven build file
├── mvnw / mvnw.cmd       ← Maven wrapper (no Maven install needed)
└── application.properties← DB config
```

---

## Troubleshooting

**"Port 8080 already in use"**
→ Another app is using port 8080. Stop it or change the port in `application.properties`:
```
server.port=8081
```
And update `frontend/vite.config.js` proxy target to `http://localhost:8081`

**"Could not connect to database"**
→ Make sure PostgreSQL is running and the `placementdb` database exists.

**"JAVA_HOME not set" or wrong Java version**
→ Install Java 21 from https://adoptium.net and set JAVA_HOME to the JDK 21 path.

**Frontend shows blank page**
→ Make sure `npm install` was run inside the `frontend/` folder.

---

## Tech Stack

- **Backend:** Spring Boot 4.1 · Spring Security · JWT · JPA · PostgreSQL
- **Frontend:** React 18 · Vite · Bootstrap 5 · React Router 7
- **Auth:** JWT (stored in localStorage, 24h expiry)
