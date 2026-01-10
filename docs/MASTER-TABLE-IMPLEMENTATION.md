# Master Table Implementation Guide

## Overview

The `MasterTable` component is a **generic, reusable table infrastructure** designed to handle data rendering, grouping, and mobile/desktop responsive layouts. It powers data-driven tables like `TransactionEventsTable`, `StudentsTable`, `TeachersTable`, etc.

## Architecture Pattern

### Data Flow

```
supabase/server/entity.ts (Server Actions)
    ↓
    Fetch: students, packages, teachers, equipment, bookings, etc.
    ↓
src/app/(admin)/(tables)/[entity]/page.tsx (Client Component)
    ↓
    Transform data → TypeScript types (e.g., StudentData[], EquipmentData[])
    ↓
StudentsTable | TeachersTable | EquipmentTable (Concrete Table Implementations)
    ↓
MasterTable<T> (Generic Infrastructure)
    ↓
Render: DesktopTable | MobileTable (Internal Sub-components)
```

### Component Hierarchy

```
MasterTable<T extends Record<string, any>>
├── State Management
│   └── [groupBy, setGroupBy] → "all" | "date" | "week"
├── Data Processing
│   └── useMemo → groupedData, sortedGroupEntries
├── UI Controls
│   └── Group toggle buttons (All/Date/Week)
└── Renderers
    ├── DesktopTable<T>
    │   ├── headers with ColumnDef<T>
    │   ├── group headers (if groupBy !== "all")
    │   └── rows
    └── MobileTable<T>
        ├── headers with MobileColumnDef<T>
        ├── mobile group headers (if groupBy !== "all")
        └── rows
```

## Implementation Details

### Key Types

```typescript
export type GroupingType = "all" | "date" | "week";

export interface ColumnDef<T> {
    header: string;
    headerClassName?: string;
    render: (row: T) => ReactNode;
}

export interface MobileColumnDef<T> {
    label: string;
    render: (row: T) => ReactNode;
}

export type GroupStats = Record<string, any>;
```

### MasterTable Props

```typescript
interface MasterTableProps<T> {
    rows: T[]; // Data array
    columns: ColumnDef<T>[]; // Desktop columns
    mobileColumns: MobileColumnDef<T>[]; // Mobile columns
    groupBy?: GroupingType; // Initial grouping (default: "all")
    getGroupKey?: (row: T, groupBy: GroupingType) => string; // Key function for grouping
    calculateStats?: (rows: T[]) => GroupStats; // Stats aggregation
    renderGroupHeader?: (title: string, stats: GroupStats, groupBy: GroupingType) => ReactNode;
    renderMobileGroupHeader?: (title: string, stats: GroupStats, groupBy: GroupingType) => ReactNode;
    showGroupToggle?: boolean; // Show All/Date/Week buttons
}
```

### State Management

**groupBy State Managed Internally:**

- Default: `"all"` (no grouping)
- Toggle buttons positioned: `ml-auto` (top right)
- Affects:
    - `getGroupKey()` function receives current `groupBy`
    - `renderGroupHeader()` function receives current `groupBy`
    - `renderMobileGroupHeader()` function receives current `groupBy`
    - Group headers only render when `groupBy !== "all"`

### Grouping Logic

```typescript
// In MasterTable
const groupedData = useMemo(() => {
    if (groupBy === "all") return { All: rows }; // No grouping

    // Group by custom key function
    const groups: Record<string, T[]> = {};
    rows.forEach((row) => {
        const key = getGroupKey?.(row, groupBy) || "";
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
    });
    return groups;
}, [rows, groupBy, getGroupKey]);
```

## Creating a New Table Implementation

### Step 1: Define Data Type

```typescript
// types/student-table.ts
export interface StudentTableData {
    id: string;
    name: string;
    email: string;
    enrollmentDate: Date;
    packagesCount: number;
    totalHours: number;
    // ... other fields
}
```

### Step 2: Create Page Component

```typescript
// src/app/(admin)/(tables)/students/page.tsx
import { getStudents } from "@/supabase/server/students";
import { StudentsTable } from "./StudentsTable";

export default async function StudentsPage() {
    const students = await getStudents();  // From supabase/server/students.ts
    return <StudentsTable students={students} />;
}
```

### Step 3: Create Table Component

```typescript
// src/app/(admin)/(tables)/students/StudentsTable.tsx
"use client";

import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupingType } from "../MasterTable";
import type { StudentTableData } from "@/types/student-table";

export function StudentsTable({ students }: { students: StudentTableData[] }) {
    const desktopColumns: ColumnDef<StudentTableData>[] = [
        {
            header: "Name",
            headerClassName: "px-4 py-3 font-medium",
            render: (data) => <span>{data.name}</span>,
        },
        // ... more columns
    ];

    const mobileColumns: MobileColumnDef<StudentTableData>[] = [
        {
            label: "Student",
            render: (data) => <span className="font-bold">{data.name}</span>,
        },
        // ... more columns
    ];

    const getGroupKey = (row: StudentTableData, groupBy: GroupingType) => {
        if (groupBy === "date") {
            return row.enrollmentDate.toISOString().split("T")[0];
        } else if (groupBy === "week") {
            // Week grouping logic
            const date = new Date(row.enrollmentDate);
            const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), 0, 1).getDay()) / 7);
            return `${date.getFullYear()}-W${weekNum}`;
        }
        return "";
    };

    const calculateStats = (groupRows: StudentTableData[]) => {
        return {
            count: groupRows.length,
            totalHours: groupRows.reduce((sum, r) => sum + r.totalHours, 0),
            avgHours: groupRows.reduce((sum, r) => sum + r.totalHours, 0) / groupRows.length,
        };
    };

    const renderGroupHeader = (title: string, stats: any, groupBy: GroupingType) => {
        return (
            <tr className="bg-primary/5">
                <td colSpan={4} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">{title}</span>
                        <div className="flex gap-4">
                            <span>Count: {stats.count}</span>
                            <span>Avg Hours: {stats.avgHours.toFixed(1)}</span>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    const renderMobileGroupHeader = (title: string, stats: any, groupBy: GroupingType) => {
        return (
            <tr className="bg-primary/5">
                <td colSpan={2} className="px-3 py-2.5">
                    <div className="flex justify-between text-xs">
                        <span>{title}</span>
                        <span>{stats.count} students</span>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <MasterTable
            rows={students}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            showGroupToggle={true}
        />
    );
}
```

### Step 4: Add Supabase Server Action

```typescript
// supabase/server/students.ts
import { createServerClient } from "@/supabase/server";
import type { StudentTableData } from "@/types/student-table";

export async function getStudents(): Promise<StudentTableData[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from("students")
        .select(
            `
            id,
            name,
            email,
            created_at,
            student_packages(count),
            lessons(
                duration
            )
        `,
        )
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch students: ${error.message}`);

    return data.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        enrollmentDate: new Date(student.created_at),
        packagesCount: student.student_packages?.[0]?.count || 0,
        totalHours: student.lessons?.reduce((sum: number, lesson: any) => sum + lesson.duration, 0) || 0,
    }));
}
```

## Best Practices

### 1. **Type Safety**

- Always define explicit types for your data (StudentTableData, TeacherTableData, etc.)
- Use `ColumnDef<T>` and `MobileColumnDef<T>` with proper typing
- Avoid `any` types in column definitions

### 2. **Data Transformation**

- Transform supabase responses in server actions before sending to client
- Keep page components async (server components)
- Pass only necessary data to table components

### 3. **Grouping Implementation**

- `getGroupKey` must handle all `GroupingType` values
- Return consistent key format (ISO dates, week format)
- Handle edge cases (null dates, missing data)

### 4. **Stats Calculation**

- Use `reduce()` for aggregation
- Include unit/currency info when needed
- Keep stats object flat and simple

### 5. **Header Rendering**

- Always accept `groupBy` parameter (even if not used initially)
- Use consistent styling with other tables
- Mobile headers should be more compact

### 6. **Performance**

- MasterTable uses `useMemo` for grouping - no unnecessary recalculations
- Desktop/Mobile tables are internal sub-components - no prop drilling
- Column definitions are static, define outside component if possible

## Schema Notes

### Database Migration (Supabase over Drizzle)

**Reason for Switch:**

- Supabase PostgREST API provides direct database access
- Better for server-side data fetching
- Cleaner relationship handling with `select()` nesting
- No ORM overhead for read-heavy operations

**Key Points:**

- Use Supabase client in server actions (`supabase/server.ts`)
- Leverage PostgREST's count, filter, order capabilities
- Relationships are queried directly in select statement
- No Drizzle migrations for data fetching (still use for schema definition if needed)

**Example Pattern:**

```typescript
// Old Drizzle approach (not used for fetching)
// const students = db.select().from(studentsTable).all();

// New Supabase approach (preferred)
const { data } = await supabase
    .from("students")
    .select("*, student_packages(*), lessons(*)")
    .order("created_at", { ascending: false });
```

## Future AI Continuation Guide

### To Add a New Table Type:

1. **Identify Data Source**
    - Check `supabase/server/` for existing server actions
    - Create new server action if needed (fetch from Supabase)

2. **Define Types**
    - Create `types/[entity]-table.ts` with all display fields

3. **Create Table Component**
    - Implement `ColumnDef<T>[]` for desktop columns
    - Implement `MobileColumnDef<T>[]` for mobile columns
    - Implement `getGroupKey()` function
    - Implement `calculateStats()` function
    - Implement `renderGroupHeader()` and `renderMobileGroupHeader()`

4. **Wire Up Page**
    - Create `/app/(admin)/(tables)/[entity]/page.tsx`
    - Call server action, pass data to table component

5. **Testing**
    - Test grouping toggle (All/Date/Week)
    - Test desktop and mobile responsive views
    - Verify stat calculations

### Common Patterns to Reuse

```typescript
// Date grouping
if (groupBy === "date") return new Date(row.date).toISOString().split("T")[0];

// Week grouping
const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), 0, 1).getDay()) / 7);
return `${date.getFullYear()}-W${weekNum}`;

// Format date header
groupBy === "date"
    ? new Date(title).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })
    : `Week ${title.split("-W")[1]}`;
```

### Debugging Tips

- Check groupBy state: Add console.log in getGroupKey
- Verify stats: Console.log in calculateStats
- Mobile responsiveness: Use browser DevTools responsive mode
- Type errors: Check ColumnDef<T> matches your data type

## Files Modified

- `/src/app/(admin)/(tables)/MasterTable.tsx` - Generic table infrastructure
- `/src/components/school/TransactionEventsTable.tsx` - Example implementation
- `/src/app/(admin)/home/HomeTable.tsx` - Uses MasterTable pattern

## Related Documentation

- [RenderStats Implementation](./RENDER-STATS-IMPLEMENTATION.md) - Centralized stat configuration
- [Clean Code Thesis](./clean-code-thesis.md) - Architecture principles
- Production deployment notes in [production.md](./production.md)
