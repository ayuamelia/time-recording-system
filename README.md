# ⏱ Time Recording System

A RESTful API for recording employee work hours, managing work calendars, and generating reports — built with **TypeScript**, **Express**, **Prisma ORM**, and **PostgreSQL**. Includes a React frontend for end-to-end usability demonstration.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Assumptions](#assumptions)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Running the Application](#running-the-application)
- [Frontend](#frontend)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Running Tests](#running-tests)
- [API Documentation (Swagger UI)](#api-documentation-swagger-ui)
- [Concurrency Design](#concurrency-design)

---

## Features

| Feature | Description |
|---|---|
| **Clock In / Out** | Stateful clock events with invalid-transition guards |
| **Concurrency Safety** | Serializable transactions prevent duplicate clock-ins under concurrent requests |
| **Work Calendar** | Configurable working days per week + holiday/replacement day overrides |
| **Overtime Calculation** | Auto-computed on clock-out based on configured daily hours |
| **CRUD – Time Records** | Full create / read / update / delete with pagination |
| **Reporting** | Date-range report with daily totals + aggregate totals |
| **JWT Authentication** | Login endpoint issues signed JWTs; all other routes are protected |
| **Role-Based Access** | `admin` role required for config and calendar override mutations |
| **Rate Limiting** | Brute-force protection on login; general throttle on all routes |
| **Test Suite** | Integration tests covering auth, clock logic, CRUD, reports, and concurrency |
| **Frontend UI** | React interface demonstrating the full end-to-end user flow |

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Runtime | Node.js v18+ |
| Language | TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Authentication | `jsonwebtoken` + `bcryptjs` |
| Date handling | Day.js |
| Validation | `express-validator` |
| Rate limiting | `express-rate-limit` |
| API Docs | OpenAPI 3.0 + `swagger-ui-express` |
| Testing | Jest + `ts-jest` + Supertest |
| Frontend | React 18 + Vite 5 |

---

## Architecture

```
src/
├── config/
│   ├── database.ts          
│   ├── openapi.yaml        
│   └── swagger.ts           
├── controllers/             
│   ├── authController.ts
│   ├── clockController.ts
│   ├── timeRecordController.ts
│   ├── reportController.ts
│   ├── workConfigController.ts
│   └── userController.ts
├── services/                
│   ├── authService.ts       
│   ├── clockService.ts      
│   ├── timeRecordService.ts 
│   ├── reportService.ts     
│   ├── workConfigService.ts 
│   └── userService.ts
├── middleware/
│   ├── authenticate.ts      
│   ├── rateLimiter.ts       
│   └── errorHandler.ts      
├── routes/
│   └── index.ts             
├── types/
│   ├── index.ts             
│   └── express.d.ts         
├── utils/
│   ├── time.ts              
│   └── response.ts          
├── tests/
│   ├── setup.ts             
│   ├── helpers.ts           
│   ├── auth.test.ts         
│   ├── clock.test.ts        
│   ├── timeRecords.test.ts  
│   └── reports.test.ts      
├── app.ts                   
└── server.ts               

frontend/
├── src/
│   └── App.jsx             
├── index.html
├── vite.config.js
└── package.json
```

---

## Assumptions

1. **Single open session per user**: A user can only have one active (not yet clocked-out) session at a time. A second clock-in returns HTTP 400.

2. **Overtime is per-session**: Overtime = session worked minutes minus `normalHoursPerDay × 60`. It is computed per individual session, not aggregated across multiple sessions within the same day.

3. **Single active work config**: There is one global work configuration row. Updating it overwrites the previous values. Config history/audit trail is out of scope.

4. **Date locality**: The `date` field on a time record is derived from the `clockIn` timestamp using the `APP_TIMEZONE` environment variable. A clock-in at 23:30 UTC in Singapore (UTC+8) is recorded as the **next calendar day** locally.

5. **Calendar overrides are global**: Holiday overrides apply to all users. Per-user calendars are out of scope.

6. **Role assignment at user creation**: A user's role (`admin` or `employee`) is set when the account is created. There is no role-change endpoint — this would be added in a future iteration.

7. **Reports include all calendar days**: The report endpoint iterates every calendar day in the range (not just working days) so unexpected weekend/holiday work is visible.

8. **PostgreSQL required**: The `Serializable` isolation level used for concurrency control is a PostgreSQL feature. SQLite is not supported.

9. **Rate limiting is disabled in tests**: `express-rate-limit` is skipped when `NODE_ENV=test` to avoid flaky test failures from rapid sequential requests.

10. **No HTTPS**: TLS termination is assumed to be handled by a reverse proxy (e.g. Nginx, AWS ALB) in production.

---

## Setup Instructions

### Prerequisites

- Node.js v20.19+ or v22+
- PostgreSQL 16 (or Docker)
- npm

### 1. Clone and install dependencies

```bash
git clone https://github.com/ayuamelia/time-recording-system
cd time-recording-system
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` and fill in all values:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/time_recording"

# App
PORT=3000
NODE_ENV=development
APP_TIMEZONE=Asia/Singapore   # IANA timezone

# JWT
JWT_SECRET=a73d6dde-cef2-4418-b831-b36d3598c121
JWT_EXPIRES_IN=8h

# Test database (separate DB so tests never touch dev data)
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/time_recording_test"
```

### 3. Start PostgreSQL (Docker recommended)

```bash
docker-compose up -d
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. (Optional) Seed sample data

Creates two users with password `password123` and a sample time record:

```bash
npm run db:seed
```

Seeded users:

| Name | Email | Password | Role |
|---|---|---|---|
| Alice Smith | alice@example.com | password123 | employee |
| Bob Jones | bob@example.com | password123 | admin |

---

## Database Schema

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  users                                                                        │
│  id (UUID PK) │ name │ email (UNIQUE) │ password_hash │ role                 │
│  created_at │ updated_at                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
        │ 1:N
┌──────────────────────────────────────────────────────────────────────────────┐
│  time_records                                                                 │
│  id (UUID PK) │ user_id (FK → users) │ clock_in │ clock_out │ date (DATE)    │
│  worked_minutes │ overtime_minutes │ notes │ created_at │ updated_at         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  work_config                                                                  │
│  id (UUID PK) │ normal_hours_per_day │ working_days_of_week (JSON array)     │
│  effective_from │ created_at │ updated_at                                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  work_calendar_overrides                                                      │
│  id (UUID PK) │ date (DATE UNIQUE) │ is_working_day │ description            │
│  created_at                                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

The raw SQL reference migration is at [`migrations/001_initial_schema.sql`](migrations/001_initial_schema.sql).
Prisma migrations (used at runtime) live in `prisma/migrations/`.

---

## Running the Application

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

The API is available at `http://localhost:3000/api/v1`.

---

## Frontend

The frontend is a single-file React application (`frontend/src/App.jsx`) that demonstrates the full end-to-end user flow against the live API.

### Pages

| Page | Available to | Description |
|---|---|---|
| **Dashboard** | All users | Clock in/out with live elapsed timer, 30-day summary stats, paginated time records |
| **Reports** | All users | Generate a date-range report with daily breakdown and bar chart; admins can select any employee |
| **Admin** | Admin only | Manage work config, calendar overrides, and users |

### Dashboard features

The clock widget shows a live `HH:MM:SS` elapsed timer once the user clocks in. The timer turns amber when the session exceeds 8 hours, with an "Overtime running" indicator. The 30-day summary cards pull from the `/reports` endpoint and update automatically after each clock event.

### Admin panel tabs

The Admin page is only visible in the sidebar when the logged-in user has the `admin` role. It contains three tabs, each backed by real API calls: Work Config (edit daily hours and toggle working days), Calendar Overrides (add/remove holidays and forced working days), and Users (list, create, delete).

### Setup

> **Requires Node.js v20.19+ or v22+.** Vite 5 is used to avoid the Node 20.19+ requirement of Vite 6.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:3000`.

### CORS

If the browser blocks requests to the API, add CORS support to the backend:

```bash
npm install cors
npm install -D @types/cors
```

Then in `src/app.ts`:

```typescript
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:5173' }));
```

### Running both servers together

Open two terminal windows:

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Then open `http://localhost:5173` and log in with any seeded user.

---

## Authentication

All endpoints except `GET /health` and `POST /auth/login` require a valid JWT in the `Authorization` header.

### 1. Login to get a token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "password123"}'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Use the token on all subsequent requests

```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <token>"
```

### Token details

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Payload | `{ userId, email, role }` |
| Expiry | Controlled by `JWT_EXPIRES_IN` env var (default: `8h`) |

### Role-based access

| Role | Permissions |
|---|---|
| `employee` | Clock in/out, view own records, generate reports |
| `admin` | All employee permissions + update work config, manage calendar overrides, manage all users |

Attempting an admin-only action as an employee returns **HTTP 403 Forbidden**.

---

## Rate Limiting

Rate limiting is applied per IP address and is automatically disabled when `NODE_ENV=test`.

| Limiter | Applies to | Limit | Window | Notes |
|---|---|---|---|---|
| `authLimiter` | `POST /auth/login` | 10 requests | 15 minutes | Failed attempts only |
| `apiLimiter` | All `/api/v1/*` routes | 100 requests | 1 minute | Applied globally |

When a limit is exceeded the API returns:

```json
HTTP 429 Too Many Requests

{
  "success": false,
  "error": "Too many login attempts, please try again after 15 minutes"
}
```

Response headers include standard `RateLimit-*` fields so clients can implement backoff:

```
RateLimit-Limit: 10
RateLimit-Remaining: 0
RateLimit-Reset: 1710000000
```

---

## Running Tests

### Prerequisites

Ensure `TEST_DATABASE_URL` is set in your `.env` file pointing to a separate database:
```
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/time_recording_test
```

### 1. Migrate the test database

Run this once (and again whenever you add new Prisma migrations):
```bash
npm run db:migrate:test
```

This script will create the test database if it doesn't exist, then apply all migrations to it.

### 2. Run the test suite
```bash
npm test                 # run all tests once
npm run test:watch       # watch mode
npm run test:coverage    # with coverage report
```

> **Note:** Tests use a separate database (`time_recording_test`).

### Test coverage

| File | What it covers |
|---|---|
| `auth.test.ts` | Login success, wrong password, unknown email, missing fields, accessing protected route without token |
| `clock.test.ts` | Clock-in success, double clock-in prevention, clock-out with computed minutes, not-clocked-in prevention, status check, **concurrent clock-in safety** |
| `timeRecords.test.ts` | Manual creation, overtime calculation, invalid date order rejection, read, paginated list, update, delete |
| `reports.test.ts` | Correct aggregate totals, overtime totals, non-working day detection, missing query params |

### Concurrency test

The most critical test in `clock.test.ts` fires two simultaneous clock-in requests with `Promise.all()` and asserts:

1. Exactly one request succeeds (HTTP 201)
2. The other is rejected with HTTP 400 or 409
3. Only one open record exists in the database

This directly validates the `Serializable` transaction isolation used in `clockService.ts`.

---

## API Documentation (Swagger UI)

The full interactive API reference is served by the application itself.

Once the server is running, open:

```
http://localhost:3000/api/v1/docs
```

A machine-readable OpenAPI 3.0 JSON spec is also available at:

```
http://localhost:3000/api/v1/docs.json
```

Import this URL into **Postman** or **Insomnia** to get a pre-built collection instantly.
The spec source lives at [`src/config/openapi.yaml`](src/config/openapi.yaml).

### Endpoints at a glance

| Tag | Method | Path | Auth | Description |
|---|---|---|---|---|
| Health | GET | `/api/v1/health` | None | Server liveness |
| Auth | POST | `/api/v1/auth/login` | None | Login, receive JWT |
| Users | POST | `/api/v1/users` | Admin | Create user |
| Users | GET | `/api/v1/users` | Any | List users |
| Users | GET | `/api/v1/users/:id` | Any | Get user |
| Users | PATCH | `/api/v1/users/:id` | Admin | Update user |
| Users | DELETE | `/api/v1/users/:id` | Admin | Delete user |
| Clock | POST | `/api/v1/clock/in` | Any | Clock in |
| Clock | POST | `/api/v1/clock/out` | Any | Clock out |
| Clock | GET | `/api/v1/clock/status/:userId` | Any | Clock status |
| Time Records | POST | `/api/v1/time-records` | Any | Create record manually |
| Time Records | GET | `/api/v1/time-records` | Any | List records (paginated) |
| Time Records | GET | `/api/v1/time-records/:id` | Any | Get record |
| Time Records | PATCH | `/api/v1/time-records/:id` | Any | Update record |
| Time Records | DELETE | `/api/v1/time-records/:id` | Any | Delete record |
| Reports | GET | `/api/v1/reports` | Any | Generate date-range report |
| Work Config | GET | `/api/v1/config` | Any | Get work config |
| Work Config | PUT | `/api/v1/config` | Admin | Update work config |
| Calendar Overrides | GET | `/api/v1/calendar-overrides` | Any | List overrides |
| Calendar Overrides | PUT | `/api/v1/calendar-overrides` | Admin | Upsert override |
| Calendar Overrides | DELETE | `/api/v1/calendar-overrides/:date` | Admin | Delete override |

### Response envelope

Every response is wrapped in a consistent envelope:

```json
{ "success": true,  "data": { ... },  "message": "Optional note" }
{ "success": false, "error": "Human-readable error message" }
```

### HTTP status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error or invalid business-rule transition |
| 401 | Missing, invalid, or expired JWT |
| 403 | Valid JWT but insufficient role |
| 404 | Resource not found |
| 409 | Concurrent request conflict (safe to retry) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

---

## Concurrency Design

Clock-in and clock-out operations use **PostgreSQL Serializable isolation level** transactions.

When two requests arrive simultaneously for the same user:

1. Both transactions begin and read the open-records table — both see no open record
2. The first transaction commits and inserts a new clock-in record
3. PostgreSQL detects the write conflict and aborts the second transaction with error code `P2034`
4. The API catches `P2034` and returns **HTTP 409 Conflict**

This guarantees at most one open session per user at all times, even under heavy concurrent load, without any application-level locking or queuing.