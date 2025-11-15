# Classboard Module Architecture & Queue Management

## Overview

The classboard module (`src/app/(admin)/classboard/`) is organized to reduce code duplication, establish single sources of truth, and improve maintainability. This document outlines the architecture and core queue management logic.

## Core Principle: Less Code = More Maintainable

Logic is consolidated into appropriate layers with clear separation of concerns. Each file has a single responsibility.

---

## Current Architecture

### Single Source of Truth Entry Point

**`onAddLessonEvent` in ClientClassboard.tsx**
- Main entry point for adding lessons (via drag-drop, buttons, etc.)
- Responsible for orchestrating the smart insertion workflow
- All lesson creation flows through this function

---

## Layer Responsibilities

### 1. **Data Processing & State Management**
**File:** `useClassboard.ts` (Hook)

**Responsibilities:**
- Fetch initial classboard data via server actions
- Process and transform raw data into queue structures
- Manage real-time listeners (event/booking changes)
- Maintain classboard state (selected date, search, controller settings)
- Build TeacherQueue instances from database records
- Calculate classboard statistics

**Should NOT contain:**
- Component rendering logic
- Event creation API calls (use actions instead)
- TeacherQueue-specific logic (belongs in TeacherQueue class)

---

### 2. **API Layer**
**File:** `actions/classboard-action.ts` (Server Actions)

**Responsibilities:**
- Database operations only (create, read, update, delete events)
- User authentication/authorization checks
- Direct database schema interactions via Drizzle ORM
- Error handling for database failures

**Functions:**
- `getClassboardBookings()` - Fetch all bookings
- `createClassboardEvent()` - Create single event
- `deleteClassboardEvent()` - Delete single event
- `batchUpdateClassboardEvents()` - Update multiple events
- `updateClassboardEventLocation()` - Update event location

**Should NOT contain:**
- Business logic or calculations
- State management
- Data transformation (handled by useClassboard)

---

### 3. **Helper Functions & Getters**
**File:** `getters/classboard-getter.ts` (Utility Functions)

**Responsibilities:**
- Calculate helper values (durations, gaps, earnings, stats)
- Transform data into display formats
- Pure functions with no side effects
- Reusable across components

**Examples:**
- `getPrettyDuration(minutes: number)` - Format duration
- `calculateTeacherStatsFromEvents()` - Calculate stats
- `createClassboardModel()` - Create model from raw data

**Should NOT contain:**
- State management
- API calls
- React hooks

---

### 4. **Business Logic Models - TeacherQueue**
**File:** `backend/TeacherQueue.ts` (Class)

**Core Responsibilities:**
- Manage teacher event queue structure (linked list)
- Ensure chronological ordering of events
- Respect intentional gaps between events
- Smart insertion with gap validation
- Time and duration adjustments with gap awareness

**Queue Operations:**

#### Insertion
- `addToQueue(eventNode)` - Add to tail (basic append)
- `addToQueueInChronologicalOrder(eventNode, gapMinutes)` - Insert in time order
  - Checks if event should be at head (before first event with gap requirement)
  - Finds correct chronological position if in middle
  - Respects gap requirements between events

#### Time Adjustments (Respect Existing Gaps)
- `adjustLessonTime(lessonId, increment)` - Move event forward/backward by 30min
  - **Key Logic:** Only cascades to next event if it's adjacent (no gap)
  - If next event has a gap, its position is respected and not moved
- `adjustLessonDuration(lessonId, increment)` - Increase/decrease duration by 30min
  - **Key Logic:** Only cascades to next event if it's adjacent (no gap)
  - If next event has a gap, it maintains that gap

#### Event Reordering (Respects Gaps)
- `moveLessonUp(lessonId)` / `moveLessonDown(lessonId)` - Change queue position
  - Swaps position with adjacent event
  - `recalculateStartTimesFromPosition()` - Recalculates times after swap
  - **Key Logic:** Stops recalculating when it encounters a gap (preserves intentional gaps)

#### Gap Management
- `removeGap(lessonId)` - Removes gap before an event (moves event up)
- Gap detection: `nextStartTime > currentEndTime` = gap exists

**Should NOT contain:**
- React components
- API calls
- State management

---

### 5. **Statistics Logic**
**File:** `backend/ClassboardStats.ts` (Class)

**Responsibilities:**
- Aggregate statistics across teachers/events
- Calculate earnings, event counts, durations
- Global stats calculations
- Teacher-specific stats

**Should NOT contain:**
- Component rendering
- API calls
- Queue management

---

### 6. **Component Layer**
**Files:** Individual component files in `src/app/(admin)/classboard/`

**Responsibilities:**
- Render UI only
- Handle user interactions (clicks, drag-drop)
- Call `onAddLessonEvent` for all lesson creation paths
- Delegate to handlers passed via props

**Component Structure:**
- `ClientClassboard.tsx` - Main orchestrator, defines all handlers
- `TeacherClassDaily.tsx` - Teacher columns layout
- `StudentClassDaily.tsx` - Student booking list
- `EventCard.tsx` - View-mode event display
- `EventModCard.tsx` - Edit-mode event display
- Specialized components (Controller, etc.)

**Should NOT contain:**
- Business logic
- API calls (use actions via parent)
- Queue management logic

---

## Refactoring Tasks

### Phase 1: Consolidate Entry Points ✅ COMPLETED
- ✅ Establish `onAddLessonEvent()` as the single entry point for lesson creation
- ✅ Remove duplicate lesson creation logic from `TeacherClassDaily.handleDrop()`
- ✅ Pass `onAddLessonEvent` down through component tree via props

### Phase 2: Separate Concerns ✅ MOSTLY COMPLETED
- ✅ All TeacherQueue logic consolidated into `backend/TeacherQueue.ts`
  - ✅ Chronological ordering via `addToQueueInChronologicalOrder()`
  - ✅ Gap-respecting time adjustments in `adjustLessonTime()` and `adjustLessonDuration()`
  - ✅ Gap-preserving reordering in `moveLessonInQueue()`
- ✅ Statistics logic in `backend/ClassboardStats.ts`
- ✅ Helper functions organized into getters:
  - ✅ `getters/queue-getter.ts` - Queue-specific utilities (timeToMinutes, getTimeFromISO, etc.)
  - ✅ `getters/date-getter.ts` - General date utilities
  - ✅ `getters/event-getter.ts` - Event calculations (gaps, time ranges)
  - ✅ `getters/timezone-getter.ts` - Only convertUTCToSchoolTimezone()
- ✅ `classboard-action.ts` contains only API calls
- ✅ `useClassboard.ts` focuses on data orchestration and real-time listeners

### Phase 3: Remove Duplicate Code ✅ COMPLETED
- ✅ Eliminated duplicate gap calculations (centralized in event-getter.ts)
- ✅ Eliminated duplicate time functions (centralized in queue-getter.ts)
- ✅ Consolidated event time calculations into helper functions
- ✅ Single source of truth for each calculation

### Phase 4: Simplify Components ✅ IN PROGRESS
- ✅ Removed business logic from components (delegated to TeacherQueue)
- ✅ Memoized events array in TeacherColumn to trigger gap recalculation
- [ ] Further reduce prop drilling by using composition (future enhancement)

---

## Achieved Outcomes ✅

**Refactoring Results:**
- ✅ Lean components (rendering only, minimal business logic)
- ✅ Clear separation of concerns (data/API/logic/UI layers)
- ✅ Single source of truth for each calculation
- ✅ Easier to test (pure functions in getters, isolated TeacherQueue logic)
- ✅ Easier to modify (change logic in one place)
- ✅ Better code reusability (shared getters across components)
- ✅ Queue respects intentional gaps between events
- ✅ Events maintain chronological order when added
- ✅ Gap detection updates dynamically when adjacent events change

---

## Key Files Not to Touch

- `EventSettingController.tsx` - Controller UI for global settings
- `GlobalFlagAdjustment.tsx` - Global time adjustment UI
- UI-specific components that are already well-structured

---

## Timezone & Time Handling ✅ RESOLVED

### Architecture
- **Storage:** Events stored in UTC (TIMESTAMPTZ) in database
- **Display:** Events shown in UTC (consistent throughout)
- **Calculations:** All time math uses ISO parsing (no browser timezone conversion)

### Getter Organization
- **`queue-getter.ts`** - ISO time parsing and queue-specific calculations
  - `getTimeFromISO()` - Parse HH:MM from ISO string
  - `getMinutesFromISO()` - Parse total minutes from ISO string
  - `adjustISODateTime()` - Safe ISO datetime adjustment
  - `createISODateTime()` - Create ISO string from date and time
  - `timeToMinutes()` / `minutesToTime()` - Time format conversions

- **`timezone-getter.ts`** - Timezone conversion (for future school-specific timezones)
  - `convertUTCToSchoolTimezone()` - Convert UTC to school timezone

- **`event-getter.ts`** - Event-specific calculations
  - `detectGapBefore()` - Detect gap before event
  - `getEventEndTime()` - Calculate event end time
  - `getEventCardProps()` - Consolidated prop calculation for EventModCard

### TeacherQueue Time Safety
All TeacherQueue methods work with ISO datetime strings:
- `adjustLessonTime()` - Adjusts event time while respecting next event's gap
- `adjustLessonDuration()` - Adjusts duration while respecting next event's gap
- Uses `getMinutesFromISO()` for all time comparisons
- Uses `adjustISODateTime()` and `createISODateTime()` for all mutations

### Future: School-Specific Timezone Support
Infrastructure ready for school timezone display:
- School table has `timezone` field (IANA timezone)
- `convertUTCToSchoolTimezone()` function available
- Ready for implementation when needed

---

## Implementation Notes

### Queue Behavior Rules
1. **Chronological Ordering** - Events are always inserted in time order (head = earliest)
2. **Gap Respect** - Intentional gaps between events are preserved during adjustments
3. **Adjacent Cascade** - Only adjacent events (no gap) cascade time changes
4. **Single Responsibility** - All queue logic lives in TeacherQueue class, not in components

### Key Design Decisions
- TeacherQueue uses linked list for efficient insertion/deletion
- Gap detection uses simple time math: `nextStart > currentEnd = gap exists`
- Components are stateless (state managed via TeacherQueue mutations)
- Real-time listeners refresh entire queue to avoid sync issues
- Drag-drop flow uses `addToQueueInChronologicalOrder()` to maintain order
