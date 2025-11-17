# Classboard Architecture: Teacher Queue Management

## Overview

The classboard manages teacher event scheduling with support for **global time adjustments** across multiple teachers while respecting intentional time gaps between lessons. The architecture is built on a **linked-list queue model** with centralized state management through the `GlobalFlag` class.

### Core Components
- **TeacherQueue**: Linked-list data structure managing a teacher's chronologically-ordered events
- **QueueController**: Performs queue mutations while respecting gap constraints
- **ControllerSettings**: Configuration for time constraints and UI behavior
- **GlobalFlag**: State machine managing global time adjustments across all teachers
- **Classboard Client**: React component hierarchy coordinating user interactions

---

## Component Roles & Dependencies

### 1. ControllerSettings (Configuration Layer)

**Location**: `types/classboard-teacher-queue.ts`

**Role**: Single source of truth for all time constraints and UI behavior configuration.

**Responsibilities**:
- Define time boundaries and step increments
- Store gap requirements between lessons
- Control minimum/maximum event durations
- Manage location defaults and submission times

**Properties**:
```typescript
interface ControllerSettings {
    submitTime: string;          // When teacher must submit by (e.g., "09:00")
    location: string;            // Default location
    durationCapOne: number;      // Max students cap 1 duration
    durationCapTwo: number;      // Max students cap 2 duration
    durationCapThree: number;    // Max students cap 3+ duration
    gapMinutes: number;          // Required gap between events
    stepDuration: number;        // Time increment for adjustments (30 min)
    minDuration: number;         // Minimum event duration (60 min)
    maxDuration: number;         // Maximum event duration
}
```

**Dependencies**: None (it's a configuration object)

**Usage**: Passed to QueueController and GlobalFlag as constructor parameter

**Example**:
```typescript
// In TeacherClassDaily
const controller: ControllerSettings = {
    submitTime: "09:00",
    gapMinutes: 15,
    stepDuration: 30,
    minDuration: 60,
    // ...
};
```

---

### 2. TeacherQueue (Data Structure Layer)

**Location**: `backend/TeacherQueue.ts`

**Role**: Encapsulates a teacher's event schedule as a chronologically-ordered linked list.

**Responsibilities**:
- Maintain events in chronological order (by start time)
- Expose query methods for inspection (non-mutating)
- Store teacher metadata and related data

**Key Methods**:
```typescript
// Query methods (read-only)
getAllEvents(): EventNode[]
getEarliestEventTime(): string | null
getEventById(eventId: string): EventNode | null

// Data access (for UI)
teacher: TeacherInfo
events: EventNode (linked list head)
```

**Data Structure**:
```typescript
interface EventNode {
    id: string;
    lessonId: string;
    bookingId: string;
    eventData: {
        date: string;           // ISO format: "HH:MM"
        duration: number;       // Minutes
        location: string;
        status: string;
    };
    studentData: StudentData[];
    packageData: PackageData;
    next: EventNode | null;    // Linked list pointer
}
```

**Dependencies**:
- None (pure data structure)

**Usage Pattern**:
```typescript
// Reading data
const queue = teacherQueues[0];
const earliestTime = queue.getEarliestEventTime();
const allEvents = queue.getAllEvents();

// Never modified directly - use QueueController
```

---

### 3. QueueController (Mutation Layer)

**Location**: `backend/QueueController.ts`

**Role**: Handles all mutations to TeacherQueue while enforcing time constraints and gap respect.

**Responsibilities**:
- Move events up/down in queue while maintaining order
- Adjust event times (30-minute increments)
- Adjust event durations (respecting min/max)
- Add events in chronological order
- Cascade time adjustments only when no gap exists
- Respect intentional gaps between lessons

**Key Methods**:
```typescript
// Queue manipulation
moveUp(eventId: string): void
moveDown(eventId: string): void
moveToPosition(eventId: string, position: number): void
addToQueueInChronologicalOrder(eventNode: EventNode): void

// Time adjustment
adjustTime(eventId: string, increment: boolean): void
adjustDuration(eventId: string, increment: boolean): void
adjustFirstEventByOffset(offsetMinutes: number): void  // For global adjustments

// Properties
getEventModCardProps(eventId: string): EventModCardProps | null
```

**Gap Respecting Logic**:
```typescript
// When adjusting a lesson's time:
// 1. Check if gap exists between this event and next event
// 2. If gap exists: DON'T cascade to next event (respect intentional gap)
// 3. If NO gap: cascade time adjustment to maintain chronological order
// 4. Same logic for duration changes

// Example:
// Event A at 10:00 → Event B at 10:30 (gap = 0, required = 15 min)
// Adjust A by +30 min → A moves to 10:30, B cascades to 11:00
// Result: Gap now exists (required 15, have 0 → issue)
```

**Dependencies**:
- `ControllerSettings` (for constraint values)
- `TeacherQueue` (the queue being modified)
- Getter functions (queue-getter.ts for time conversions)

**Usage Pattern**:
```typescript
// Always use QueueController for mutations
const queueController = new QueueController(queue, controller, () => {
    setRefreshKey((prev) => prev + 1);
});

queueController.adjustTime(eventId, true);  // +30 min
queueController.adjustDuration(eventId, false);  // -stepDuration
```

---

### 4. GlobalFlag (State Machine)

**Location**: `backend/models/GlobalFlag.ts`

**Role**: Centralized state management for global time adjustments across multiple teachers.

**Responsibilities**:
- Track adjustment mode (on/off)
- Track lock state (all teachers synced or independent)
- Store original queue states for change detection
- Manage pending teachers participating in adjustment
- Coordinate cascading time adjustments across all queues
- Detect which events changed during adjustment phase

**Key Methods**:
```typescript
// Mode management
enterAdjustmentMode(): void          // Start global adjustment
exitAdjustmentMode(): void           // End global adjustment
isAdjustmentMode(): boolean
getGlobalTime(): string | null       // Current adjustment slider value
getGlobalEarliestTime(): string | null // Earliest across all teachers

// Teacher management
optIn(teacherUsername: string): void
optOut(teacherUsername: string): void
getPendingTeachers(): ReadonlySet<string>

// Time adjustment (respects lock state)
adjustTime(newTime: string): void    // Unlocked: respect existing times
                                     // Locked: force all to exact time
adapt(): void                        // Lock/unlock toggle

// Change tracking
collectChanges(): Array<{ id, date, duration }>
```

**State Lifecycle**:
```
Initial State
    ↓
User clicks flag → enterAdjustmentMode()
    - Store all original queue states
    - Add all teachers to pending
    - Set adjustmentMode = true
    ↓
User adjusts time slider → adjustTime()
    - If unlocked: only move teachers starting before slider
    - If locked: move all to exact adjustment time
    ↓
User toggles lock → adapt()
    - If unlocked: sync all to earliest, then lock
    - If locked: just unlock
    ↓
User clicks Submit → collectChanges() + save
    - Compare current vs original states
    - Return only changed events
    ↓
Success → exitAdjustmentMode()
    - Clear original states
    - Exit adjustment mode
    - Reset lock state
```

**Locked vs Unlocked Behavior**:

| Behavior | Unlocked | Locked |
|----------|----------|--------|
| **Time Adjustment** | Only move teachers with earliest < adjustment time | Force all teachers to exact adjustment time |
| **UI State** | LockOpen icon (blue) | Lock icon (outlined) |
| **Adaptation** | N/A | Click lock to sync all then lock |
| **Use Case** | Gradual shift forward (don't affect teachers already later) | Synchronize all teachers to same start time |

**Dependencies**:
- `TeacherQueue[]` (all teacher queues)
- `ControllerSettings` (for time adjustments via QueueController)
- `QueueController` (created on-demand for adjustments)

**Usage Pattern**:
```typescript
// In TeacherClassDaily component
const globalFlag = useMemo(
    () => new GlobalFlag(teacherQueues, controller, () => {
        setRefreshKey((prev) => prev + 1);  // Trigger re-render
    }),
    [teacherQueues, controller]
);

// In GlobalFlagAdjustment UI
globalFlag.enterAdjustmentMode();
globalFlag.adjustTime("13:30");
globalFlag.adapt();
const changes = globalFlag.collectChanges();
globalFlag.exitAdjustmentMode();
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ TeacherClassDaily (Parent)                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Creates & owns:                                         │ │
│ │ - GlobalFlag instance                                   │ │
│ │ - onRefresh callback                                    │ │
│ │ - handleGlobalSubmit handler                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         ↓                ↓                ↓                 │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ GlobalFlag │  │ TeacherQueue │  │ Teacher      │       │
│  │ Adjustment │  │ Editor       │  │ Column       │       │
│  └────────────┘  └──────────────┘  └──────────────┘       │
│         │              │                   │               │
│         └──────────────┴───────────────────┘               │
│                  Reads/modifies globalFlag                 │
└─────────────────────────────────────────────────────────────┘
            │              │
            ↓              ↓
    ┌──────────────┐  ┌─────────────────┐
    │ GlobalFlag   │  │ QueueController │
    │              │  │                 │
    │ - Mode state │  │ - Mutation logic│
    │ - Lock state │  │ - Gap respect   │
    │ - Pending    │  │ - Time adjust   │
    │ - Original   │  └─────────────────┘
    │   states     │          │
    │ - Changes    │          ↓
    └──────────────┘  ┌─────────────────┐
            │         │ TeacherQueue    │
            │         │                 │
            │         │ Linked-list of  │
            │         │ events (ordered)│
            │         └─────────────────┘
            └──────────────────────┘
               Uses ControllerSettings
```

---

## Data Flow Example: Adjusting Global Time

### Scenario: Shift all teachers +30 minutes (unlocked)

```
1. User clicks chevron to adjust time
   GlobalFlagAdjustment.handleAdjustTime(true)
       └─> globalFlag.adjustTime("13:30")

2. GlobalFlag.adjustTime("13:30") - UNLOCKED MODE
   └─> GlobalFlag.adjustTimeUnlocked("13:30")
       ├─> For each pending teacher:
       │   ├─> Get earliestTime from queue
       │   ├─> If earliestTime < "13:30":
       │   │   └─> Create QueueController
       │   │       └─> queueController.adjustFirstEventByOffset(30)
       │   │           └─> Move teacher's first event +30 min
       │   │               └─> Check gap to next event
       │   │                   ├─> If NO gap: cascade to next event
       │   │                   └─> If gap exists: STOP (respect gap)
       │   │
       │   └─> If earliestTime >= "13:30": DO NOTHING (waiting)
       │
       └─> Set globalTime = "13:30"
           └─> Call onRefresh() callback
               └─> setRefreshKey((prev) => prev + 1)

3. Component detects refreshKey change
   ├─> GlobalFlagAdjustment remounts with new key
   ├─> TeacherColumn components re-render
   └─> UI updates to show new times
       ├─> Lock button recalculates adaptedCount
       │   └─> Counts teachers with earliest == "13:30"
       └─> Adapted counter updates: "2/5"
```

### Result:
- Teacher A (was 12:00) → 12:30 ✓ (< adjustment time, moved)
- Teacher B (was 13:00) → 13:30 ✓ (< adjustment time, moved)
- Teacher C (was 14:00) → 14:00 ✗ (>= adjustment time, waiting)
- Lock button shows LockOpen (not all synchronized)

---

## Change Detection & Submission

```
1. During adjustment, GlobalFlag stores original states:
   ┌─────────────────────────────────┐
   │ originalQueueStates Map:        │
   │                                 │
   │ "teacher1" → [EventNode, ...]   │
   │ "teacher2" → [EventNode, ...]   │
   │ "teacher3" → [EventNode, ...]   │
   └─────────────────────────────────┘

2. User makes adjustments:
   - Teacher1: Event A shifts from 12:00 to 13:00 (CHANGED)
   - Teacher2: Event B stays at 13:00 (NO CHANGE)
   - Teacher3: Event C shifts from 14:00 to 14:30 (CHANGED)

3. User clicks Submit:
   globalFlag.collectChanges()
       └─> For each pending teacher:
           ├─> Get original events
           ├─> Get current events
           └─> Compare each event:
               ├─> If date changed: include in update
               ├─> If duration changed: include in update
               └─> If both same: SKIP

4. Return array:
   [
       { id: "event-A", date: "13:00", duration: 60 },
       { id: "event-C", date: "14:30", duration: 60 }
       // event-B not included (no change)
   ]

5. Send to server:
   bulkUpdateClassboardEvents(changes)
       └─> Only update 2 events in database (not 3)
```

---

## Key Design Patterns

### 1. Gap Respecting Cascades
**Problem**: When adjusting an event time, should we cascade to the next event?

**Solution**: Check if intentional gap exists
```typescript
// If gap exists: don't cascade (respect intentional spacing)
// If no gap: cascade (maintain chronological order)

// Example:
// Event A at 10:00, Event B at 10:20 (gap = 0)
// Required gap = 15 minutes
// Adjust A by +30 min
// → A moves to 10:30
// → B must cascade to maintain order
// → Result: A at 10:30, B at 10:50
```

### 2. Locked vs Unlocked Modes
**Unlocked**: Teachers move only if needed (natural progression)
- Good for: Shifting schedules while respecting existing times
- Teachers already later than adjustment time don't move

**Locked**: All teachers forced to exact time (strict synchronization)
- Good for: Syncing all students to single start time
- All teachers move regardless of current time

### 3. Original State Tracking
Stored at `enterAdjustmentMode()` for accurate change detection:
```typescript
originalQueueStates.set(
    username,
    events.map(e => ({
        ...e,
        eventData: { ...e.eventData }  // Deep copy
    }))
);
```

This allows comparing current vs. original to detect what actually changed.

### 4. Callback-Driven Re-renders
GlobalFlag doesn't trigger re-renders directly. Instead:
```typescript
new GlobalFlag(queues, controller, () => {
    setRefreshKey((prev) => prev + 1);  // Parent handles re-render
})
```

This keeps GlobalFlag pure (no React imports) and parent-agnostic.

---

## Common Patterns & Best Practices

### ✅ Correct: Use QueueController for mutations
```typescript
const queueController = new QueueController(queue, controller, onRefresh);
queueController.adjustTime(eventId, true);
```

### ❌ Incorrect: Directly mutating queue
```typescript
// DON'T DO THIS
event.eventData.date = "14:00";
queue.refreshKey++;
```

### ✅ Correct: Let GlobalFlag manage state
```typescript
globalFlag.adjustTime(newTime);
globalFlag.collectChanges();
```

### ❌ Incorrect: Tracking state in component
```typescript
// DON'T DO THIS
const [originalStates, setOriginalStates] = useState(...);
// This duplicates GlobalFlag logic
```

### ✅ Correct: Compare against globalFlag.getGlobalTime()
```typescript
const adapted = queues.filter(q =>
    q.getEarliestEventTime() === globalFlag.getGlobalTime()
).length;
```

### ❌ Incorrect: Comparing against another value
```typescript
// DON'T DO THIS
q.getEarliestEventTime() === currentEarliestFromPending
// This doesn't match the adjustment slider value
```

---

## Dependency Summary

```
ControllerSettings
    ↓ (used by)
    ├─> QueueController (time constraints)
    ├─> GlobalFlag (for constraint values)
    └─> UI Components (for validation)

TeacherQueue
    ↓ (mutated by)
    ├─> QueueController (primary mutator)
    └─> GlobalFlag (via QueueController)

QueueController
    ↓ (uses)
    ├─> TeacherQueue (the queue being mutated)
    └─> ControllerSettings (constraint values)

GlobalFlag
    ↓ (orchestrates)
    ├─> TeacherQueue[] (all queues)
    ├─> QueueController (on-demand for mutations)
    ├─> ControllerSettings (for adjustments)
    └─> Callback (triggers parent re-render)

TeacherClassDaily (Parent Component)
    ↓ (owns)
    ├─> GlobalFlag instance
    ├─> onRefresh callback
    └─> handleGlobalSubmit
```

---

## Summary

The classboard architecture achieves **separation of concerns** through layered abstraction:

1. **ControllerSettings**: Configuration (no dependencies)
2. **TeacherQueue**: Data structure (no dependencies)
3. **QueueController**: Mutations (depends on Queue + Settings)
4. **GlobalFlag**: Orchestration (depends on Queue + Controller + Settings)
5. **React Components**: UI (depends on GlobalFlag for state, QueueController for mutations)

This design allows:
- **Testing**: Each layer can be tested independently
- **Reusability**: Components can use GlobalFlag without knowing implementation
- **Maintenance**: Changes to one layer don't leak to others
- **Clarity**: Each class has a single, clear responsibility
