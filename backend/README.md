# Backend Project

**Course:** Adv. Programming Web Technology  
**Section:** B

### Developed By
* **Mehedi Hasan** — ID: `22-48502-3`
* **Abdul Aziz Jihan** — ID: `22-46518-1`
* **Md. Farhan Ferdous Omar** — ID: `24-56430-1`

---

# Setup & Run Guide

This guide will help you set up and run the NestJS backend project locally.

## 🚀 Prerequisites

Before starting, ensure the following are installed:
* Node.js v22 or later
* PostgreSQL
* NestJS CLI (install globally if not already installed):
  ```bash
  npm install -g @nestjs/cli
  ```

---

## 📦 Install Dependencies

1. **Install the core project dependencies:**
   ```bash
   pnpm install
   ```

2. **Install additional required packages (if needed):**
   ```bash
   pnpm add class-validator class-transformer bcrypt
   pnpm add -D typescript @types/bcrypt
   ```

---

## 🔧 Environment Variables

1. Go to the project root directory.
2. Find the `.env.example` file and create a `.env` file in the same directory.
3. Copy all content from `.env.example` into `.env` and update the values based on your local environment.

**Example:**
```bash
cp .env.example .env
```

---

## 🗄️ Database Setup & Migrations

1. **Create the database:**
   ```bash
   createdb student_health
   ```

2. **Run migrations:**
   ```bash
   pnpm run migration:run
   ```

---

## 🌱 Seed Admin Account

If the project seeder is configured, run:
```bash
pnpm seeder:run:dev
```

**Demo admin credentials used during development:**
* **Email:** `admin@hospital.com`
* **Password:** `Admin@12345`

> **Note:** These credentials are for local demonstration only. Change them before production deployment.

---

## ▶️ Running the Backend (Development)

Start the NestJS development server:
```bash
pnpm start:dev
```

The backend should now be running at: http://localhost:5001

---

## 📁 Project Structure

```text
src/
├── common/
│   ├── decorators/
│   ├── enums/
│   └── guard/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── doctor/
│   ├── department/
│   ├── doctor-department/
│   ├── slot/
│   └── appointments/
├── app.module.ts
└── main.ts
```