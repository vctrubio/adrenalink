# Classboard - Teacher Queue & Classes

## Overview

The Classboard is a comprehensive booking and event scheduling system located at `/classboard` that visualizes and manages daily teacher schedules, student bookings, and class events through an intuitive drag-and-drop interface.

## Purpose

This feature provides a daily operational view for schools to:
- Track available student bookings that need class assignments
- Manage teacher schedules as linked-list queues
- Schedule class events via drag-and-drop
- Monitor completion status and earnings in real-time
- Ensure all bookings have scheduled events

## Key Features

### 1. Date-Based View
- **Date Selector**: Calendar control for selecting any date
- **Auto-Filter**: Shows only bookings active on selected date
- **Daily Focus**: All operations scoped to a single day
- **Today Default**: Initializes to current date using timezone utilities

### 2. Available Bookings Section
Displays student bookings that have NO events scheduled for the selected date:

**Display Format**:
- Grid layout (responsive: 1 to 4 columns)
- Student names and count
- Package duration and price
- Assigned teacher(s) for reference
- Draggable cards for event creation

**Filtering**:
```typescript
const availableBookings = draggableBookings.filter((booking) => {
    const hasEventOnSelectedDate = bookingsForSelectedDate
        .find((b) => b.booking.id === booking.bookingId)
        ?.lessons.some((lesson) =>
            lesson.events.some((event) => {
                const eventDate = new Date(event.date).toISOString().split("T")[0];
                return eventDate === selectedDate;
            })
        );
    return !hasEventOnSelectedDate;
});
```

### 3. Teacher Queue System

#### Queue Architecture (Linked List)
Each teacher has a `TeacherQueue` instance that manages events as a singly-linked list:

**EventNode Structure**:
```typescript
interface EventNode {
    id: string | null;
    lessonId: string;
    bookingId: string;
    eventData: {
        id?: string;
        date: string;
        duration: number;
        location: string;
        status: string;
    };
    studentNames: string[];
    studentCount: number;
    commissionCph: number;
    packagePricePerStudent: number;
    packageDurationMinutes: number;
    next: EventNode | null;  // Pointer to next event
}
```

**Why Linked List?**
- **Sequential Time Management**: Events naturally flow from one to the next
- **Easy Insertion/Removal**: O(1) operations at head/tail
- **Time Recalculation**: When one event changes, easily propagate to subsequent events
- **Natural Ordering**: Head = first event, traverse to get all events in order

#### Queue Operations
The TeacherQueue class provides these core methods:
- `addToQueue(eventNode)`: Appends event to end of queue
- `removeFromQueue(lessonId)`: Removes event from queue
- `getAllEvents()`: Returns array of all events in order
- `getLastEvent()`: Gets final event in queue
- `getStartTime(eventNode)`: Extracts time from ISO date string
- `getTeacherStats()`: Aggregates duration, earnings, student count

### 4. Teacher Columns

Each teacher gets a column displaying:

**Header**:
- Teacher name and username
- Completion status icon (✓ green if complete, ✗ red if incomplete)
- Event count vs lesson count (e.g., "3/5")
- Completion percentage badge

**Stats Summary**:
- Total hours scheduled
- Teacher earnings (commission × hours)
- School revenue (total - commission)
- Student count

**Event Cards** (rendered from queue):
- Student names
- Event time and duration
- Location
- Status badges
- Edit/delete actions

**Drag-and-Drop Zone**:
- Green border: Compatible booking (teacher assigned)
- Orange border: Incompatible booking (teacher not assigned)
- Blue border: Unknown compatibility (during hover)

### 5. Drag-and-Drop Scheduling

#### Workflow
1. User drags a StudentBookingCard from Available Bookings
2. User hovers over a TeacherColumn
3. System validates: Is teacher assigned to this booking's lesson?
4. Border color indicates compatibility
5. User drops booking onto teacher
6. System creates event and updates queue

#### Validation Logic
```typescript
const isLessonTeacher = (bookingId: string, teacherUsername: string) => {
    const booking = bookingsForSelectedDate.find(b => b.booking.id === bookingId);
    return booking?.lessons.some(lesson => lesson.teacher.username === teacherUsername) || false;
};
```

#### Current Implementation
- Drag-and-drop UI complete with visual feedback
- Validation prevents assigning bookings to wrong teachers
- TODO: Connect to server action to persist events to database
- TODO: Auto-calculate event start times based on queue position

### 6. Controller Settings

The ClassboardController provides:

**Date Selection**:
- Calendar picker
- Quick navigation (today, tomorrow, etc.)
- Date range validation

**Search Functionality**:
- Search by student name
- Real-time filtering
- Case-insensitive matching

**Global Settings**:
- Submit Time: Default start time for first event (e.g., "09:00")
- Location: Default location for events (e.g., "Beach")
- Duration Caps: Max durations for 1, 2, and 3+ students
  - Cap One: 60 minutes (1 student)
  - Cap Two: 90 minutes (2 students)
  - Cap Three: 120 minutes (3+ students)

**Global Statistics**:
- Total teachers scheduled
- Total lessons vs events created
- Total students
- Total hours
- Total earnings (teacher + school)
- Overall completion percentage

### 7. Statistics System

#### ClassboardStats Class
Aggregates statistics across all teachers for the selected date:

**Mastermind Logic**:
- `lessonCount`: Number of active lessons (excluding "rest" status)
- `eventCount`: Number of events created for the day
- `isComplete`: True when `eventCount === lessonCount` (all lessons have events)
- `completionPercentage`: `(eventCount / lessonCount) × 100`

**Global Stats**:
```typescript
interface GlobalStats {
    teacherCount: number;
    totalLessons: number;
    totalEvents: number;
    totalStudents: number;
    totalHours: number;
    totalEarnings: {
        teacher: number;
        school: number;
        total: number;
    };
    isComplete: boolean;
    completionPercentage: number;
}
```

**Per-Teacher Stats**:
```typescript
interface TeacherStats {
    teacherUsername: string;
    lessonCount: number;
    eventCount: number;
    studentCount: number;
    totalHours: number;
    earnings: {
        teacher: number;
        school: number;
        total: number;
    };
}
```

#### Earnings Calculation
For each event in the queue:
```typescript
const eventHours = eventData.duration / 60;
const packageHours = packageDurationMinutes / 60;
const pricePerHourPerStudent = packagePricePerStudent / packageHours;
const eventTotalRevenue = pricePerHourPerStudent * studentCount * eventHours;
const eventTeacherEarning = commissionCph * eventHours;
const schoolRevenue = eventTotalRevenue - eventTeacherEarning;
```

## Data Model

### Entity Flow

```
booking (1) → (1) studentPackage → (1) schoolPackage
booking (many) ←→ (many) student [via bookingStudent]
booking (1) → (many) lesson
lesson (1) → (1) teacher
lesson (1) → (1) commission
lesson (1) → (many) event
event = individual class instance on a specific date/time
```

### Key Relationships

**Booking**:
- Links to studentPackage (contains schoolPackage details)
- Has multiple bookingStudents (many-to-many with students)
- Has multiple lessons (one per assigned teacher)
- Has date range (dateStart, dateEnd)

**Lesson**:
- Links to booking, teacher, and commission
- Has status: "active" | "rest" | "completed"
- Has multiple events (actual scheduled classes)
- Represents a teaching assignment for a booking

**Event**:
- Links to lesson
- Has specific date and time (ISO string)
- Has duration in minutes
- Has location (e.g., "Beach", "School")
- Has status: "scheduled" | "completed" | "cancelled"
- Represents a single class instance

### Booking Lifecycle

1. **Booking Created** (via Master Booking Form)
   - studentPackage created with date range
   - Students linked via studentPackageStudent
   - Booking created linked to studentPackage
   - Students linked via bookingStudent
   - Lesson created with teacher and commission

2. **Booking Appears in Classboard**
   - Shows in "Available Bookings" on dates within range
   - Remains visible until event created for that date

3. **Event Scheduled** (via Drag-and-Drop)
   - User drags booking to teacher queue
   - System validates teacher assignment
   - Event created with date, time, duration, location
   - Event added to teacher's queue (linked list)
   - Booking removed from "Available Bookings" for that date

4. **Event Completion** (Future)
   - Event status updated to "completed"
   - Earnings locked in
   - Historical tracking

## Technical Architecture

### Components

#### page.tsx (Server Component)
- Fetches all classboard data server-side
- Calls `getClassboardBookings()` action
- Handles error states
- Passes data to ClientClassboard

#### ClientClassboard.tsx (Client Component)
- Main container component
- Uses `useClassboard` hook for state management
- Renders ClassboardController, StudentClassDaily, TeacherClassDaily
- Manages drag-and-drop state
- Responsive layout: flex-col on mobile, flex-row on desktop

#### ClassboardController.tsx (Client Component)
- Left sidebar controller
- Date picker, search input, global settings
- Global statistics display
- Controller settings form

#### StudentClassDaily.tsx (Client Component)
- Displays available bookings grid
- Maps bookings to StudentBookingCard components
- Provides drag handlers (onDragStart, onDragEnd)
- Shows count of available bookings

#### TeacherClassDaily.tsx (Client Component)
- Displays teacher columns grid
- Maps teacherQueues to TeacherColumn components
- Passes draggedBooking state for visual feedback
- Shows count of teachers

#### TeacherColumn.tsx (Client Component)
- Individual teacher queue display
- Drag-and-drop zone with validation
- Event cards rendered from queue
- Teacher stats summary
- Completion status indicator

#### StudentBookingCard.tsx (Client Component)
- Draggable booking card
- Shows student info, package details, teachers
- Implements HTML5 drag-and-drop
- Transfers booking data via `application/json`

#### EventCard.tsx (Client Component)
- Individual event display
- Time, duration, location, students
- Edit and delete actions
- Status badges

### Hooks

#### useClassboard.ts
Central state management hook that provides:

**State**:
```typescript
const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
const [searchQuery, setSearchQuery] = useState("");
const [controller, setController] = useState<ControllerSettings>({
    submitTime: "09:00",
    location: "Beach",
    durationCapOne: 60,
    durationCapTwo: 90,
    durationCapThree: 120,
});
const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
```

**Computed Values** (useMemo):
- `bookingsArray`: All bookings as array
- `filteredBookingsBySearch`: Bookings matching search query
- `bookingsForSelectedDate`: Bookings active on selected date
- `draggableBookings`: Bookings formatted for drag-and-drop
- `availableBookings`: Bookings without events on selected date
- `teacherQueues`: Array of TeacherQueue instances
- `teacherLessonCounts`: Map of teacher → lesson count
- `classboardStats`: ClassboardStats instance
- `isLessonTeacher`: Function to validate teacher-booking assignment

**Performance**:
- All filtering and aggregation done client-side
- UseMemo prevents unnecessary recalculations
- Single data fetch from server, then all operations local

### Backend Classes

#### TeacherQueue (Linked List)
Located in `backend/TeacherQueue.ts`

**Purpose**: Manage sequential events for a teacher on a specific date

**Key Features**:
- Singly-linked list structure (head → next → next → null)
- Time-ordered event sequence
- O(1) append operations
- Aggregated statistics calculation
- Support for time recalculation (future feature)

**Methods**:
```typescript
class TeacherQueue {
    constructor(teacher: TeacherInfo, date: string)
    addToQueue(eventNode: EventNode): void
    removeFromQueue(lessonId: string): void
    getAllEvents(): EventNode[]
    getLastEvent(): EventNode | null
    getStartTime(eventNode: EventNode): string
    getStartTimeMinutes(eventNode: EventNode): number
    getTeacherStats(): TeacherStats
}
```

#### ClassboardStats (Aggregator)
Located in `backend/ClassboardStats.ts`

**Purpose**: Aggregate and analyze statistics across all teachers

**Key Features**:
- Completion tracking (lessons vs events)
- Earnings calculation (teacher + school)
- Per-teacher and global stats
- Percentage calculations

**Methods**:
```typescript
class ClassboardStats {
    constructor(teacherStats: TeacherStats[])
    getGlobalStats(): GlobalStats
    getTeacherStats(teacherUsername: string): TeacherStats | null
    getAllTeacherStats(): TeacherStats[]
    isTeacherComplete(teacherUsername: string): boolean
    getTeacherCompletionPercentage(teacherUsername: string): number
}
```

### Server Actions

Located in `actions/classboard-action.ts`:

#### getClassboardBookings()
Fetches all bookings with complete nested relations:
- booking → studentPackage → schoolPackage
- booking → bookingStudents → student
- booking → lessons → teacher, commission, events

Returns `ClassboardModel` type (mapped from raw query result)

**Query Pattern**:
```typescript
const result = await db.query.bookings.findMany({
    where: eq(bookings.schoolId, TEST_SCHOOL_ID),
    with: {
        studentPackage: {
            with: {
                schoolPackage: true
            }
        },
        bookingStudents: {
            with: {
                student: true
            }
        },
        lessons: {
            with: {
                teacher: true,
                commission: true,
                events: true
            }
        }
    }
});
```

## User Experience Flow

### Desktop Experience

1. **Landing**: User sees controller on left (1/4 width), main content on right (3/4 width)
2. **Date Selection**: User picks date from calendar or searches for students
3. **View Available Bookings**: Grid of bookings needing events for selected date
4. **View Teacher Queues**: Grid of teachers with their scheduled events
5. **Drag Booking**: User clicks and drags a StudentBookingCard
6. **Visual Feedback**: Teacher columns show green (valid) or orange (invalid) borders
7. **Drop to Schedule**: User drops booking onto valid teacher
8. **Event Created**: Event appears in teacher queue, booking removed from available
9. **Monitor Completion**: Global stats update showing progress toward 100%

### Mobile Experience

1. **Stacked Layout**: Controller appears at top, content below
2. **Scrolling**: User scrolls down to see available bookings and teachers
3. **Touch Drag**: Touch-friendly drag-and-drop (HTML5 API supports touch)
4. **Single Column Grids**: Responsive grid collapses to single column
5. **Compact Stats**: Stats display in condensed format

### Search Workflow

1. User types student name in search field
2. Available bookings filter in real-time
3. Teacher queues update to show only matching bookings
4. Clear search to see all bookings

### Date Navigation

1. User clicks date picker
2. Calendar opens showing current month
3. User selects different date
4. All data recalculates for new date
5. Available bookings and teacher queues update instantly

## Styling and Design

### Color System

**Drag Feedback**:
- Compatible: `border-green-400 bg-green-50/50 dark:bg-green-950/50`
- Incompatible: `border-orange-400 bg-orange-50/50 dark:bg-orange-950/50`
- Neutral: `border-blue-400 bg-blue-50/50 dark:bg-blue-950/50`

**Completion Status**:
- Complete: Green checkmark icon
- Incomplete: Red X icon
- Percentage badge: Primary color background

**Semantic Colors**:
- Cards: `bg-card`, `border-border`
- Text: `text-foreground`, `text-muted-foreground`
- Interactive: `hover:bg-accent/30`

### Layout

**Desktop Grid**:
- Controller: `flex-shrink-0 w-80` (320px fixed)
- Content: `flex-1` (remaining space)
- Teacher/Booking Grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

**Mobile Stack**:
- `flex-col` layout
- Controller full width at top
- Content full width below
- Grids collapse to single column

**Spacing**:
- Page padding: `p-6`
- Gap between sections: `gap-6`
- Card spacing: `space-y-3` or `gap-3`

## Future Enhancements (TODOs)

### 1. Persist Drag-and-Drop Events
**Description**: Connect drag-and-drop to database via server action

**Implementation**:
- Create `createEvent()` server action
- Accept parameters: lessonId, date, time, duration, location
- Calculate start time based on queue position
- Insert event into database
- Return created event
- Update UI optimistically or via router.refresh()

**Pseudo-code**:
```typescript
const handleDrop = async (booking: DraggableBooking, teacher: TeacherInfo) => {
    const lastEvent = teacherQueue.getLastEvent();
    const startTime = lastEvent
        ? calculateNextStartTime(lastEvent)
        : controller.submitTime;

    const duration = getDurationByStudentCount(booking.studentCount, controller);
    const dateTime = formatDateToISO(selectedDate, startTime);

    const lessonId = booking.lessons.find(
        l => l.teacherUsername === teacher.username
    )?.id;

    await createEvent(lessonId, dateTime, duration, controller.location);
    router.refresh();
};
```

### 2. Auto-Calculate Event Times
**Description**: When events added to queue, calculate start time based on previous event

**Logic**:
```typescript
const calculateNextStartTime = (previousEvent: EventNode): string => {
    const previousStartMinutes = timeToMinutes(getTimeFromISO(previousEvent.eventData.date));
    const nextStartMinutes = previousStartMinutes + previousEvent.eventData.duration;
    return minutesToTime(nextStartMinutes);
};
```

### 3. Edit Event Details
**Description**: Allow inline editing of event time, duration, location

**Implementation**:
- Add edit mode to EventCard
- Inline inputs for time, duration, location
- Update event via `updateEvent()` server action
- Recalculate subsequent event times in queue
- Optimistic UI updates

### 4. Bulk Event Creation
**Description**: Create events for all available bookings at once

**Implementation**:
- "Schedule All" button in controller
- Distribute bookings across teachers
- Respect duration caps and time constraints
- Create events in batch
- Show progress indicator

### 5. Event Templates
**Description**: Save common event configurations as templates

**Implementation**:
- Template management UI
- Store templates in database
- Quick apply template to event creation
- Common templates: "Morning Beach", "Afternoon School", etc.

### 6. Teacher Availability
**Description**: Mark teachers as unavailable for specific dates/times

**Implementation**:
- Availability management page
- Block off time slots
- Prevent booking assignments during unavailable times
- Show availability indicator in teacher column

### 7. Event Status Management
**Description**: Mark events as completed, cancelled, or rescheduled

**Implementation**:
- Status dropdown on EventCard
- Update event status via server action
- Visual indicators (badges, colors)
- Filter by status in controller

### 8. Historical View
**Description**: View past events and completed bookings

**Implementation**:
- Date range selector (vs single date)
- Archive view for completed events
- Earnings history reports
- Export to CSV/PDF

### 9. Notifications
**Description**: Notify teachers of new event assignments

**Implementation**:
- Email/SMS notifications
- In-app notification system
- Configurable notification preferences
- Reminder notifications before events

### 10. Mobile App Integration
**Description**: Dedicated mobile app for teachers to view schedules

**Implementation**:
- API endpoints for mobile app
- Teacher authentication
- Push notifications
- Check-in/check-out functionality

## Testing Scenarios

### Happy Path
1. Select today's date
2. See available bookings
3. Drag booking to correct teacher
4. Event created and appears in queue
5. Booking removed from available
6. Stats update showing progress

### Validation Scenarios
1. Drag booking to wrong teacher → Orange border, drop prevented
2. No bookings for selected date → "No available bookings" message
3. No teachers scheduled → "No teachers scheduled" message
4. All bookings have events → Available bookings section empty
5. Search for non-existent student → No results

### Edge Cases
1. Booking with multiple teachers → Can drag to any assigned teacher
2. Lesson status "rest" → Teacher excluded from queue
3. Event already exists for date → Booking not in available list
4. Date outside booking range → Booking not shown
5. Search clears → All bookings return

### Performance Scenarios
1. 100+ bookings → Filtering remains fast (useMemo optimization)
2. 20+ teachers → Grid renders responsively
3. Multiple drags in quick succession → State updates correctly
4. Mobile device with touch → Drag-and-drop works smoothly

## Performance Considerations

### Client-Side Optimization
- **UseMemo for filtering**: Prevents recalculation on every render
- **UseMemo for teacher queues**: Linked list construction only when data changes
- **Controlled drag state**: Single draggedBooking state prevents confusion
- **Lazy event rendering**: Only visible events rendered initially

### Server-Side Optimization
- **Single query**: Fetch all bookings with complete relations in one query
- **Drizzle relations**: Database handles joins efficiently
- **No N+1 queries**: All related data loaded upfront

### Data Structure Benefits
- **Linked list efficiency**: O(1) append, O(n) traversal (n = events per teacher, typically small)
- **Teacher map**: O(1) lookup by username
- **Date filtering**: O(n) but done client-side after single fetch

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Tab order follows logical flow
- Enter key activates buttons and dropdowns
- Arrow keys navigate date picker

### Screen Readers
- Semantic HTML structure (sections, headers, lists)
- ARIA labels for drag zones ("Drop booking here")
- Status announcements ("Event created successfully")
- Descriptive button labels

### Visual Feedback
- Clear focus states on all interactive elements
- High contrast borders for drag feedback
- Icon + text for status indicators (not just color)
- Loading states during data operations

## Related Documentation

- [Master Booking Form (Register)](./master-booking-form.md)
- [Entity Configuration](../config/entities.md)
- [Data Model Architecture](../architecture/data-model.md)
- [Server Actions Pattern](../architecture/server-actions.md)
- [Linked List Data Structure](../architecture/linked-list-pattern.md)
