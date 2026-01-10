# Database Schema - Adrenalink

Pure PostgreSQL schema for Supabase, structured as modular SQL files with explicit dependency ordering.

## File Organization & Load Order

The schema is split into 12 files, loaded in strict dependency order to resolve all foreign key references:

```
1. school.sql
   - school
   - school_package
   - school_subscription
   - referral (moved here for early availability)

2. student.sql
   - student
   - school_students
   - student_package

3. teacher.sql
   - teacher
   - teacher_commission

4. booking.sql
   - booking
   - booking_student

5. lesson.sql
   - lesson

6. event.sql
   - event

7. equipment.sql
   - equipment
   - equipment_repair
   - equipment_event

8. teacher-equipment.sql
   - teacher_equipment (must come after equipment)

9. rental.sql
   - rental
   - rental_student
   - rental_equipment

10. feedback.sql
    - student_lesson_feedback

11. payment.sql
    - teacher_lesson_payment
    - student_booking_payment
    - subscription_payment

12. realtime.sql
    - ALTER PUBLICATION statements for Realtime
```

## Critical Dependencies

**Why this order matters:**

- `school` must be first (base entity, referenced by most tables)
- `student`, `teacher` depend on `school`
- `booking` depends on `school` + `school_package`
- `lesson` depends on `booking` + `teacher` + `teacher_commission`
- `event` depends on `lesson`
- `equipment` depends on `event` (equipment_event junction table)
- `teacher_equipment` must come after `equipment` (references both teacher + equipment)
- `rental` depends on `school_subscription`
- `feedback` depends on `student` + `lesson`
- `payment` depends on `teacher`, `student`, `booking`, `school_subscription`

## Key Schema Features

### School & Packages

- `school`: Core school account with wallet_id for future Clerk integration
- `school_package`: Lesson/rental packages with capacity_students & capacity_equipment
- `referral`: Referral codes with commission tracking (in school.sql for early availability)

### Students

- `student`: Base student data with country phone code
- `school_students`: Many-to-many junction with rental flag
- `student_package`: Individual package bookings

### Teachers & Equipment

- `teacher`: Base teacher data
- `teacher_commission`: Configurable commission rates (percentage or fixed)
- `equipment`: Equipment with brand, NUMERIC(4,1) size (supports decimals like 3.5, 4.7)
- `teacher_equipment`: Junction table linking teachers to equipment (created after equipment)

### Bookings & Lessons

- `booking`: References school_package directly (not student_package)
- `booking_student`: Many-to-many students per booking (enforced to match capacity_students)
- `lesson`: One teacher per booking, one lesson per booking (1:1 with booking)
- `event`: Dates/times for lessons, created from lesson

### Equipment Management

- `equipment_event`: Junction table (equipment used in events)
- `equipment_repair`: Track maintenance/repairs

### Rentals

- `rental`: Standalone rental requests (separate from bookings)
- `rental_student`: Students participating in rental
- `rental_equipment`: Equipment assigned to rental

### Payments & Feedback

- `teacher_lesson_payment`: Teacher earnings from lessons
- `student_booking_payment`: Student payments for bookings
- `subscription_payment`: Subscription/membership charges
- `student_lesson_feedback`: Feedback form submissions

## Key Constraints

### Booking Capacity

```sql
-- Enforced in application: COUNT(booking_student) = school_package.capacity_students
-- Example: Group package (4 students) MUST have exactly 4 booking_student rows
```

### Equipment Sizes

```sql
-- NUMERIC(4, 1) allows: 3.5, 4.7, 5.2, 12.0, etc.
-- Stores with 4 total digits, 1 decimal place
```

### Text-Based Enums

All enum fields are TEXT for flexibility:

- `school.status`: 'beta', 'active', 'pending', 'closed'
- `school_package.category_equipment`: 'kite', 'wing', 'windsurf'
- `booking.status`: 'confirmed', 'completed', 'cancelled'
- See `supabase/db/enums.ts` for validation

## Migration File

Generated migration consolidates all 12 schema files:

- Path: `supabase/migrations/20250106000000_adrenalink_complete_schema.sql`
- Size: ~360 lines
- Contains: All 22 tables, indexes, foreign keys in correct order

## Current Seeded Data

- 1 School: Reva Kite School
- 2 Teachers with 3 commissions each
- 8 Students (with country phone codes: +34, +49, +33, etc.)
- 36 Equipment (12 kites, 12 wings, 12 windsurfs)
- 15 School packages (5 per sport)
- 60 Bookings (today to +3 days)
- 60 Lessons & Events
- All relationships and payments created

## Migration & Deployment

### Local Development

```bash
# Supabase reads from config.toml schema_paths
supabase db push --linked --yes
```

### Production

- Single consolidated migration file handles all 22 tables
- No need to manage 12 separate migration files
- All dependencies resolved in correct order
