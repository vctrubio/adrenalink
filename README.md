# Adrenalink

Student-teacher connection platform for adrenaline sports (Kite, Wing, Windsurf, Paragliding, Surf, Snow).

## 🏗 System Architecture

Adrenalink is a multi-tenant platform facilitating a **3-way synchronization** between:

1.  **Schools (Admin)**: Managing operations, scheduling, assets, and finances.
2.  **Teachers**: Viewing schedules, managing lesson statuses, and commissions.
3.  **Students**: Booking lessons, tracking progress, and managing payments.

### Core Stack

- **Frontend/Framework**: Next.js 15 (App Router).
- **Backend/Database**: Supabase (PostgreSQL) with Realtime subscriptions.
- **Middleware**: Custom Next.js middleware (`src/proxy.ts`) for subdomain-based multi-tenancy.
- **Storage**: Cloudflare R2 Buckets (School assets).
- **Auth**: Clerk (Integration pending).
- **Styling**: Tailwind CSS.

---

## 📊 Data Aggregation & Tables (`@backend/data`)

The `/src/app/(admin)/(tables)/**` routes are powered by a dedicated data aggregation layer in `@backend/data/`. This separation ensures that complex data transformations, statistical calculations, and business logic are decoupled from the UI components.

- **Data Models**: `BookingData.ts`, `StudentData.ts`, `TeacherData.ts` define the shape of the aggregated data, combining database schemas with computed statistics.
- **Statistical Calculators**: Files like `BookingStats.ts`, `StudentStats.ts` contain pure functions (e.g., `calculateBookingStats`) that compute metrics like total revenue, lesson counts, and financial balances.
- **Master Tables**: The Admin UI uses these pre-calculated stats to render performant and rich data tables (e.g., `BookingsTable`, `StudentsTable`) without needing heavy client-side computation.

## 📂 Developer File Structure

The project follows a domain-driven structure separating business logic from the UI framework.

```text
/
├── backend/                 # Core Business Logic (Framework Agnostic)
│   ├── classboard/          # Scheduling Engine (GlobalFlag, QueueController, TeacherQueue)
│   ├── data/                # Data Aggregation & Stats (BookingStats, TeacherStats)
│   ├── logger.ts            # Centralized Logging (DevOps Standard)
│   ├── error-handlers.ts    # Standardized Error Responses
│   └── ...
├── cloudflare/              # R2 Bucket Management Scripts
├── config/                  # Static Configurations & Navigation Routes
├── getters/                 # Data Retrieval Helpers (Supabase Typed Queries)
├── src/
│   ├── app/                 # Next.js App Router Pages
│   ├── components/          # React Components (UI)
│   │   └── onboarding/      # Onboarding flows & guides
│   ├── proxy.ts             # Middleware (Subdomain Routing & Context Injection)
│   └── ...
├── supabase/                # Database Configuration
│   ├── migrations/          # SQL Schemas (School, Student, Teacher, Booking, etc.)
│   └── ...
└── ...
```

## ⚙️ Global Configuration (`/config`)

This directory is the central registry for static definitions, ensuring consistency across the app.

- **Entities**: Definitions for `equipment.ts`, `countries.ts`, and `filterOptions.ts`.
- **Navigation**: Route definitions for different actors (`admin-nav-routes.ts`, `teacher-nav-routes.ts`).
- **Tables**: Column definitions and display logic for the data grid (`tables.ts`).

## ✅ Validation & Type Safety (`@src/validation`)

We use **Zod** for runtime validation and type inference across the "5 Pillars" of the system. This ensures data integrity when creating or updating core entities:

- **Bookings**: `booking.ts`
- **Equipment**: `equipment.ts`
- **Packages**: `school-package.ts`
- **Students**: `student.ts`
- **Teachers**: `teacher.ts`

These schemas are used both in frontend forms and server actions to provide a single source of truth for entity requirements.

## 🔐 Middleware & Multi-tenancy

The application handles multi-tenancy via **Subdomains** managed by `@src/proxy.ts`.

1.  **Resolution**: `school-name.adrenalink.tech` -> Resolves to School ID.
2.  **Context Injection**: Middleware injects `x-school-id` and `x-school-timezone` headers into every request.
3.  **Consumption**: `@backend/school-context.ts` is the standardized utility to retrieve this context server-side.

## 🛠 Backend & DevOps Standards

### Logging (`@backend/logger.ts`)

We enforce a strict centralized logging pattern. **Do not use `console.log` directly.**

```typescript
import { logger } from "@/backend/logger";

// Info with context
logger.info("Booking created", { bookingId: "123", schoolId: "..." });

// Error with full stack trace
logger.error("Failed to sync calendar", error, { severity: "high" });
```

### Error Handling (`@backend/error-handlers.ts`)

Use standardized wrappers for Supabase operations to handle Unique Constraints, Foreign Keys, and Auth errors uniformly.

## 📊 Domain Models & Routes

### 1. Admin (School)

The command center for school owners.

- **Classboard**: A complex, real-time lesson management interface powered by a Linked-List Queue system (`@backend/classboard/**`). Handles conflict detection, gap optimization, and drag-and-drop scheduling.
- **Data/Tables**: Master tables for Students, Teachers, Equipment, Packages.
- **Transactions**: Real-time financial overview (Revenue, Commission, Profit) calculated in `ClassboardStatistics.ts`.
- **Register**: Master booking forms.

### 2. Users (Student & Teacher)

- **Student Portal**: Interface for users to book packages, view reservations, and pay.
- **Teacher Portal**: Mobile-first view for instructors to see their daily timeline and update lesson statuses (`planned` -> `completed`).

### 3. Sync Engine

Data is synchronized in real-time between these three actors using Supabase Realtime channels.

## 💾 Database Schema (`@supabase/migrations`)

Key domains managed in PostgreSQL:

- **School**: Tenant root, subscriptions, settings.
- **Users**: `student`, `teacher` (linked via `school_students`, `teacher` tables).
- **Operations**:
    - `booking`: High-level reservation.
    - `lesson`: Assigns a teacher to a booking.
    - `event`: Atomic unit of time/location/status (The core of the Classboard).
- **Inventory**: `equipment`, `school_package`.

### ⚡️ Remote Procedure Calls (`@supabase/rpc`)

We utilize Postgres Functions (RPCs) for heavy data aggregation and encapsulating critical business logic closer to the data. This ensures performance and data consistency.

- **`get_event_transaction`**: The core function for the Classboard and Transaction views. It enriches raw event data with:
    - **Financials**: Calculates Gross Revenue, Commission (Fixed/Percentage), and Net Profit on the fly.
    - **Context**: Joins Student names, Equipment details, and Package info.
    - **Time**: Returns Wall Clock Time for accurate scheduling.
- **`get_student_booking_status`**: Aggregates booking counts, active/completed status, and total hours for the Student table view.

## ☁️ Cloudflare Integration

School assets (logos, images, media) are stored in Cloudflare R2 buckets, managed via scripts in the `/cloudflare` directory.

## 🔑 Environment Variables (`.env.local`)

Configure these variables for your environment.

### Core (Supabase & Database)

Required for DB connection, auth, and realtime.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key # Required for seeding/admin scripts
DATABASE_URL=postgres://... # Direct connection string (Transaction pooler)
DATABASE_DIRECT_URL=postgres://... # Session connection string (Migration/Direct)
```

### Storage (Cloudflare R2)

Required for asset management (`/src/app/api/cloudflare/**`).

```bash
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=adrenalink-assets
CLOUDFLARE_R2_PUBLIC_URL=https://assets.adrenalink.tech
# 'SUDO' keys required only for destructive bucket operations (rm-bucket.ts)
SUDO_CLOUDFLARE_R2_ACCESS_KEY=...
SUDO_CLOUDFLARE_R2_SECRET_KEY=...
```

### Third Party Services

```bash
# Google Maps (Places Autocomplete & Timezone)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# Mux Video (Onboarding)
NEXT_PUBLIC_MUX_ONBOARDING_PLAYBACK_ID=...

# Email Service
EMAIL_API_URL=...
EMAIL_API_KEY=...
```

### Development & Feature Flags

Useful for local testing without full auth/data setup.

```bash
# Bypassing Auth (Development Only)
NEXT_PUBLIC_DISABLE_AUTH=true
NEXT_PUBLIC_DEFAULT_ROLE=admin
NEXT_PUBLIC_DEFAULT_USER_ID=dev-user
NEXT_PUBLIC_DEFAULT_SCHOOL_ID=school_001

# Debugging
JSONIFY=true             # Enables granular JSON debug output in UI components
PRINTF=TRUE              # Enables internal backend logging
DEBUG_DB_QUERIES=true    # Log raw DB queries
DEBUG_PERFORMANCE=true   # Log performance metrics
```
