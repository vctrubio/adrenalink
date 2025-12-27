# Databoard Activity Filtering: Architecture & Optimization Guide

## Overview

This document describes the current databoard activity filtering architecture and provides three optimization approaches for different scale requirements. Use this guide to understand when and how to optimize the databoard filtering system.

## Current Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Server Action (getStudents, getTeachers, getBookings, etc.)    │
│ - Fetches ALL records with relations & stats from database     │
│ - Parallel: ORM queries + SQL stats aggregation                │
│ - Returns: AbstractModel[] with schema + relations             │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Page Component (students/page.tsx, teachers/page.tsx, etc.)    │
│ - Server Component                                              │
│ - Calls action and passes data to DataboardRowsSection         │
│ - No filtering happens here                                     │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ DataboardRowsSection (ClientDataHeader.tsx)                    │
│ - Client Component                                              │
│ - Receives all data from page                                   │
│ - Calls useDataboard hook for filtering/grouping              │
│ - Passes controller.activity filter from layout context        │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ useDataboard Hook (src/hooks/useDataboard.ts)                  │
│ - Filter Pipeline (runs in-memory on client):                  │
│   1. filterDataBySearch()      - Keyword search                │
│   2. filterDataByDate()        - Date range filter             │
│   3. filterDataByEntity()      - Entity-specific filter        │
│   4. filterDataByActivity()    - Active/Inactive filter        │
│   5. groupData()               - Group by date/field           │
│ - Returns: DataboardGroup<T>[] with grouped & filtered data   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ GroupDataRows Component                                         │
│ - Renders filtered results                                      │
│ - Individual row components expand/collapse                     │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Pipeline

The `useDataboard` hook applies 5 sequential filter/processing steps:

```typescript
// src/hooks/useDataboard.ts (lines 198-202)
const searchedData = filterDataBySearch(data); // Filter 1: Search keywords
const filteredData = filterDataByDate(searchedData); // Filter 2: Date range
const entityFilteredData = filterDataByEntity(filteredData); // Filter 3: Entity-specific
const activityFilteredData = filterDataByActivity(entityFilteredData); // Filter 4: Active/Inactive
const groupedData = groupData(activityFilteredData); // Processing 5: Grouping
```

**Current Behavior**: Each filter creates intermediate arrays. On every state change, all 5 operations re-run.

### Strengths of Current Architecture

1. **Separation of Concerns**: Clean separation between server data fetching and client filtering
2. **Server Components**: Pages are server components, good for SEO and initial render
3. **Parallel Queries**: SQL stats run in parallel with ORM queries (performance optimization)
4. **Type Safety**: Strong TypeScript throughout
5. **Flexible Filtering**: Easy to add/modify filters on client-side without server deployment
6. **DRY Relations**: Consistent `with` clauses across queries

### Current Limitations

1. **Over-fetching**: Sends all data from server to client, even if user filters to Active only (50% wasted)
2. **Client-side Overhead**: All filtering happens client-side, slower for large datasets
3. **No Memoization**: Re-filters entire dataset on every render, even when filters unchanged
4. **Chained Filters**: 5 sequential array operations (O(5n) instead of O(n))
5. **Deep Nesting**: Equipment queries nest 3 levels deep, fetches unnecessary nested data
6. **No State Persistence**: Filter state lost on page refresh (kept in React useState only)

### Performance Breakdown Points

| Dataset Size     | Current       | Issues                                                            |
| ---------------- | ------------- | ----------------------------------------------------------------- |
| < 100 records    | ✅ Fine       | None                                                              |
| 100-500 records  | ⚠️ Acceptable | Slightly slow filter response, visible lag when toggling activity |
| 500-2000 records | ❌ Slow       | Noticeable delay (500ms+), can have stutter when rendering        |
| 2000+ records    | ❌ Very Slow  | 1-2s+ delay, janky UI, potential OOM issues                       |

---
