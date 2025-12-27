# Classboard Event Optimization

## Problem
When adding events to the Classboard (e.g., via drag-and-drop), there is a latency between the user action and the server confirmation (via Supabase Realtime). This can cause:
1.  **Race Conditions:** If a user adds multiple events quickly, the local `TeacherQueue` might not yet reflect the first event, causing the second event to be scheduled in the same slot.
2.  **Visual Glitches:** The UI might flicker or not show the new event immediately.
3.  **Connection Timeouts:** Heavy database querying for every small update can strain the connection pool.

## Solution: Optimistic Action Queue

We will implement an optimistic update pattern combined with an action queue.

### 1. Optimistic Updates
When `handleAddLessonEvent` is triggered:
1.  **Calculate Slot:** Determine the correct time/duration using the *current* local state (including any previously added pending events).
2.  **Inject Placeholder:** Immediately inject a temporary `EventNode` (with ID `temp-<timestamp>`) into the local `classboardData` state.
    *   This "reserves" the slot in the UI and for subsequent calculations.
    *   The event should visually indicate it is "posting" (e.g., opacity, spinner).
3.  **Submit Action:** Call the server action `createClassboardEvent` in the background.

### 2. Reconciliation
When the server action completes (or the Realtime subscription fires):
1.  **Match:** The new data will contain the real event (with a real UUID).
2.  **Replace:** The local state update from the server/subscription will naturally replace the optimistic state.
    *   *Strategy:* We rely on the fact that `classboardData` is the source of truth. When `onEventDetected` fires, it fetches the *canonical* state. We just need to make sure we don't *re-add* the temp event on top of it.
    *   **Implementation:**
        *   User adds event -> `setOptimisticEvents([...optimistic, newTempEvent])`.
        *   `TeacherQueue` merges `serverEvents` + `optimisticEvents`.
        *   When server confirms (listener), we remove the matching `optimisticEvent` (by correlation ID or by clearing the queue if we trust the refresh).

### 3. Action Queue (Serial Processing)
To prevent database contention:
*   We can use a simple mutex or promise chain for `handleAddLessonEvent` to ensure we don't fire 10 INSERTs in parallel if the user goes crazy.
*   However, `postgres.js` handles concurrency well. The main issue is logical slot contention. The Optimistic Update solves the logical contention (the slot is "taken" locally instantly).

## Implementation Steps
1.  **Modify `useClassboard`**: Add `addOptimisticEvent` function.
2.  **Update `ClientClassboard`**: Use this to inject the event before calling server.
3.  **Update `EventCard`**: Handle `status: 'posting'` styling.
