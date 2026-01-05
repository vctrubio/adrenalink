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
- `student` - Student profiles (name, passport, languages)
- `school_students` - Association between students and schools (many-to-many)
- `student_package` - Student enrollment in school packages

### **teacher.sql** - Teacher Management
Teacher profiles and compensation:
- `teacher` - Teacher profiles (name, passport, languages)
- `teacher_commission` - Commission rules for lessons (hourly rates, commission types)

### **equipment.sql** - Equipment Inventory
Equipment tracking and maintenance:
- `equipment` - Equipment inventory (model, color, size, category)
- `equipment_repair` - Service records for equipment maintenance
- `equipment_event` - Junction table linking equipment to lessons

### **booking.sql** - Bookings & Lessons
Core booking and lesson management:
- `booking` - Student group bookings with dates and status
- `booking_student` - Students enrolled in a booking (many-to-many)
- `lesson` - Individual lessons taught by teachers
- `event` - Events/sessions within lessons with timing and location

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
