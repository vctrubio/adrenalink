# Timesheet Component System

## Overview

The timesheet component system provides a comprehensive time tracking interface inspired by modern time tracking applications. It supports multiple view modes (daily, weekly, monthly) with client-side grouping of server data.

## Core Principles

### 1. Modular Architecture

**Location:** `src/components/ui/timesheet/`

The timesheet system uses a modular structure with separate files for each component:

```
src/components/ui/timesheet/
├── timesheet.tsx              - Base container
├── timesheet-header.tsx       - Input area with timer and controls
├── timesheet-group.tsx        - Date/week/month group wrapper
├── timesheet-entry.tsx        - Individual time entry row
├── timesheet-view-toggle.tsx  - Daily/Weekly/Monthly toggle
└── index.ts                   - Exports all components
```

**Import Pattern:**

```tsx
import {
    Timesheet,
    TimesheetHeader,
    TimesheetGroup,
    TimesheetEntry,
    TimesheetViewToggle,
} from "@/src/components/ui/timesheet";
```

### 2. Server Data with Client Grouping

**Architecture Pattern:**

1. **Server Component (Page)** - Fetches data from database
2. **Client Component** - Handles grouping logic and view state
3. **UI Components** - Display grouped data

This pattern ensures:
- SEO-friendly server-side data fetching
- Interactive client-side grouping without server roundtrips
- Efficient data transfer (fetch once, group on client)

### 3. Three View Modes

**Daily View:**
- Groups by individual dates
- Shows "Today", "Yesterday", or formatted date
- Most granular view

**Weekly View:**
- Groups by week ranges (Monday - Sunday)
- Shows "Week: May 27 - Jun 2, 2024"
- Good for weekly summaries

**Monthly View:**
- Groups by month
- Shows "May 2024"
- Best for high-level overview

## Component API

### Timesheet (Container)

Base container with dark background and border.

**Props:**
- `children` (ReactNode) - TimesheetHeader and TimesheetGroup components

**Example:**
```tsx
<Timesheet>
    <TimesheetHeader />
    <TimesheetGroup>...</TimesheetGroup>
</Timesheet>
```

### TimesheetHeader

Input area with timer and action buttons.

**Props:**
- `onAddManually` (() => void) - Callback for "Add Manually" button
- `currentTimer` (string) - Timer display (default: "00:00:00")
- `onStartTimer` (() => void) - Callback for "Start" button
- `placeholder` (string) - Input placeholder (default: "What are you working on?")
- `rightActions` (ReactNode) - Optional additional controls

**Example:**
```tsx
<TimesheetHeader
    placeholder="What are you working on?"
    currentTimer="00:15:23"
    onAddManually={() => console.log("Add")}
    onStartTimer={() => console.log("Start")}
/>
```

### TimesheetGroup

Date/week/month group wrapper with summary.

**Props:**
- `title` (string) - Group title ("Today", "Week: ...", "May 2024")
- `trackerCount` (number) - Number of entries in group
- `totalDuration` (string) - Sum of all durations in format "HH:MM:SS"
- `children` (ReactNode) - TimesheetEntry components

**Example:**
```tsx
<TimesheetGroup
    title="Today"
    trackerCount={3}
    totalDuration="4:12:48"
>
    {/* TimesheetEntry components */}
</TimesheetGroup>
```

### TimesheetEntry

Individual time entry row.

**Props:**
- `number` (number) - Entry number in group
- `title` (string) - Task title
- `subtitle` (string) - Project name
- `tagLabel` (string) - Status/category tag text
- `tagColor` (string) - Tag color (hex)
- `timeStart` (string) - Start time (e.g., "10:23")
- `timeEnd` (string) - End time (e.g., "12:53")
- `duration` (string) - Duration in "HH:MM:SS" format
- `showDollar` (boolean) - Show dollar icon (default: true)
- `onContinue` (() => void) - Callback for "Continue" button
- `isSelected` (boolean) - Whether entry is selected
- `onSelect` (() => void) - Callback when checkbox clicked

**Example:**
```tsx
<TimesheetEntry
    number={1}
    title="Wireframe for Zoo Website"
    subtitle="Zoo Web Project"
    tagLabel="New Project"
    tagColor="#f97316"
    timeStart="10:23"
    timeEnd="12:53"
    duration="02:30:59"
    showDollar={true}
    isSelected={false}
    onSelect={() => {}}
    onContinue={() => {}}
/>
```

### TimesheetViewToggle

Toggle between daily, weekly, and monthly views.

**Props:**
- `currentView` ("daily" | "weekly" | "monthly") - Active view mode
- `onViewChange` ((view) => void) - Callback when view changes

**Example:**
```tsx
<TimesheetViewToggle
    currentView="daily"
    onViewChange={(view) => setViewMode(view)}
/>
```

## Implementation Guide

### Basic Setup (Server + Client Pattern)

**1. Create Server Component (Page):**

```tsx
// src/app/timesheet/page.tsx
import { TimesheetClient, type TimesheetEntryData } from "@/src/components/timesheet/timesheet-client";

async function getTimesheetEntries(): Promise<TimesheetEntryData[]> {
    // Fetch from database
    const entries = await db.query.timeEntries.findMany();

    return entries.map(entry => ({
        id: entry.id,
        title: entry.title,
        subtitle: entry.projectName,
        tagLabel: entry.status,
        tagColor: entry.statusColor,
        timeStart: formatTime(entry.startTime),
        timeEnd: formatTime(entry.endTime),
        duration: calculateDuration(entry.startTime, entry.endTime),
        date: new Date(entry.date),
        showDollar: entry.billable,
    }));
}

export default async function TimesheetPage() {
    const entries = await getTimesheetEntries();

    return (
        <div className="p-8">
            <TimesheetClient entries={entries} />
        </div>
    );
}
```

**2. Client Component Handles Grouping:**

The `TimesheetClient` component (located at `src/components/timesheet/timesheet-client.tsx`) automatically handles:
- View mode state (daily/weekly/monthly)
- Data grouping based on view mode
- Entry selection state
- Duration calculations

### Data Type Definition

```tsx
export type TimesheetEntryData = {
    id: string;
    title: string;
    subtitle: string;
    tagLabel: string;
    tagColor: string;
    timeStart: string;  // "HH:MM" format
    timeEnd: string;    // "HH:MM" format
    duration: string;   // "HH:MM:SS" format
    date: Date;
    showDollar?: boolean;
};
```

### Grouping Logic

The client component uses these helper functions:

**Daily Grouping:**
```tsx
const formatDate = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};
```

**Weekly Grouping:**
```tsx
const getWeekRange = (date: Date): string => {
    const startOfWeek = getMonday(date);
    const endOfWeek = addDays(startOfWeek, 6);

    return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "MMM d, yyyy")}`;
};
```

**Monthly Grouping:**
```tsx
const getMonthRange = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
};
```

### Duration Calculation

```tsx
const calculateTotalDuration = (entries: TimesheetEntryData[]): string => {
    let totalMinutes = 0;

    entries.forEach(entry => {
        const [hours, minutes, seconds] = entry.duration.split(":").map(Number);
        totalMinutes += hours * 60 + minutes + seconds / 60;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const secs = Math.floor((totalMinutes % 1) * 60);

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
```

## Styling Guidelines

### Container
- Background: `bg-slate-900/80` (dark, consistent with card/databoard)
- Border: `border-white/10`
- Border radius: `rounded-2xl`
- Text: `text-white` (inherited)

### Header
- Border bottom: `border-white/10`
- Input: `bg-transparent` with `border-white/20`
- Start button: `bg-green-500` with hover effect
- Timer: Font mono for consistent digit width

### Group Header
- Background: `bg-white/5`
- Text: `text-white/80` for title, `text-white/60` for meta
- Clock icon with duration display

### Entry Row
- Hover: `hover:bg-white/5`
- Selected checkbox highlight
- Tag badge with custom color background
- Continue button with border

## Color System for Tags

Common tag colors matching entity system:

```tsx
const tagColors = {
    newProject: "#f97316",    // Orange
    onGoing: "#22c55e",       // Green
    meetings: "#3b82f6",      // Blue
    development: "#8b5cf6",   // Purple
    review: "#ec4899",        // Pink
    planning: "#06b6d4",      // Cyan
};
```

## Best Practices

### DO ✅

- Fetch data on server for SEO and performance
- Pass complete data to client component
- Use TimesheetClient for grouping logic
- Maintain consistent tag colors
- Calculate durations server-side when possible
- Format times consistently ("HH:MM" for display, "HH:MM:SS" for duration)

### DON'T ❌

- Fetch data on client (use server components)
- Hardcode grouping logic in multiple places
- Mix different time formats
- Create custom timesheet layouts
- Override dark background theme
- Forget to handle edge cases (empty groups, invalid dates)

## Example Usage

**Complete Example:**

```tsx
// Server component
import { TimesheetClient } from "@/src/components/timesheet/timesheet-client";

export default async function Page() {
    const entries = await fetchEntriesFromDB();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Time Tracking</h1>
            <TimesheetClient entries={entries} />
        </div>
    );
}
```

See `src/app/(playground)/mock-timesheet/page.tsx` for a complete working example.

## Related Documentation

- `docs/Cards.md` - Card component system
- `docs/Databoard.md` - Databoard component system
- `docs/structure.md` - Project structure overview

## Summary

The timesheet component system provides:

**Key Features:**
- **Three view modes** - Daily, weekly, monthly grouping
- **Server-first architecture** - Data fetched on server, grouped on client
- **Modular components** - Separate files for each UI element
- **Consistent styling** - Dark theme matching card/databoard systems
- **Interactive entries** - Selection, continuation, timer controls
- **Automatic calculations** - Total durations per group

**Key Takeaways:**
- Always fetch data in server components
- Use TimesheetClient for grouping and state management
- View mode toggle changes grouping without refetching
- Duration format: "HH:MM:SS" for consistency
- Tag colors should match entity system
- Dark background (`bg-slate-900/80`) for all components
