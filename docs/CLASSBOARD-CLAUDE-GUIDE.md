# Classboard Development Guide

## System Overview

The Classboard is a teacher schedule management system that uses a **linked list data structure** to efficiently manage daily lesson events. It provides real-time updates, drag-and-drop lesson creation, and automatic schedule optimization.

## Architecture

### Three-Layer Architecture

```
React Components (UI Layer)
    ↓
QueueController (Business Logic Layer)
    ↓
TeacherQueue (Data Structure Layer)
```

Each layer has distinct responsibilities and communicates through well-defined interfaces.

---

## Core Components

### 1. TeacherQueue - Linked List Data Structure

**Purpose**: Manages events as a singly-linked list for O(1) insertion/deletion operations.

**Location**: [TeacherQueue.ts](../src/app/(admin)/(classboard)/TeacherQueue.ts)

**Key Responsibilities**:
- Constructs linked list from event arrays
- Maintains chronological order through `next` pointers
- Provides efficient event traversal and mutation
- Calculates queue statistics (gaps, revenue, utilization)

**Core Methods**:

```typescript
constructEvents(events: EventNode[]): EventNode | null
```
- Builds linked list from event array sorted by date
- Returns head node of the list
- Sets `next` pointers to link events chronologically

```typescript
rebuildQueue(settings: ControllerSettings): void
```
- Reconstructs the queue while maintaining event order
- Useful after deletions or modifications
- Updates internal `head` reference

```typescript
optimiseQueue(settings: ControllerSettings): void
```
- Fills time gaps based on duration capacity rules
- Uses `durationCapOne`, `durationCapTwo`, `durationCapThree` settings
- Respects `gapMinutes` requirement between events
- Only runs when queue is in "locked" mode

```typescript
getStats(): QueueStats
```
- Calculates total revenue from commission data
- Identifies gaps between events
- Computes utilization percentage
- Returns statistics object for display

**Data Structure**:
```
Head → Event1 → Event2 → Event3 → null
       next     next     next
```

---

### 2. QueueController - Business Logic Facade

**Purpose**: Orchestrates all queue operations with validation, DB synchronization, and cascade logic.

**Location**: [QueueController.ts](../src/app/(admin)/(classboard)/QueueController.ts)

**Key Responsibilities**:
- Command pattern dispatcher for undo/redo capability
- Validates operations before execution
- Handles database synchronization
- Manages cascade behavior based on lock state
- Provides single source of truth for lock status

**Core Methods**:

```typescript
execute(command: QueueCommand): Promise<void>
```
- Main dispatcher for all queue operations
- Commands: 'modify', 'delete', 'optimize', 'lock', 'unlock'
- Validates before execution
- Updates both queue and database

```typescript
deleteEvent(eventId: string, mode: "cascade" | "single"): Promise<void>
```
- Removes event from queue and database
- **Cascade mode**: If locked, optimizes queue to fill gap
- **Single mode**: If unlocked, leaves gap in schedule
- Uses `isLocked()` to determine behavior

```typescript
isLocked(): boolean
```
- Returns current lock state: `this.settings.locked ?? false`
- **Single source of truth** for lock status
- Used throughout codebase instead of direct `settings.locked` checks
- Enables centralized lock logic changes

```typescript
validate(command: QueueCommand): boolean
```
- Checks if operation is valid before execution
- Prevents invalid state mutations
- Returns boolean result

**Lock Mode Behavior**:

| Mode | Delete Behavior | Use Case |
|------|----------------|----------|
| **Locked** | Cascade fills gap automatically | Flexible schedules, optimize utilization |
| **Unlocked** | Leaves gap, respects existing times | Fixed appointments, strict schedules |

---

### 3. useTeacherQueue - React Integration Hook

**Purpose**: Bridges QueueController with React component lifecycle and state management.

**Location**: [useTeacherQueue.ts](../src/app/(admin)/(classboard)/classboard/useTeacherQueue.ts)

**Key Responsibilities**:
- Manages React state for queue operations
- Implements optimistic updates with rollback
- Forces React re-renders after in-place mutations
- Tracks unsaved changes for save prompts

**Core State**:

```typescript
const [mutationTick, setMutationTick] = useState(0);
```
**Critical Pattern**: Since QueueController mutates the linked list in-place (no new object reference), React doesn't detect changes. Incrementing `mutationTick` after mutations forces useEffect dependencies to re-run.

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
```
Tracks if save button should be enabled.

```typescript
const [optimisticQueue, setOptimisticQueue] = useState(null);
```
Stores queue snapshot before server update for instant UI feedback and error rollback.

**Key Patterns**:

```typescript
// After any mutation
queueController.execute(command);
setMutationTick(prev => prev + 1);  // Force re-render

// In effect dependencies
useEffect(() => {
    // Recalculate derived data
}, [mutationTick]);
```

---

### 4. ClientClassboard - Main Orchestrator

**Purpose**: Top-level component that coordinates all classboard functionality with minimal state.

**Location**: [ClientClassboard.tsx](../src/app/(admin)/(classboard)/ClientClassboard.tsx)

**Optimization Strategy** (follows BillboardClient pattern):
- **Minimal state**: Only `classboardData` and `draggedBooking`
- **Provider-managed**: `selectedDate` and `controller` live in ClassboardProvider
- **Derived data**: Everything else computed via `useMemo`
- **No refresh hacks**: Data flows naturally through subscriptions

**Key State**:

```typescript
const [classboardData, setClassboardData] = useState<ClassboardModel>(data);
```
Raw booking/lesson data from database.

```typescript
const [optimisticEvents, setOptimisticEvents] = useState<any[]>([]);
```
Tracks optimistic event creations before DB confirmation.

```typescript
const [draggedBooking, setDraggedBooking] = useState<DraggableBooking | null>(null);
```
Current booking being dragged for lesson creation.

**Data Flow**:

```
Server Data (ClassboardModel)
    ↓
bookingsForSelectedDate (filtered by date)
    ↓
teacherQueues (built from bookings)
    ↓
stats (calculated from queues)
    ↓
Render Components
```

**Real-time Subscriptions**:

```typescript
useAdminClassboardEventListener({
    onEventDetected: handleEventDetected
});
```
- Listens for event changes (create/update/delete)
- Updates `classboardData` automatically
- Clears optimistic events when real events arrive

```typescript
useAdminClassboardBookingListener({
    onNewBooking: handleNewBookingDetected
});
```
- Listens for new booking creations
- Refetches complete classboard data
- Ensures UI stays synchronized

---

## Data Models

### EventNode Structure

**Purpose**: Represents a single lesson event in the linked list with all data needed for rendering and calculations.

```typescript
interface EventNode {
    // Identity
    id: string;                    // Event UUID
    lessonId: string;              // Lesson UUID
    bookingId: string;             // Booking UUID
    
    // Booking Info
    bookingLeaderName: string;     // Leader student name
    bookingStudents: StudentData[];  // Always present - needed for exports/reports
    capacityStudents: number;      // Number of students
    
    // Financial
    pricePerStudent: number;       // For revenue calculation
    commission: {
        type: "fixed" | "percentage";
        cph: number;               // Currency per hour (school's currency) or percentage
    };
    
    // Equipment
    categoryEquipment: string;     // Equipment type for display
    capacityEquipment: number;     // Equipment capacity
    
    // Scheduling
    packageDuration: number;       // Expected duration (minutes)
    eventData: {
        date: string;              // ISO datetime
        duration: number;          // Actual duration (minutes)
        location: string;          // Event location
        status: "planned" | "tbc" | "completed" | "uncompleted";
    };
    
    // Linked List
    next: EventNode | null;        // Pointer to next event
}
```

**Why these fields?**
- **bookingLeaderName + bookingStudents**: Render event cards
- **commission + pricePerStudent**: Calculate revenue in statistics
- **categoryEquipment + capacityEquipment**: Display equipment info
- **packageDuration**: Validate against actual duration
- **eventData**: Core scheduling information
- **next**: Linked list pointer for O(1) traversal

---

### ControllerSettings

**Purpose**: Configuration for queue behavior and optimization rules.

```typescript
interface ControllerSettings {
    submitTime: string;           // Queue submission time
    location: string;             // Default event location
    
    // Duration Capacity Rules (for optimization)
    durationCapOne: number;       // Capacity 1 default duration
    durationCapTwo: number;       // Capacity 2 default duration
    durationCapThree: number;     // Capacity 3+ default duration
    
    // Scheduling Rules
    gapMinutes: number;           // Required gap between events
    stepDuration: number;         // Duration increment step
    minDuration: number;          // Minimum event duration
    maxDuration: number;          // Maximum event duration
    
    // Behavior Mode
    locked?: boolean;             // True = cascade on delete, False = leave gaps
}
```

**Lock State Impact**:
- **Locked (true)**: Optimize after deletions, fill gaps automatically
- **Unlocked (false)**: Preserve existing times, leave gaps

---

## Key Patterns & Solutions

### 1. mutationTick Pattern - Force React Re-renders

**Problem**: QueueController mutates linked list in-place. React doesn't see new object reference, so components don't re-render.

**Solution**: Increment counter after mutations to trigger useEffect dependencies.

```typescript
// In useTeacherQueue
const [mutationTick, setMutationTick] = useState(0);

const handleDeleteEvent = async (eventId: string) => {
    await queueController.execute({ type: 'delete', eventId });
    setMutationTick(prev => prev + 1);  // Force re-render
};

// Components react to mutationTick changes
useEffect(() => {
    const stats = queueController.queue.getStats();
    setStats(stats);
}, [mutationTick]);
```

### 2. Optimistic Updates - Instant UI Feedback

**Pattern**: Show changes immediately, rollback on error.

```typescript
const [optimisticEvents, setOptimisticEvents] = useState([]);

const handleAddEvent = async (eventData) => {
    // 1. Add optimistic event
    const tempEvent = { ...eventData, id: `temp-${Date.now()}` };
    setOptimisticEvents(prev => [...prev, tempEvent]);
    
    // 2. Send to server
    try {
        const realEvent = await createEvent(eventData);
        // Subscription will clear optimistic event when real one arrives
    } catch (error) {
        // 3. Rollback on error
        setOptimisticEvents(prev => 
            prev.filter(e => e.id !== tempEvent.id)
        );
    }
};
```

### 3. Cascade Delete Logic

**Pattern**: Lock state determines post-delete behavior.

```typescript
// In QueueController.deleteEvent()
async deleteEvent(eventId: string, mode: "cascade" | "single") {
    // Remove from queue
    this.queue.deleteEventById(eventId);
    
    // Delete from database
    await deleteEventFromDB(eventId);
    
    // Cascade behavior based on lock
    if (this.isLocked()) {
        // Locked: fill the gap
        await this.queue.optimiseQueue(this.settings);
    } else {
        // Unlocked: leave gap, respect times
        // No optimization needed
    }
}
```

### 4. Derived Data with useMemo

**Pattern**: Compute data from minimal state to avoid redundant state management.

```typescript
// In ClientClassboard

// Minimal state
const [classboardData, setClassboardData] = useState(data);

// Everything else derived
const bookingsForSelectedDate = useBookingsForSelectedDate(
    classboardData, 
    selectedDate
);

const { teacherQueues } = useClassboardQueues(
    allTeachers, 
    bookingsForSelectedDate
);

const stats = useMemo(() => {
    const statistics = new ClassboardStatistics(teacherQueues);
    return statistics.getDailyLessonStats();
}, [teacherQueues]);
```

**Benefits**:
- Single source of truth
- No state synchronization bugs
- Automatic updates when dependencies change
- Less code to maintain

---

## File Structure

```
src/app/(admin)/(classboard)/
├── ClientClassboard.tsx         # Main orchestrator, subscription management
├── TeacherQueue.ts              # Linked list data structure
├── QueueController.ts           # Business logic facade
├── ClassboardStatistics.ts      # Revenue/gap/utilization calculations
└── classboard/
    ├── useTeacherQueue.ts       # React hook for queue state
    ├── useAddLessonEvent.ts     # Drag-drop lesson creation logic
    ├── TeacherClassDaily.tsx    # Daily teacher schedule view
    ├── EventCard.tsx            # Individual event display card
    ├── EventModCard.tsx         # Event editing modal
    ├── EventGapDetection.tsx    # Gap validation component
    ├── TeacherClassCard.tsx     # Teacher card with stats
    ├── ClassboardContentBoard.tsx    # Main content grid
    └── ClassboardFooter.tsx     # Controller settings footer

types/
└── classboard-teacher-queue.ts  # Type definitions

backend/
├── ClassboardStatistics.ts      # Statistics calculation class
└── models/
    └── ClassboardModel.ts       # Server data model
```

---

## Common Issues & Solutions

### Issue: React Not Detecting Queue Changes

**Symptom**: UI doesn't update after queue mutation (delete, optimize, modify).

**Cause**: QueueController mutates `TeacherQueue` in-place. No new object reference created, so React doesn't detect change.

**Solution**: 
```typescript
// Always increment mutationTick after mutations
queueController.execute(command);
setMutationTick(prev => prev + 1);
```

### Issue: Cascade Not Working

**Symptom**: Events don't shift up after deletion when expected.

**Debug Steps**:
1. Check `queueController.isLocked()` value
2. Verify `settings.locked` in ControllerSettings
3. Console log before cascade logic:
```typescript
console.log('Lock state:', this.isLocked());
console.log('Should cascade:', this.isLocked() && mode === 'cascade');
```

### Issue: Optimistic Events Not Clearing

**Symptom**: Temporary events remain after real events created.

**Cause**: Subscription not detecting real event or matching logic broken.

**Solution**: Check `handleEventDetected` matching logic:
```typescript
// Verify lessonId matching
const hasRealEvents = Object.values(newData).some(bookingData => 
    bookingData.lessons.some(lesson => 
        lesson.id === optimisticEvent.lessonId && 
        lesson.events?.length > 0
    )
);
```

### Issue: Performance Degradation

**Symptom**: Slow renders, lag when interacting with large schedules.

**Debug**: Check for unnecessary re-renders:
```typescript
console.log('Component render');
```

**Solutions**:
- Ensure `useMemo` wraps expensive calculations
- Verify dependencies arrays are correct
- Check if state updates are batched properly
- Consider React.memo for pure components

---

## Next Steps

### Parent Flag Structure (Upcoming Feature)

**Purpose**: To be determined - likely for event grouping, hierarchical relationships, or parent-child event linking.

**Status**: 🔜 Planning phase

**Context**: Next major feature after code cleanup completion.

---

## Development Principles

1. **Less is better**: Remove unused code/types immediately
2. **Single source of truth**: Use methods like `isLocked()` instead of repeated checks
3. **Derive, don't duplicate**: Use `useMemo` instead of redundant state
4. **Document complex patterns**: Explain non-obvious code (like mutationTick)
5. **Performance matters**: Optimize data structures (linked list for O(1) operations)

