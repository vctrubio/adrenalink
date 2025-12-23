# Register Route Architecture & Hooks

## Overview

The register route uses a centralized context-based system with mutable state management, entity queues, and form submission tracking. The architecture separates concerns between:

- **Static Controller** - Left sidebar, persistent across all register routes
- **Dynamic Route Forms** - Right side content that changes based on route
- **Entity Add Dialogs** - Popovers for inline entity creation
- **Queue System** - Session-scoped, recently created entities

## Core Architecture

### 1. RegisterContext (`src/app/(admin)/register/RegisterContext.tsx`)

The single source of truth for all register data and state.

**Key Responsibilities:**
- Manages mutable data state: packages, students, teachers, referrals
- Manages entity queues: `{ students, teachers, packages, bookings }`
- Manages booking form state: selected entities, date range, leader student
- Manages entity form states: student, teacher, package form data
- Manages form validation & submission handlers

**Data Structure:**
```typescript
RegisterContextValue {
  // Mutable data
  data: RegisterTables
  setData: (data) => void
  refreshData: () => Promise<void>
  isRefreshing: boolean

  // Entity queues (session-scoped, in-memory)
  queues: {
    students: Array<{ id, name, timestamp }>
    teachers: Array<{ id, name, timestamp }>
    packages: Array<{ id, name, timestamp }>
    bookings: Array<{ id, name, timestamp }>
  }
  addToQueue: (type, item) => void
  removeFromQueue: (type, id) => void
  clearQueue: (type) => void

  // Optimistic updates (add to beginning of arrays)
  addStudent: (student) => void
  addTeacher: (teacher) => void
  addPackage: (pkg) => void

  // Booking form state
  bookingForm: BookingFormState
  setBookingForm: (updates) => void
  resetBookingForm: () => void

  // Entity form states
  studentForm: StudentFormData | null
  setStudentForm: (form) => void
  teacherForm: TeacherFormData | null
  setTeacherForm: (form) => void
  packageForm: PackageFormData | null
  setPackageForm: (form) => void

  // Form validation & submission
  isStudentFormValid: boolean
  setStudentFormValid: (valid) => void
  isTeacherFormValid: boolean
  setTeacherFormValid: (valid) => void
  isPackageFormValid: boolean
  setPackageFormValid: (valid) => void
  onStudentSubmit?: () => Promise<void>
  setStudentSubmit: (handler) => void
  onTeacherSubmit?: () => Promise<void>
  setTeacherSubmit: (handler) => void
  onPackageSubmit?: () => Promise<void>
  setPackageSubmit: (handler) => void
}
```

### 2. Hook System

#### Core Hooks

**`useRegisterData()`** - Read register data
```typescript
const data = useRegisterData(); // Returns: RegisterTables
// data.school, data.packages, data.students, data.teachers, data.referrals
// data.studentBookingStats, data.teacherLessonStats
```

**`useRegisterActions()`** - Optimistic update & queue management
```typescript
const { addStudent, addTeacher, addPackage, addToQueue, removeFromQueue, clearQueue, refreshData, isRefreshing } = useRegisterActions();
```

**`useRegisterQueues()`** - Read queue state
```typescript
const queues = useRegisterQueues(); // Returns: { students, teachers, packages, bookings }
```

**`useBookingForm()`** - Manage booking form state
```typescript
const { form, setForm, reset } = useBookingForm();
// form: { selectedPackage, selectedStudentIds, selectedTeacher, selectedCommission, selectedReferral, dateRange, leaderStudentId }
```

**`useStudentFormState()`** - Manage student form persistence
```typescript
const { form, setForm } = useStudentFormState();
// form: StudentFormData | null
```

**`useTeacherFormState()`** - Manage teacher form persistence
```typescript
const { form, setForm } = useTeacherFormState();
// form: TeacherFormData | null
```

**`usePackageFormState()`** - Manage package form persistence
```typescript
const { form, setForm } = usePackageFormState();
// form: PackageFormData | null
```

**`useFormSubmission()`** - Access form validation & submission handlers
```typescript
const {
  isStudentFormValid, setStudentFormValid, onStudentSubmit, setStudentSubmit,
  isTeacherFormValid, setTeacherFormValid, onTeacherSubmit, setTeacherSubmit,
  isPackageFormValid, setPackageFormValid, onPackageSubmit, setPackageSubmit
} = useFormSubmission();
```

## Component Architecture

### Layout Structure

```
RegisterLayout (app/(admin)/register/layout.tsx)
├─ RegisterProvider (provides context)
└─ RegisterLayoutContent (client component)
   ├─ RegisterController (static left sidebar)
   │  └─ Shows booking form or entity form summaries
   │  └─ Shows queue badges
   │  └─ Shows submit buttons based on active form
   └─ RegisterFormLayout (animates content)
      └─ form (dynamic children based on route)
```

### RegisterController (`src/app/(admin)/register/RegisterController.tsx`)

**Static left sidebar** - Always visible, doesn't change on route navigation

**Responsibilities:**
- Display school header
- Show form selector (booking | student | teacher | package)
- Display form summaries based on `activeForm` prop
- Display queue badges
- Show submit buttons appropriate to active form

**Form-Specific Behavior:**
- **Booking Form**: Show booking summary, leader student selector, submit "Create Booking" or "Create Booking with Lesson"
- **Student Form**: Show student summary, submit "Create Student"
- **Teacher Form**: Show teacher summary, submit "Create Teacher"
- **Package Form**: Show package summary, submit "Create Package"

**Props:**
```typescript
activeForm: "booking" | "student" | "teacher" | "package"
isStudentFormValid: boolean
isTeacherFormValid: boolean
isPackageFormValid: boolean
onStudentSubmit?: () => Promise<void>
onTeacherSubmit?: () => Promise<void>
onPackageSubmit?: () => Promise<void>
// ... booking form props
```

### Dynamic Route Forms

#### `/register` (Master Booking Form)

**File:** `src/app/(admin)/register/page.tsx`

**Features:**
- Select package → students → teacher/commission → dates
- Inline "+ Add" buttons in section headers to add entities via popovers
- On entity creation:
  - Add to queue (badge appears in controller)
  - Add to table (optimistic update)
  - Navigate with `?add=entity:id` param
  - Auto-expand section and select entity
  - Badge auto-dismisses

**Sections (with inline add dialogs):**
1. **PackageSection** - Select package, add package via popover
2. **StudentsSection** - Select students, add student via popover
3. **TeacherSection** - Select teacher, add teacher via popover
4. **DateSection** - Select date range
5. **ReferralSection** - Select referral (optional)

#### `/register/student` (Student Creation Route)

**File:** `src/app/(admin)/register/student/page.tsx`

**Features:**
- Render StudentForm
- Register form state with context
- Register submit handler with context
- On submission: Add to queue, update table
- Form state persists via context when navigating back

**Flow:**
1. User fills form → form state updates in context
2. Form validity tracked via `setStudentFormValid`
3. RegisterController reads `isStudentFormValid` and `onStudentSubmit`
4. User clicks "Create Student" button in controller
5. Calls registered submit handler from context
6. Creates student via server action
7. Updates context data (optimistic)
8. Adds to queue
9. Toast on success/error

#### `/register/teacher` & `/register/package`

Same pattern as student route.

### Entity Add Dialogs (`src/components/ui/EntityAddDialog.tsx`)

**Simple Headless Dialog** - No title or header, just form + buttons

**Structure:**
```
EntityAddDialog
├─ Backdrop (with blur)
└─ Dialog.Panel
   └─ content (form + submit/cancel buttons)
```

**Usage in Sections:**
```typescript
<EntityAddDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
  <StudentForm formData={formData} onFormDataChange={setFormData} isFormReady={isValid} />

  {/* Submit button */}
  <div className="mt-6 flex gap-3">
    <button onClick={handleSubmit}>Add Student</button>
    <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
  </div>
</EntityAddDialog>
```

## Data Flow

### Adding Entity from Master Booking Form (via + Add button)

```
1. User clicks "+ Add" button in section header
   ↓
2. Dialog opens with form
   ↓
3. User fills form & clicks "Add Student"
   ↓
4. handleSubmit called (in StudentsSection):
   - Validates form via Zod schema
   - Calls createAndLinkStudent() server action
   ↓
5. On success:
   a. addStudent(newStudent) → updates context.data.students
   b. addToQueue('students', { id, name, timestamp })
   c. Dialog closes
   d. Router navigates to `/register?add=student:${id}`
   ↓
6. MasterBookingForm reads search param:
   - Expands students section
   - Selects student with matching ID
   - Removes from queue
   - Clears param from URL
   ↓
7. Queue badge disappears
   Student appears in table (already there from optimistic update)
```

### Adding Entity from Sub-Route (Student/Teacher/Package)

```
1. User on `/register/student` fills form
   ↓
2. Form state updates via setFormData()
   ↓
3. useEffect updates context: setStudentForm(formData)
   ↓
4. Form validity calculated: isFormValid = schema.safeParse()
   ↓
5. useEffect updates context: setStudentFormValid(isFormValid)
   ↓
6. useCallback wraps handleSubmit with dependencies: [isFormValid, formData, ...]
   ↓
7. useEffect registers handler: setStudentSubmit(() => handleSubmit)
   ↓
8. RegisterController reads isStudentFormValid and onStudentSubmit
   ↓
9. User clicks "Create Student" button in controller
   ↓
10. Calls onStudentSubmit (registered handler)
    ↓
11. handleSubmit executes:
    - Calls createAndLinkStudent() server action
    - On success:
      a. addStudent(newStudent) → updates context.data.students
      b. addToQueue('students', { id, name, timestamp })
      c. Toast success message
      d. Resets form
    ↓
12. Queue badge appears in controller
    Student appears in table
    ↓
13. User can click queue badge → navigates to `/register?add=student:${id}`
    ↓
14. On `/register` route, auto-selects student (same flow as #6 above)
```

### Route Transition Refresh

When user navigates between register routes:
```
/register/student → /register
   ↓
usePathname() effect detects change
   ↓
Calls refreshData() server action
   ↓
Server fetches fresh data from database
   ↓
Updates context.data with synced state
   ↓
Queue badges persist (in-memory, not persisted)
```

## Server Actions

### `/actions/register-action.ts`

All return `{ success: true, data: T }` or `{ success: false, error: string }`

**Entity Creation:**
- `createAndLinkStudent(studentData, canRent, description)` → `{ student, schoolStudent }`
- `createAndLinkTeacher(teacherData, commissionsData)` → `{ teacher, commissions }`
- `createAndLinkPackage(packageData)` → `schoolPackage`

**Booking:**
- `masterBookingAdd(packageId, studentIds, dateStart, dateEnd, teacherId?, commissionId?, referralId?, leaderStudentName?)` → `{ booking, lesson? }`

## Known Issues & TODOs

### Critical Issues

1. **Package Creation Fails** - `addPackage is not a function`
   - **Root Cause**: `package/page.tsx` imports `useRegisterData()` instead of `useRegisterActions()`
   - **Fix**: Change to `const { addPackage, addToQueue } = useRegisterActions();`
   - **Status**: Package IS created on server, but client error handling fails

2. **Teacher/Package Submit Not Wired**
   - **Status**: Same pattern as student exists but needs verification
   - **Fix**: Apply same error logging as package/page.tsx fix

### Architectural Improvements Needed

1. **Error Handling**: Use proper error boundary for form submissions
2. **Loading State**: Global loading state for form submissions (not per-page)
3. **Validation Display**: Show validation errors in summary before submit
4. **Form Persistence**: Currently uses context, could use URL state for sharability
5. **Queue UI**: Add timestamp-based auto-dismiss (e.g., 10 seconds)
6. **Type Safety**: Some `any` types in controller props, should be properly typed

### Code Cleanup

1. Remove unused `showSubmit` prop from form components (they never render submit buttons)
2. Consolidate error handling patterns across all three entity pages
3. Extract submit handler pattern to custom hook to reduce duplication
4. Add JSDoc comments to all context hooks

## Testing Checklist

- [ ] Create student from `/register` (+ Add button) → auto-selects in form
- [ ] Create student from `/register/student` → appears in queue
- [ ] Click queue badge → navigates to `/register`, auto-selects student
- [ ] Create teacher from master booking form
- [ ] Create package from master booking form
- [ ] Create booking with all entities
- [ ] Refresh page → queue badges persist, data syncs
- [ ] Navigate between routes → controller stays static, right side animates
- [ ] Validation prevents submit when form invalid
- [ ] Error messages show real server errors (not "An unexpected error occurred")

## File Reference

### Context & Hooks
- `src/app/(admin)/register/RegisterContext.tsx` - Main context provider and all hooks

### Layout
- `src/app/(admin)/register/layout.tsx` - Server layout wrapper
- `src/app/(admin)/register/RegisterLayoutContent.tsx` - Client content wrapper
- `src/components/layouts/RegisterFormLayout.tsx` - Form animation wrapper
- `src/app/(admin)/register/RegisterController.tsx` - Static left sidebar

### Pages
- `src/app/(admin)/register/page.tsx` - Master booking form
- `src/app/(admin)/register/student/page.tsx` - Student creation
- `src/app/(admin)/register/teacher/page.tsx` - Teacher creation
- `src/app/(admin)/register/package/page.tsx` - Package creation

### Sections (with dialogs)
- `src/app/(admin)/register/booking-sections/StudentsSection.tsx`
- `src/app/(admin)/register/booking-sections/TeacherSection.tsx`
- `src/app/(admin)/register/booking-sections/PackageSection.tsx`
- `src/app/(admin)/register/booking-sections/DateSection.tsx`
- `src/app/(admin)/register/booking-sections/ReferralSection.tsx`

### Forms
- `src/components/forms/Student4SchoolForm.tsx`
- `src/components/forms/Teacher4SchoolForm.tsx`
- `src/components/forms/Package4SchoolForm.tsx`

### UI Components
- `src/components/ui/EntityAddDialog.tsx` - Dialog wrapper for popover forms
- `src/components/ui/form/form-input.tsx` - Form input with validation styling
- `src/components/ui/form/form-field.tsx` - Form field wrapper with label

### Server
- `actions/register-action.ts` - All database operations
- `supabase/server/register.ts` - Data fetching with optimized ordering (newest students, oldest packages/teachers)

## Database Ordering

**From `supabase/server/register.ts`:**
- **Packages**: Order by `created_at` ascending (oldest first)
- **Students**: Order by `created_at` descending (newest first)
- **Teachers**: Order by `created_at` ascending (oldest first)

Optimistic adds prepend to beginning of arrays to match this ordering.
