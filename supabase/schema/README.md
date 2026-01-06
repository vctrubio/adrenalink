# Adrenalink Schema Files

Modular SQL schema organized by domain. Load order is defined in [`../schema.toml`](../schema.toml).

## Files

### **school.sql** - School Management
Creates foundational tables for schools and their offerings:
- `school` - School accounts with credentials, location, settings
- `school_package` - Service packages offered by schools (duration, price, capacity)
- `school_subscription` - Subscription tiers and billing for schools

### **student.sql** - Student Management
Tables for students and their relationships to schools:
- `student` - Student profiles (first_name, last_name, passport, country, phone with +country_code, languages array)
- `school_students` - Association between students and schools (many-to-many, school_id FK, student_id FK, active, rental flags)
- `student_package` - Student enrollment in school packages (school_package_id FK, status: purchased|pending, referral_id FK optional, wallet_id)

### **teacher.sql** - Teacher Management
Teacher profiles and compensation:
- `teacher` - Teacher profiles (school_id FK, name, passport, languages, active status)
- `teacher_commission` - Commission rules for lessons (type: percentage|fixed, cph: commission per hour)
- `teacher_equipment` - Equipment assignments to teachers (many-to-many junction, active status)

### **equipment.sql** - Equipment Inventory
Equipment tracking and maintenance:
- `equipment` - Equipment inventory (brand, model, color, size NUMERIC, category, status: public|rental, school_id FK)
- `equipment_repair` - Service records for equipment maintenance
- `equipment_event` - Junction table linking equipment to events (many-to-many)

### **booking.sql** - Bookings & Lessons
Core booking and lesson management:
- `booking` - Student group bookings (school_id FK, school_package_id FK, date_start/end, status, leader_student_name)
  - **CONSTRAINT:** `booking_student` count MUST equal `school_package.capacity_students`
- `booking_student` - Students enrolled in a booking (many-to-many, primary key enforcement)
- `lesson` - Individual lessons taught by teachers (school_id FK, teacher_id FK, booking_id FK, commission_id FK, status)
  - **CONSTRAINT:** One lesson per booking (1:1 with booking)
  - One teacher assigned per booking
- `event` - Events/sessions within lessons (school_id FK, lesson_id FK, date timestamp, duration minutes, location, status)
  - Event date/duration derived from booking date + school_package duration_minutes

### **rental.sql** - Equipment Rentals
Equipment rental management:
- `rental` - Equipment rental records with dates and location
- `rental_student` - Students in a rental (many-to-many)
- `rental_equipment` - Equipment in a rental (many-to-many)

### **feedback.sql** - Feedback & Referrals
Student feedback and referral programs:
- `student_lesson_feedback` - Post-lesson feedback from students
- `referral` - Referral codes and commission rules for student recruitment

### **payment.sql** - Payment Records
Financial transactions:
- `teacher_lesson_payment` - Payments to teachers for lessons
- `student_booking_payment` - Charges to students for bookings
- `subscription_payment` - Payments for school subscriptions

### **realtime.sql** - Real-time Subscriptions
Enables Supabase Realtime listeners:
- Adds `booking`, `event`, `lesson` tables to the publication
- Allows frontend to subscribe to live updates
