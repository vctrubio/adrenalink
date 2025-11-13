# Classboard - Event Creation, Scheduling & Real-Time Synchronization

## Overview

**Classboard** is the primary interface for creating and scheduling events in Adrenalink. It uses a drag-and-drop paradigm to assign bookings to teachers, with real-time synchronization via Supabase Realtime subscriptions across admin, student, and teacher portals.

**Last Updated**: 2025-11-13
**Features**: Admin classboard, student/teacher portals, real-time event notifications

## Architecture

### Core Concepts

1. **Bookings** - Student packages with assigned lessons and teachers
2. **Lessons** - Links bookings to specific teachers with commission rates
3. **Events** - Actual scheduled activities (date, time, location, duration)
4. **Teacher Queue** - Linked-list data structure managing event scheduling for each teacher

### Real-Time Flow

```
User Drags Booking
    ↓
Drop on Teacher Column
    ↓
Validate Teacher Assignment
    ↓
Calculate Event Details (time, duration, location)
    ↓
Create Event in Supabase
    ↓
Supabase Broadcasts Change
    ↓
useClassboardEventListener Detects Update
    ↓
Refetch ClassboardModel
    ↓
State Updates & UI Re-renders
```

## Key Components

### `useClassboard` Hook
- **Location**: `src/hooks/useClassboard.ts`
- **Purpose**: Central state management for classboard
- **Manages**:
  - Selected date (persisted to localStorage)
  - Search query filtering
  - Controller settings (location, time, duration caps)
  - Dragged booking state
  - Available bookings & teacher queues
  - Classboard statistics

### Real-Time Listeners
All real-time subscriptions live in `src/supabase/subscribe/` directory.

#### Admin Classboard Listeners

**useAdminClassboardEventListener**
- **Location**: `src/supabase/subscribe/adminClassboardEventListener.ts`
- **Purpose**: Detects event INSERT and DELETE operations for admin classboard
- **Listens To**: `event` table changes filtered by `school_id`
- **Action**: Calls `getClassboardBookings()` to refetch full classboard state
- **Updates**: Triggers state update in useClassboard via callback

**useAdminClassboardBookingListener**
- **Location**: `src/supabase/subscribe/adminClassboardBookingListener.ts`
- **Purpose**: Detects new booking INSERTs for real-time notification
- **Listens To**: `booking` table changes filtered by `school_id`
- **Action**: Shows "New Booking Alert" toast and refetches bookings
- **Updates**: Allows StudentClassDaily to show new bookings without reload

#### Student & Teacher Portal Listeners

**useStudentLessonListener**
- **Location**: `src/supabase/subscribe/useStudentLessonListener.ts`
- **Purpose**: Detects event changes for student portal
- **Listens To**: `event` table INSERT/DELETE filtered by `school_id`
- **Calls**: `getStudentPackageBookingLessons(studentId)`
- **Toast**: Shows "Event Added" (blue) or "Event Removed" (orange) notification

**useTeacherLessonListener**
- **Location**: `src/supabase/subscribe/useTeacherLessonListener.ts`
- **Purpose**: Detects event changes for teacher portal
- **Listens To**: `event` table INSERT/DELETE filtered by `school_id`
- **Calls**: `getTeacherPackageBookingLessons(teacherId)`
- **Toast**: Shows "Event Added" (green) or "Event Removed" (red) notification

### `TeacherQueue` Class
- **Location**: `backend/TeacherQueue.ts`
- **Purpose**: Manages linked-list of events for each teacher
- **Features**:
  - Time slot calculation (getNextAvailableSlot)
  - Event reordering and gap management
  - Statistics calculation (duration, earnings)

### UI Components

#### `TeacherClassDaily`
- Shows teacher columns in responsive grid
- Handles drag-over visual feedback (compatible/incompatible)
- Executes drop logic and calls event creation server action
- Displays teacher stats and event queue

#### `StudentClassDaily`
- Lists available bookings for selected date
- Provides drag source for bookings

#### `StudentBookingCard`
- Draggable booking item
- Shows assigned teachers and package details
- Serializes booking data on drag start

## Controller Settings

Used to configure event creation behavior:

```typescript
interface ControllerSettings {
    submitTime: string;        // Default start time (e.g., "09:00")
    location: string;          // Default location (e.g., "Beach")
    durationCapOne: number;    // Duration for 1 student
    durationCapTwo: number;    // Duration for 2-3 students
    durationCapThree: number;  // Duration for 4+ students
}
```

## Event Creation Flow

### 1. Drag Start
```
StudentBookingCard → handleDragStart
  ↓
Sets dataTransfer.data with DraggableBooking JSON
  ↓
Calls onDragStart callback
```

**DraggableBooking Structure**:
```typescript
{
    bookingId: string;
    capacityStudents: number;
    lessons: Array<{
        id: string;
        teacherUsername: string;
        commissionType: "fixed" | "percentage";
        commissionCph: number;
    }>;
}
```

### 2. Drop on Teacher
```
TeacherClassDaily → handleDrop
  ↓
Extract booking from dataTransfer
  ↓
Find lesson for target teacher
  ↓
Get next available slot from TeacherQueue
  ↓
Calculate event date/time on selectedDate
  ↓
Calculate duration based on capacityStudents
  ↓
Call createClassboardEvent server action
```

### 3. Event Creation Server Action
```typescript
createClassboardEvent(
    lessonId: string,
    eventDate: string,
    duration: number,
    location: string
)
```

Creates event in Supabase with status `"scheduled"`.

### 4. Real-Time Update
```
Supabase broadcasts event INSERT
  ↓
useClassboardEventListener receives payload
  ↓
Calls getClassboardBookings()
  ↓
Updates classboardData state
  ↓
All memos recalculate (teacherQueues, stats, etc)
  ↓
UI automatically re-renders with new event
```

## Data Flow

### ClassboardModel Structure
```typescript
type ClassboardModel = Record<string, ClassboardData>;

type ClassboardData = {
    booking: {
        dateStart: string;
        dateEnd: string;
        schoolId: string;
    };
    schoolPackage: SchoolPackageType;  // Full package data
    bookingStudents: Array<{
        student: {
            firstName: string;
            lastName: string;
        };
    }>;
    lessons: Array<{
        id: string;
        teacher: { username: string };
        status: string;
        commission: {
            id: string;
            type: "fixed" | "percentage";
            cph: string;
        };
        events: Array<{
            id: string;
            date: string;
            duration: number;
            location: string;
            status: string;
        }>;
    }>;
};
```

## Console Logging

### Drag Events
- `🎪 [ClientClassboard] Drag started` - Booking picked up
- `🎯 [TeacherClassDaily] Drag enter` - Hovering over teacher
- `💧 [TeacherClassDaily] DROP EVENT FIRED` - Drop triggered

### Event Creation
- `📝 [classboard-action] Creating event` - Server action called
- `✅ [classboard-action] Event created` - Event saved to DB

### Real-Time Updates
- `🚀 [useClassboardEventListener] Initializing listener` - Listener starts
- `📡 [useClassboardEventListener] Event change detected` - Change detected
- `🔄 [useClassboardEventListener] Refetching classboard data` - Fetching new data
- `✅ [useClassboardEventListener] Data refetched successfully` - Update complete
- `🔄 [useClassboard] Data updated via listener` - State updated

## Duration Logic

Duration is calculated based on student capacity:

```typescript
if (capacityStudents === 1) {
    duration = controller.durationCapOne;
} else if (capacityStudents <= 3) {
    duration = controller.durationCapTwo;
} else {
    duration = controller.durationCapThree;
}
```

## Time Slot Calculation

Next available slot is determined by:
1. Getting last event in teacher's queue
2. If no events: use `controller.submitTime`
3. If events exist: use `lastEventEnd + duration`

## LocalStorage

Selected date is persisted to allow users to resume where they left off:

```typescript
const STORAGE_KEY = "classboard-selected-date";
```

## Student & Teacher Portals

### Overview
Dynamic portals at `/student/[id]` and `/teacher/[id]` show personalized lesson and event schedules with real-time updates.

### Student Portal (`/student/[id]`)
- **Location**: `src/app/(users)/student/[id]/page.tsx`
- **Data Fetching**: `getStudentPackageBookingLessons(studentId)` via `src/actions/user-action.ts`
- **Real-Time Sync**: `useStudentLessonListener` hook
- **Displays**:
  - Student name and basic info
  - All lessons with teacher assignments
  - Events per lesson (date, time, location, duration)
  - School package details (capacity, price, duration)
  - Commission info per lesson
  - Booking date range

**Toast Notifications**:
- **Event Added** (Blue Calendar icon): Shows teacher name, event date and time
- **Event Removed** (Orange Clock icon): Shows teacher name and update notification

### Teacher Portal (`/teacher/[id]`)
- **Location**: `src/app/(users)/teacher/[id]/page.tsx`
- **Data Fetching**: `getTeacherPackageBookingLessons(teacherId)` via `src/actions/user-action.ts`
- **Real-Time Sync**: `useTeacherLessonListener` hook
- **Displays**:
  - Teacher name and username
  - All lessons with student assignments
  - Events per lesson with date/time
  - School package details per lesson
  - Commission details (fixed/percentage)
  - Booking date ranges

**Toast Notifications**:
- **Event Added** (Green Calendar icon): Shows student names, event date and time
- **Event Removed** (Red Clock icon): Shows student names and update notification

### Server Actions for Portals

**getStudentPackageBookingLessons(studentId)**
- Fetches student with bookings via `bookingStudents` relation
- Includes full lesson data with teacher, commission, events
- Organizes data by student → package → booking → lessons → events hierarchy

**getTeacherPackageBookingLessons(teacherId)**
- Fetches teacher with all lessons
- Includes booking, school package, commission, events per lesson
- Includes student names from booking students

## Event Deletion Flow

When an event is deleted in the admin classboard:

```
EventCard Delete Button
    ↓
Server Action deleteClassboardEvent()
    ↓
Supabase broadcasts DELETE on event table
    ↓
useAdminClassboardEventListener detects DELETE
    ↓
Refetches classboard data
    ↓
handleEventDeleted callback removes event from classboardData state
    ↓
React recalculates availableBookings (booking returns to Available tab)
    ↓
Student/Teacher portals also receive DELETE notification
    ↓
useStudentLessonListener / useTeacherLessonListener triggers toast
    ↓
Portal UI updates with new data
```

**Key Insight**: Uses optimistic local state update instead of refetching all bookings, preventing performance issues with large datasets.

## Technical Patterns & Insights

### 1. Server-First Data Fetching
All data for portals fetched server-side in one query with complete relations:
```typescript
// Avoid N+1 queries: fetch with all relations at once
const result = await db.query.student.findFirst({
    where: eq(student.id, studentId),
    with: {
        bookingStudents: {
            with: {
                booking: {
                    with: {
                        schoolPackage: true,
                        lessons: { with: { teacher: true, commission: true, events: true } }
                    }
                }
            }
        }
    }
});
```

**Benefits**: Single database round-trip, type-safe relations, complete data for client-side operations.

### 2. Client-Side Filtering via useMemo
Heavy filtering done client-side for instant UI updates:
```typescript
const availableBookings = useMemo(() => {
    return draggableBookings.filter((booking) => {
        const hasEventOnSelectedDate = /* check logic */;
        return !hasEventOnSelectedDate;
    });
}, [draggableBookings, bookingsForSelectedDate, selectedDate]);
```

**Benefits**: No loading states, instant search/date changes, predictable re-renders.

### 3. Linked List for Sequential Events
`TeacherQueue` uses linked list for time-ordered events:
- Events naturally sequential (9:00am → 10:00am → 11:00am)
- O(1) append operations (most common case)
- Easy traversal for time recalculation
- Natural pointer-based ordering

### 4. Drag-and-Drop with Validation
HTML5 Drag-and-Drop API with custom validation:
```typescript
handleDragEnter: Checks isLessonTeacher(bookingId, teacherUsername)
Visual Feedback: Compatible (green) vs Incompatible (orange)
```

**Benefits**: Prevents invalid assignments, visual feedback before drop, works on mobile with touch.

### 5. Completion Tracking via Count Comparison
Day completion determined by lesson vs event count:
```typescript
isComplete = eventCount === lessonCount
completionPercentage = Math.round((eventCount / lessonCount) * 100)
```

**Benefits**: Clear goal (100% = all lessons have events), per-teacher and global tracking.

## Real-Time Architecture

### Supabase Realtime Setup
Tables must be enabled for Realtime publication:
- `booking` table: Listens for INSERT (new bookings)
- `event` table: Listens for INSERT and DELETE (event creation/deletion)
- `lesson` table: Listening configured but primarily event-driven

**Filtering**: All subscriptions use `school_id` column to isolate multi-tenant data.

### Subscription Pattern
```typescript
supabase
    .channel(`channel_name_${schoolId}`)
    .on("postgres_changes", {
        event: "INSERT" | "DELETE",
        schema: "public",
        table: "event",
        filter: `school_id=eq.${schoolId}`
    }, handleChange)
    .subscribe((status) => {
        if (status === "SUBSCRIBED") console.log("Connected");
    });
```

### Data Flow Summary
```
User Action (drag-drop/delete)
    ↓
Server Action (createEvent/deleteEvent)
    ↓
Database Update
    ↓
Supabase Realtime Broadcast
    ↓
Hook Listener Detects Change
    ↓
Refetch/Update Action (getClassboardBookings/getStudentLessons/etc)
    ↓
State Update + Toast Notification
    ↓
UI Re-renders with New Data
```

## Performance Considerations

### Single Query Pattern
Fetch all related data in one database query to avoid N+1 problems:
- **Classboard**: Single query with bookings → lessons → events → teachers
- **Student Portal**: Single query with booking students → lessons → events
- **Teacher Portal**: Single query with teacher lessons → booking → students

### Client-Side Filtering
Filter/search done client-side using useMemo for instant feedback:
- **Tradeoff**: Larger initial data transfer vs instant UI updates
- **Suitable for**: School-scoped data (typically <1000 records)
- **Not suitable for**: Multi-school data (10,000+ records)

### LocalStorage Persistence
Selected date persisted to resume where user left off:
```typescript
const STORAGE_KEY = "classboard-selected-date";
```

## Schema Requirements for Real-Time

Ensure database schema includes `school_id` columns for filtering:
- ✅ `event.school_id` - References which school owns the event
- ✅ `lesson.school_id` - References which school owns the lesson
- ✅ `booking.school_id` - References which school owns the booking

**Migration**: If missing, use `ALTER TABLE` to add columns and populate from related tables.

## Known Issues

1. **GoTrueClient Warning** - Supabase creates multiple auth instances (non-critical)
2. **Event Creation Not Showing** - Check browser console for error logs and ensure Supabase subscription is active
3. **Listener Not Triggering** - Verify schoolId is correctly extracted and tables have school_id column

## Next Steps

1. Implement event editing capabilities with time conflict detection
2. Add teacher conflict detection across overlapping events
3. Implement gap management automation (consolidate times)
4. Add batch event creation for recurring classes
5. Implement event confirmation workflow
6. Add event status transitions (scheduled → confirmed → completed)
7. Implement referral tracking integration
8. Add wallet ID integration for payment processing
