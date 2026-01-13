# Classboard Performance Optimization - Critical Planning Document

## Executive Summary

**Severity: CRITICAL - Pre-Production Blocker**

The ClassboardProvider is re-rendering constantly despite data remaining stable (Queues: 8, Events: 15 unchanged). This causes all child components to re-render unnecessarily, creating CPU-intensive loops that will be unacceptable in production.

**Root Cause:** `useClassboardFlag` hook returns a new object reference on every call, even when underlying data hasn't changed. Context consumers see this as a change and re-render.

---

## Problem Analysis

### Current Symptoms

```
Provider renders: Queues: 8, Events: 15, Mounted: true
Provider renders: Queues: 8, Events: 15, Mounted: true  ← Same data, new render
Provider renders: Queues: 8, Events: 15, Mounted: true  ← Infinite loop
```

### Impact

- TeacherQueueRow renders on every provider update (even without queue changes)
- Event logs spam the console (double logging from TeacherQueueRow + installHook)
- High CPU usage, browser lag
- Realtime subscriptions trigger re-renders unnecessarily
- Production: Unacceptable user experience

### Root Cause

In `classboard-provider.tsx:69`:

```typescript
const hookValue = useClassboardFlag({ initialClassboardModel, serverError });
// This creates a NEW object every render, even if data inside hasn't changed
// Context detects "new" value and propagates re-render to all consumers
```

---

## Desired Architecture

### Phase 1: Render Optimization (Immediate)

**Goal:** Prevent unnecessary re-renders when data hasn't actually changed

**Solution:** Memoize the hook return value

```typescript
const hookValue = useClassboardFlag({ initialClassboardModel, serverError });
const memoizedValue = useMemo(
    () => hookValue,
    [
        hookValue.teacherQueues.length,
        hookValue.bookingsForSelectedDate.length,
        hookValue.controller,
        hookValue.selectedDate,
        hookValue.globalFlag,
        // Only include dependencies that matter
    ],
);
```

**Dependencies Should Change Only When:**

- Queue count changes
- Event count changes
- Controller settings change
- Selected date changes
- Global flag state changes (not object reference)

---

### Phase 2: Event Queue Controller Pattern (Core Fix)

**Goal:** Isolate event modifications to queue controller; only render when absolutely necessary

#### Architecture Flow

```
User Action (e.g., click modify event)
    ↓
QueueController.modifyQueue(eventId, newData)
    ↓
[PENDING STATE - No render yet]
    ↓
EventListener picks up change
    ↓
[OPTIMISTIC UPDATE in TeacherQueue]
    ↓
[Server confirmation awaited with timeout]
    ↓
Success: Commit changes
    ↓
[SINGLE PROVIDER RE-RENDER with new data]
    ↓
Error/Timeout: Toast notification + Console warning
    ↓
[Rollback optimistic state]
```

#### Key Requirements

1. **Queue Controller Abstraction**
    - Single entry point for all event modifications
    - Manage pending state internally
    - Track event awaiting server confirmation
    - Timeout handling (configurable, e.g., 10s)

2. **Event Listener Pattern**
    - Listen for "event committed" signal from server
    - Mark event as confirmed
    - Propagate single render cycle to provider

3. **No Render Until Committed**
    - Optimistic updates stay local to TeacherQueue
    - Provider only re-renders when server confirms
    - Failed operations rollback silently + notify user

4. **Error Handling**
    ```typescript
    // If event not confirmed within timeout:
    console.warn(`⚠️ [EventQueue] Event ${eventId} not confirmed after ${TIMEOUT}ms`);
    toast.error(`Failed to save changes. Please try again.`);
    rollbackOptimisticUpdate(eventId);
    ```

---

## Implementation Steps

### Step 1: Fix Immediate Re-render Issue

**File:** `src/providers/classboard-provider.tsx`

- Implement useMemo wrapper around hookValue
- Use stable dependency array (primitive values only)
- Verify provider renders only when actual data changes

**Acceptance Criteria:**

- Provider logs show render only when queue/event count changes
- No duplicate renders with identical data

---

### Step 2: Create QueueController Enhancement

**Files:**

- `backend/classboard/QueueController.ts` (extend existing)
- `backend/classboard/EventQueue.ts` (new - pending events tracker)

**Responsibilities:**

- Track pending modifications with unique ID
- Await server confirmation with configurable timeout
- Trigger provider re-render only on success
- Expose rollback method for failures

---

### Step 3: Implement Event Listener

**Files:**

- `src/hooks/useEventListener.ts` (new)
- Integrate with existing realtime sync mechanism

**Responsibilities:**

- Listen for "event:confirmed" signals
- Resolve pending event promises
- Trigger single context update

---

### Step 4: Update TeacherQueue Component

**File:** `src/app/(admin)/classboard/TeacherQueueRow.tsx`

**Changes:**

- When user modifies event, call `QueueController.modifyQueue()`
- Show optimistic UI locally (no provider update)
- Wait for event listener confirmation
- If confirmed: Re-render via provider update
- If timeout/error: Show toast + rollback UI

---

### Step 5: Add Comprehensive Logging

**All modified files:**

- Log when modifications enter queue controller
- Log when events are awaited by listener
- Log confirmations and timeouts
- Log rollbacks with reasons

**Format:**

```typescript
console.log(`🎫 [Queue] Event ${id} modification queued`);
console.warn(`⚠️ [Queue] Event ${id} not confirmed after ${ms}ms`);
console.log(`✅ [Queue] Event ${id} confirmed and rendered`);
```

---

## Verification Strategy

### Unit Tests

- [ ] Provider memoization prevents unnecessary renders
- [ ] Queue controller tracks pending events correctly
- [ ] Event listener resolves promises on confirmation
- [ ] Timeout triggers rollback after X ms
- [ ] Failed confirmations show toast + warning

### Integration Tests

- [ ] Single user modifies event → single render
- [ ] Multiple users modify different events → single render per event
- [ ] Slow network (5s delay) → shows pending state, no UI freeze
- [ ] Network error → toast + rollback without console spam

### Performance Benchmarks

- [ ] Provider render count < 5 per minute during normal use
- [ ] Event modification latency < 500ms (optimistic) + network time
- [ ] CPU usage < 10% during idle
- [ ] Memory stable during 1hr session (no leaks)

### Production Readiness Checklist

- [ ] No console warnings during normal operation
- [ ] All error cases handled gracefully (toast + log)
- [ ] Realtime subscriptions properly cleaned up
- [ ] No infinite loops or render cascades
- [ ] Performance acceptable on low-end devices

---

## Timeline & Ownership

### Phase 1 (Immediate - This Sprint)

- Fix provider memoization
- Add detailed logging to identify remaining issues
- **Owner:** [To Assign]
- **Estimated:** 2-3 hours

### Phase 2 (Next Sprint - Core Fix)

- Implement QueueController pattern
- Create EventListener integration
- Update TeacherQueue component
- **Owner:** [To Assign]
- **Estimated:** 1-2 days

### Phase 3 (Quality Assurance)

- Comprehensive testing (unit + integration)
- Performance benchmarking
- Production staging validation
- **Owner:** [To Assign]
- **Estimated:** 1 day

---

## Critical Success Criteria

**Must Achieve for Production Release:**

1. ✅ Provider only re-renders when data actually changes
2. ✅ No infinite render loops or cascading updates
3. ✅ Event modifications have predictable latency
4. ✅ All errors visible to user (toast notifications)
5. ✅ All errors logged for debugging (console warnings)
6. ✅ Component state remains stable during long sessions
7. ✅ CPU/memory usage acceptable on target devices
8. ✅ Code is spotless for production (no hacks, proper error handling)

---

## Risks & Mitigation

| Risk                                    | Impact                   | Mitigation                                   |
| --------------------------------------- | ------------------------ | -------------------------------------------- |
| Race conditions with concurrent edits   | Data loss/corruption     | Use optimistic locking + server validation   |
| Event listener timeout too short        | Users see false failures | Configurable timeout, clear messaging        |
| Provider still re-renders unnecessarily | Performance unchanged    | Extensive logging to identify trigger        |
| Rollback loses user progress            | User frustration         | Store pending changes in IndexedDB as backup |

---

## Notes for Development

- **Do not use shortcuts or workarounds** - This must be a proper architectural fix
- **Leave no console spam** - All logging must be intentional and diagnostic
- **Production-ready error handling** - Every failure path must have user feedback
- **Measurement first** - Verify each fix actually improves performance
- **Document decisions** - Future maintainers need to understand the pattern
