# Master Booking Form (Register)

## Overview

The Master Booking Form is a comprehensive multi-entity booking system located at `/register` that allows schools to create bookings by composing multiple entities (packages, students, teachers, commissions) in a single user-friendly interface.

## Purpose

This feature consolidates the entire booking creation workflow into a single route with a controller-based UI that guides users through all required steps. It eliminates the need to navigate between different pages to create the entities required for a booking.

## Key Features

### 1. Controller-Based Navigation
- **Desktop**: Sticky left sidebar controller (2/5 grid columns)
- **Mobile**: Top card controller with collapsible layout
- **Quick Actions**: Four entity buttons with colored icons (Booking, Student, Package, Teacher)
- **School Branding**: Avatar with school initials and username display

### 2. Booking Summary (Always Visible)
The controller displays a real-time summary of all required booking components:
- **Dates**: Start and end dates with visual status
- **Package**: Selected schoolPackage with price and capacity
- **Students**: List of selected students with count validation
- **Teacher**: Selected teacher with commission details
- **Commission**: Teacher's hourly rate (CPH)

**Visual Status Indicators**:
- Blue background (completed): Requirement complete
- Purple background (tbc): Partial completion (e.g., some students selected but not at capacity)
- Grey background (planned): Requirement missing

All status colors are defined in `types/status.ts` using the event status configuration.

**Interactive Summary**:
- All summary items are clickable buttons
- Clicking scrolls to the relevant section and expands it automatically
- Provides quick navigation to incomplete requirements

### 3. Smart Form Switching
The Quick Actions buttons use intelligent routing logic:
- **Booking**: Switches to booking form (default view)
- **Student**: Switches to student creation form (for adding new students)
- **Package**: Switches to booking form and scrolls to package section
- **Teacher**: Switches to booking form and scrolls to teacher section

This design recognizes that Package and Teacher are selections within the booking flow, while Student is an independent entity that can be created separately.

### 4. URL Parameter Support
Supports pre-selection via URL parameters:
- `?studentId=xxx`: Pre-selects a student and filters packages by capacity=1
- Useful for creating bookings directly from student profiles
- Auto-expands the students section when pre-selected

### 5. Collapsible Sections
Each booking component is organized in expandable sections:
- **Dates Section**: Date range picker (start/end)
- **Package Section**: Grid of available schoolPackages with details
- **Students Section**: Multi-select grid with capacity validation
- **Teacher Section**: Teacher selection with commissions
- **Commission Section**: Commission type and rate selection

Sections automatically collapse when complete and expand when clicked from the summary.

### 6. Validation and Error Handling
- **Capacity Validation**: Prevents selecting more students than package capacity
- **Required Field Validation**: Ensures all requirements met before submission
- **Date Validation**: Start date must be before end date
- **Real-time Status Updates**: Summary updates immediately as selections change
- **Loading States**: Disabled buttons and loading indicators during submission

## Data Model

### Booking Creation Flow

The system follows this specific entity creation sequence:

1. **schoolPackage** (Template)
   - Pre-existing packages offered by the school
   - Defines capacity, price, duration, type
   - Selected from available options

2. **studentPackage** (Request)
   - Created when booking is initiated
   - Links to selected schoolPackage
   - Contains walletId (TODO: implement via UserWalletProvider)
   - Has status: requested/accepted/rejected
   - Date range: dateStart, dateEnd

3. **studentPackageStudent** (Many-to-Many Junction)
   - Links students to the studentPackage
   - TODO: Add referral field support
   - Created for each selected student

4. **booking** (Confirmed Reservation)
   - Created after studentPackage is established
   - Links to the studentPackage
   - Contains final date range

5. **bookingStudent** (Many-to-Many Junction)
   - Links students to the booking
   - Mirrors the studentPackageStudent relationships

6. **lesson** (Teaching Assignment)
   - Links booking to teacher and commission
   - Defines the teaching arrangement and payment

### Entity Relationships

```
schoolPackage (1) → (many) studentPackage
studentPackage (many) ←→ (many) student [via studentPackageStudent]
studentPackage (1) → (many) booking
booking (many) ←→ (many) student [via bookingStudent]
booking (1) ← (1) lesson → (1) teacher
lesson → (1) commission
school (1) → (many) schoolPackage
school (1) → (many) teacher
school (many) ←→ (many) student [via schoolStudent]
```

## Technical Architecture

### Components

#### MasterBookingForm.tsx (Client Component)
- Main container component
- Manages all state (selections, form type, expanded sections)
- Handles submission orchestration
- Provides scroll-to-section functionality
- Supports mobile/desktop responsive layouts

**Key State**:
```typescript
const [activeForm, setActiveForm] = useState<FormType>("booking");
const [selectedPackage, setSelectedPackage] = useState<any>(null);
const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
const [selectedCommission, setSelectedCommission] = useState<any>(null);
const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set());
```

**Key Functions**:
```typescript
const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            newSet.add(sectionId as SectionId);
            return newSet;
        });
    }
};
```

#### MasterBookingController.tsx (Client Component)
- Sidebar/top controller component
- Displays Quick Actions for form switching
- Shows real-time Booking Summary
- Provides Create Booking and Reset buttons
- Handles click-to-scroll navigation

**Smart Click Handlers**:
```typescript
const handleClick = () => {
    if (form.id === "student") {
        setActiveForm("student");
    } else if (form.id === "package") {
        setActiveForm("booking");
        setTimeout(() => onScrollToSection("package-section"), 100);
    } else if (form.id === "teacher") {
        setActiveForm("booking");
        setTimeout(() => onScrollToSection("teacher-section"), 100);
    } else {
        setActiveForm("booking");
    }
};
```

#### page.tsx (Server Component)
- Fetches all required data server-side
- Handles error states for failed data fetching
- Passes data as props to MasterBookingForm

**Data Fetching**:
```typescript
const [schoolResult, packagesResult, teachersResult, studentsResult] = await Promise.all([
    getSchoolInfo(),
    getSchoolPackages(),
    getSchoolTeachers(),
    getSchoolStudents(),
]);
```

### Server Actions

Located in `actions/dev-register-action.ts`:

#### Data Retrieval
- `getSchoolInfo()`: Fetches school details by TEST_SCHOOL_ID
- `getSchoolPackages()`: Fetches packages for the school
- `getSchoolTeachers()`: Fetches teachers with their commissions
- `getSchoolStudents()`: Fetches students linked to the school

#### Entity Creation
- `createDevStudentPackage(schoolPackageId, walletId, dateStart, dateEnd)`: Creates studentPackage
- `linkStudentToStudentPackage(studentPackageId, studentId)`: Links student to studentPackage
- `createDevBooking(studentPackageId, dateStart, dateEnd)`: Creates booking
- `linkStudentToBooking(bookingId, studentId)`: Links student to booking
- `createDevLesson(bookingId, teacherId, commissionId)`: Creates lesson

### Submission Flow

```typescript
const handleSubmit = async () => {
    setLoading(true);

    try {
        // 1. Create studentPackage (request)
        const studentPackageResult = await createDevStudentPackage(
            selectedPackage.id,
            TEST_WALLET_ID,
            dateRange.startDate,
            dateRange.endDate
        );

        // 2. Link students to studentPackage
        for (const studentId of selectedStudentIds) {
            await linkStudentToStudentPackage(
                studentPackageResult.data.id,
                studentId
            );
        }

        // 3. Create booking
        const bookingResult = await createDevBooking(
            studentPackageResult.data.id,
            dateRange.startDate,
            dateRange.endDate
        );

        // 4. Link students to booking
        for (const studentId of selectedStudentIds) {
            await linkStudentToBooking(
                bookingResult.data.id,
                studentId
            );
        }

        // 5. Create lesson
        await createDevLesson(
            bookingResult.data.id,
            selectedTeacher.id,
            selectedCommission.id
        );

        handleReset();
        router.refresh();
        alert("Booking created successfully!");
    } catch (err) {
        setError("An unexpected error occurred");
    } finally {
        setLoading(false);
    }
};
```

## User Experience Flow

### Desktop Experience
1. User lands on `/register` with sticky left sidebar controller
2. Default view shows booking form with collapsible sections
3. User can see summary of requirements at all times
4. Clicking summary items scrolls to and expands relevant sections
5. Quick Actions allow switching between entity creation
6. Submit button enabled only when all requirements met
7. Success triggers reset and refresh

### Mobile Experience
1. User lands on `/register` with top card controller
2. Controller shows Quick Actions and summary in compact layout
3. Form sections render below controller
4. Same click-to-scroll and validation behavior
5. Touch-friendly buttons and spacing
6. Responsive grid layouts (2 columns for Quick Actions)

### Pre-selection via URL
1. User clicks "Create Booking" from student profile
2. URL includes `?studentId=xxx` parameter
3. Form pre-selects the student
4. Package section auto-filters to show capacity=1 packages
5. Students section auto-expands showing pre-selected student
6. User only needs to select package, teacher, dates

## Styling and Design

### Color System
- **Entity Colors**: Defined in `config/entities.ts`
  - Booking: Blue
  - Student: Green
  - Package: Purple
  - Teacher: Orange
- **Semantic Colors**: Uses Tailwind semantic tokens for dark mode
  - `bg-card`, `bg-background`, `bg-muted`
  - `text-foreground`, `text-muted-foreground`
  - `border-border`, `border-primary`
- **Status Colors**:
  - Complete: `bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800`
  - Partial: `bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800`
  - Missing: `bg-muted/30 border-border`

### Layout
- **Desktop Grid**: `lg:grid-cols-5` with controller at `lg:col-span-2` and form at `lg:col-span-3`
- **Mobile Stack**: Single column layout with controller card above form
- **Spacing**: Consistent `p-6` for cards, `space-y-6` for sections
- **Borders**: Subtle borders with `border-border` for semantic consistency
- **Shadows**: Card elevation with `shadow-lg` for depth

### Icons
- Entity icons from `config/entities.ts`
- Filled and colored: `<Icon fill={entity.color} />`
- Icon wrapper with color styling for consistency
- Active state shows subtle background tint: `${entity.color}15`

## Future Enhancements (TODOs)

### 1. Wallet ID Integration
**Location**: `createDevStudentPackage()` action
**Description**: Replace `TEST_WALLET_ID` with actual user wallet
**Implementation**:
- Migrate `UserWalletProvider` from `@kite-hostel`
- Update context to provide current wallet
- Pass wallet ID through form submission
- Update schema to properly link wallets to studentPackages

### 2. Student Creation Integration
**Description**: Implement the student creation form when "Student" Quick Action is selected
**Implementation**:
- Create `StudentForm.tsx` component
- Import student creation action
- Handle success by refreshing student list and switching back to booking form
- Pre-select newly created student

### 3. Package Creation Integration
**Description**: Allow creating custom packages on-the-fly
**Implementation**:
- Add "Create Custom Package" option in package section
- Modal or inline form for package creation
- Immediate selection of newly created package

### 4. Commission Management
**Description**: Allow teachers to add commissions if none exist
**Implementation**:
- Detect teachers without commissions
- Provide inline commission creation form
- Link commission to teacher immediately

### 5. Booking Confirmation
**Description**: Replace alert with proper confirmation UI
**Implementation**:
- Success screen with booking details
- Links to view booking in classboard
- Option to create another booking

## Testing Scenarios

### Happy Path
1. Select package
2. Select correct number of students
3. Select teacher
4. Select commission
5. Set date range
6. Submit successfully

### Validation Scenarios
1. Attempt submit without package → Button disabled
2. Select too many students → Error message, selection blocked
3. Select students before package → Disabled with helper text
4. Invalid date range → Error message on submit
5. Missing teacher → Button disabled
6. Missing commission → Button disabled, prompt shown

### URL Parameter Scenarios
1. Valid `?studentId=xxx` → Pre-selects student
2. Invalid `?studentId=xxx` → Gracefully handles, shows all students
3. Pre-selected student from URL → Filters packages by capacity

### Mobile Scenarios
1. Controller renders at top
2. Quick Actions grid renders properly
3. Summary items remain clickable
4. Scroll behavior works smoothly
5. Touch targets are appropriately sized

## Performance Considerations

### Server-Side Data Fetching
- All data fetched in parallel using `Promise.all()`
- Single round-trip to database per request
- Reduces initial load time

### Client-Side Optimization
- Collapsible sections reduce DOM size
- Controlled expansion state prevents unnecessary renders
- Debounced scroll handlers for smooth navigation

### Responsive Design
- Mobile-first CSS with `lg:` breakpoints
- Conditional rendering for mobile/desktop layouts
- Single source of truth for controller logic

## Accessibility

### Keyboard Navigation
- All summary items are focusable buttons
- Tab order follows logical flow
- Enter key activates buttons

### Screen Readers
- Semantic HTML structure
- Descriptive button labels
- Status indicators with text labels (not just colors)

### Visual Feedback
- Clear focus states on all interactive elements
- Distinct hover states for buttons
- Loading states with disabled buttons

## Related Documentation

- [Classboard - Teacher Queue & Classes](./classboard-teacher-queue.md)
- [Entity Configuration](../config/entities.md)
- [Data Model Architecture](../architecture/data-model.md)
- [Server Actions Pattern](../architecture/server-actions.md)
