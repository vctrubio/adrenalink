# Classboard Module Refactoring Plan

## Overview

The classboard module (`src/app/(admin)/classboard/`) needs refactoring to reduce code duplication, establish single sources of truth, and improve maintainability. This document outlines the strategy and expected improvements.

## Principle: Less Code = More Maintainable

We will consolidate logic into appropriate layers and eliminate duplicate/irrelevant code.

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

### 4. **Business Logic Models**
**File:** `backend/TeacherQueue.ts` (Class)

**Responsibilities:**
- Manage teacher event queue structure (linked list)
- All queue operations (add, remove, reorder, time adjustments)
- Smart insertion logic (`getSmartInsertionInfo()`)
- Gap detection and management
- Event movement operations

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

### Phase 1: Consolidate Entry Points ✅
- Establish `onAddLessonEvent()` as the single entry point for lesson creation
- Remove duplicate lesson creation logic from `TeacherClassDaily.handleDrop()`
- Pass `onAddLessonEvent` down through component tree via props

### Phase 2: Separate Concerns (Next Token Budget)
- [ ] Move all TeacherQueue logic into `backend/TeacherQueue.ts`
- [ ] Move all statistics logic into `backend/ClassboardStats.ts`
- [ ] Create/consolidate helper functions in `getters/classboard-getter.ts`
- [ ] Ensure `classboard-action.ts` contains only API calls
- [ ] Clean up `useClassboard.ts` to focus on data orchestration

### Phase 3: Remove Duplicate Code
- [ ] Eliminate duplicate duration calculations (use helpers)
- [ ] Eliminate duplicate gap calculations (use TeacherQueue methods)
- [ ] Eliminate duplicate capacity-to-duration mappings
- [ ] Consolidate event time calculations into helper functions

### Phase 4: Simplify Components
- [ ] Remove business logic from components
- [ ] Reduce prop drilling by using composition
- [ ] Ensure each component has single responsibility

---

## Expected Outcomes

**Before Refactoring:**
- Duplicated logic across components
- Mixed concerns (UI + business logic)
- Multiple sources of truth for same calculations
- Harder to test and maintain

**After Refactoring:**
- Lean components (rendering only)
- Clear separation of concerns
- Single source of truth for each concern
- Easier to test (pure functions, isolated logic)
- Easier to modify (change logic in one place)
- Better code reusability

---

## Key Files Not to Touch

- `EventSettingController.tsx` - Controller UI for global settings
- `GlobalFlagAdjustment.tsx` - Global time adjustment UI
- UI-specific components that are already well-structured

---

## CRITICAL BUG: Timezone Handling ✅ FIXED

### Issue (RESOLVED)
Time adjustments in EventModCard were not working correctly due to timezone mismatch:
- **Database stores:** `2025-11-14 11:30:00+00` (UTC)
- **Classboard was displaying:** `12:30` (Browser local time, e.g., UTC+1)
- **Problem:** When adjusting time, we were mixing UTC database times with local display times, causing incorrect calculations

### Root Cause
- Event times are stored as TIMESTAMPTZ in Supabase (UTC)
- `getTimeFromISO()` was using `.getHours()` which converted UTC to browser's local timezone
- Time adjustments in TeacherQueue worked on the UTC value, but display showed local time
- This caused the "first click goes wrong direction" bug

### Solution ✅ IMPLEMENTED
**Week 1: TeacherQueue Refactoring (COMPLETED)**

1. **Fixed `getters/timezone-getter.ts`:**
   - ✅ Fixed `getTimeFromISO()` to parse ISO directly without timezone conversion
   - ✅ Added `getMinutesFromISO()` for direct minute extraction
   - ✅ Added `adjustISODateTime()` for timezone-safe time adjustments
   - ✅ Added `createISODateTime()` for creating ISO strings
   - ✅ Added `convertUTCToSchoolTime()` and `convertSchoolTimeToUTC()` for future school timezone support

2. **Created `getters/event-getter.ts`:**
   - ✅ Moved `detectGapBefore()` from component to getter (DRY principle)
   - ✅ Fixed to use `getMinutesFromISO()` instead of broken `timeToMinutes(eventData.date)`
   - ✅ Added `getEventEndTime()` helper
   - ✅ Added `getEventTimeRange()` helper
   - ✅ Added `getEventCardProps()` to reduce prop drilling

3. **Refactored `backend/TeacherQueue.ts`:**
   - ✅ Updated `getStartTimeMinutes()` to use `getMinutesFromISO()`
   - ✅ Updated `updateEventDateTime()` to use `adjustISODateTime()`
   - ✅ Updated `recalculateStartTimesFromPosition()` to use `createISODateTime()`
   - ✅ Updated `removeFromQueueWithCascade()` to use `createISODateTime()`
   - ✅ Removed all debug logging

4. **Refactored components:**
   - ✅ Updated `TeacherEventQueueEditor.tsx` to use `getEventCardProps()`
   - ✅ Removed duplicate `detectGapBefore()` from component
   - ✅ Simplified `eventCards` useMemo
   - ✅ Removed debug logging from EventModCard.tsx
   - ✅ All components now use timezone-safe utilities

### Current State
- Events are stored in UTC and displayed in UTC consistently
- Time adjustments work correctly (no more "first click goes wrong direction")
- All time calculations are timezone-safe (parsing ISO directly)
- Code follows DRY principle (single source of truth for calculations)

### Future Enhancement: School-Specific Timezone Support
The infrastructure is now in place for school-specific timezone support:
- School table has `timezone` field (IANA timezone like "Europe/Madrid")
- `getSchoolTimezoneFromHeader()` retrieves cached school timezone
- `convertUTCToSchoolTime()` and `convertSchoolTimeToUTC()` functions exist
- Components would need to pass school timezone down the tree for conversion

**To implement:**
1. Fetch school timezone in ClientClassboard
2. Pass timezone to EventModCard and TimeControls
3. Use `convertUTCToSchoolTime()` when displaying times
4. Use `convertSchoolTimeToUTC()` when creating/updating events

---

## Notes

- All changes must maintain backward compatibility with existing features
- Real-time listeners should continue to work without modification
- Drag-drop functionality must remain intact
- Edit mode (queue editor) must remain functional
- Timezone bug is blocking reliable time adjustments - fix in next token budget
