# Database Entities & User Story

## Naming Conventions

### Junction Tables (Many-to-Many)
Format: `EntityA + EntityB`
- **school_students** - Links schools to students (enrollment)
- **booking_student** - Links bookings to students (who's in the booking)

### Owned Entities  
Format: `Owner + Entity`
- **school_package** - Packages created/owned by schools
- **student_package** - Requests created by students

## Entity Responsibilities

### Core Entities

#### **School**
- Represents kite schools/instructors
- Creates packages for different activities
- Manages bookings and student enrollments
- Has unique username for identification

#### **Student** 
- Represents individual learners
- Can enroll in schools
- Requests packages through student_package
- Gets linked to bookings when schools accept requests

#### **SchoolPackage**
- Training packages offered by schools
- Defines: duration, price, capacity, equipment category
- Equipment categories: kite, wing, windsurf, surf, snowboard
- Can be public or private
- Has student and equipment capacity limits

### Request & Booking Flow

#### **StudentPackage** (Request)
- Student's request for a specific package
- Includes requested start/end dates
- Status: `requested` → `accepted` → `rejected`
- Links student to desired school package

#### **Booking** (Actual Reservation)
- Created by school when accepting student requests
- Actual scheduled session with specific dates
- Can optionally link back to originating student_package
- Links to school_package and school

#### **BookingStudent** (Many-to-Many)
- Junction table linking bookings to students
- Allows multiple students in one booking session
- Handles capacity when `capacity_students > 1`

### Enrollment

#### **SchoolStudents** (Many-to-Many)
- Student enrollment in schools
- Tracks which students belong to which schools
- Optional description field
- Active/inactive status

## User Story Flow

### 1. **Setup Phase**
- Schools create accounts with usernames
- Schools create packages (kite lessons, wing foiling, etc.)
- Students create accounts and enroll in schools

### 2. **Package Discovery**
- Students browse available packages from their schools
- View package details: duration, price, capacity, equipment type

### 3. **Request Flow**
- Student selects a package and requests specific dates
- Creates `student_package` with status: "requested"
- School receives notification of new request

### 4. **Booking Creation**
- School reviews student request
- If accepted: School creates `booking` with actual dates
- Links `booking` to originating `student_package`
- Updates `student_package` status to "accepted"

### 5. **Multi-Student Bookings**
- When `capacity_students > 1`, school can add more students
- Additional students linked via `booking_student` junction table
- Students can see their bookings on their profile

### 6. **Visibility**
- **Students**: See their requests, booking status, upcoming sessions
- **Schools**: Manage packages, review requests, schedule bookings
- **Bookings**: Visible to both school and all linked students

## Future Considerations

### Capacity Handling
- **Current**: Single student requests → single bookings
- **Future**: Handle group requests or school-initiated group bookings
- **Challenge**: How to link multiple students in initial request phase

### Equipment Management
- Track actual equipment used per booking
- Link equipment availability to package capacity
- Handle equipment-specific requirements per student

### Payment Integration
- Link student_package to payment status
- Handle pricing for group vs individual bookings
- Track payment per student in multi-student bookings