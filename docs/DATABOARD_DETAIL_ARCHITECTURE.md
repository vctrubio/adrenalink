# Databoard Detail Pages Architecture

## Overview

The databoard detail pages follow a consistent two-column layout pattern for all entities:

- **Left Column**: Entity editing interface (view/edit toggle with change detection)
- **Right Column**: Related entities and statistics with clickable navigation

This document explains the architecture, component structure, and implementation guidelines.

## Layout Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    [Entity Name]                             │
├────────────────────────┬────────────────────────────────────┤
│                        │                                     │
│   LEFT COLUMN          │      RIGHT COLUMN                  │
│   ───────────────      │      ─────────────                 │
│                        │                                     │
│  • Header/Icon         │   • Related Entity 1               │
│  • Edit/View Toggle    │   • Related Entity 2               │
│  • Form Fields         │   • Statistics Card                │
│  • Change Detection    │   • Financial Info                 │
│                        │   • Additional Cards               │
│                        │                                     │
└────────────────────────┴────────────────────────────────────┘
```

## Entity Relations Map

### Students
- **Left Column**: StudentLeftColumn (edit/view student details)
- **Right Column**:
  - Statistics Card (total events, duration, bookings)
  - Financial Card (income, expenses, net revenue)
  - StudentBookingStats (dropdown list of bookings with details)
  - Requested Packages (pending requests)
  - Schools (linked schools)
  - Packages (enrolled packages)

### Teachers
- **Left Column**: TeacherLeftColumn (edit/view teacher details)
- **Right Column**:
  - Bookings (through lessons - clickable)
  - Statistics (total events, duration, lessons)
  - Financial Info (revenue, commissions)
  - Commissions (commission settings)

### Equipment
- **Left Column**: EquipmentLeftColumn (edit/view equipment details)
- **Right Column**:
  - TeachersUsingEquipmentCard (teachers who use this equipment)
  - Events (clickable event list)
  - Repairs Card (repair history)
  - Statistics (usage count, duration, revenue)
  - Financial Info (revenue, repair costs)

### Packages (SchoolPackage)
- **Left Column**: PackageLeftColumn (edit/view package details)
- **Right Column**:
  - Student Packages (enrollments - clickable)
  - Bookings (linked bookings - clickable)
  - Statistics (usage, student count, revenue)
  - Financial Info (revenue, costs)

## File Structure

Each detail page follows this directory structure:

```
src/app/(admin)/(databoard)/[entity]/[id]/
├── page.tsx                           # Server component - data fetching & layout
└── [Entity]SpecialComponent.tsx        # Client component - complex feature (e.g., StudentBookingStats)
```

For students specifically:
```
src/app/(admin)/(databoard)/students/[id]/
├── page.tsx                           # Fetches student + calculates bookings/stats
├── StudentLeftColumn.tsx               # Edit/view form
└── StudentBookingStats.tsx             # Dropdown list of bookings
```

### File Naming Conventions

- **Page file**: `page.tsx` (server component, async)
- **LeftColumn component**: `{Entity}LeftColumn.tsx` (client component)
- **Card components**: `{RelatedEntity}Card.tsx` (client components)
- **Sub-components**: `{SpecificComponent}.tsx` (client components)

## Component Responsibilities

### Server Component (page.tsx)

**Only handles:**
- ✅ Data fetching via `getEntityId()`
- ✅ Error handling
- ✅ Passing complete serialized data to client components
- ✅ Layout structure with EntityDetailLayout

**Does NOT handle:**
- ❌ State management
- ❌ Business logic
- ❌ Rendering logic (delegates to sub-components)
- ❌ User interactions

**Pattern:**
```typescript
export default async function DetailPage({ params }) {
    const result = await getEntityId("entity", params.id);
    if (!result.success) return <ErrorMessage />;
    const entity = result.data;

    return (
        <EntityDetailLayout
            leftColumn={<EntityLeftColumn entity={entity} />}
            rightColumn={<>
                <RelatedEntityCard entity={entity} />
                <StatisticsCard entity={entity} />
            </>}
        />
    );
}
```

### LeftColumn Component

**Responsibilities:**
- ✅ Manage edit/view mode state
- ✅ Handle form changes and validation
- ✅ Display change detection (enable/disable save button)
- ✅ Call update server action
- ✅ Orchestrate view and edit mode sub-components

**Structure:**
```typescript
"use client";

export function EntityLeftColumn({ entity }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = async (formData) => {
        const result = await updateEntity(entity.id, formData);
        if (result.success) setIsEditing(false);
    };

    return (
        <div className="space-y-4">
            {isEditing ? (
                <EntityEditMode
                    entity={entity}
                    onCancel={() => setIsEditing(false)}
                    onSubmit={handleSubmit}
                />
            ) : (
                <EntityViewMode
                    entity={entity}
                    onEdit={() => setIsEditing(true)}
                />
            )}
        </div>
    );
}

function EntityViewMode({ entity, onEdit }) {
    // Display-only mode
}

function EntityEditMode({ entity, onCancel, onSubmit }) {
    // Edit mode with form
}
```

### Special Components (StudentBookingStats pattern)

For complex features like booking statistics, use a dedicated component that:
- ✅ Manages its own state (expanded/collapsed)
- ✅ Displays list/dropdown of related items
- ✅ Shows details inline when expanded
- ✅ Handles all presentation logic

**Structure:**
```typescript
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function StudentBookingStats({ bookings, globalStats }) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bookings</h2>
            {bookings.map((booking) => {
                const isExpanded = expandedId === booking.bookingId;
                return (
                    <div key={booking.bookingId} className="border border-border rounded-lg">
                        {/* Collapsed header - quick preview */}
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : booking.bookingId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30"
                        >
                            <div>
                                <p className="font-medium">{booking.dateStart} - {booking.dateEnd}</p>
                                <p className="text-xs text-muted-foreground">{booking.packageDescription}</p>
                            </div>
                            <ChevronDown style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                        </button>

                        {/* Expanded content - full details */}
                        {isExpanded && (
                            <div className="border-t border-border p-4 bg-muted/10 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-muted-foreground">Events</p><p className="font-medium">{booking.eventsCount}</p></div>
                                    <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{booking.durationHours}h</p></div>
                                </div>
                                {/* Payment details, receipt calculation, balance, etc. */}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
```

## Data Flow

```
Server (page.tsx)
    ↓
    getEntityId("entity", id)
    ↓
    Returns EntityModel with:
    ├── schema (entity fields)
    ├── stats (aggregated statistics)
    └── relations (related entities)
    ↓
Client Components
    ├── LeftColumn
    │   ├── ViewMode (displays schema)
    │   └── EditMode (edits schema)
    │
    └── Cards
        ├── Related Entities (clickable)
        └── Statistics (read-only)
```

## Design Principles

### 1. Simplicity First
- Keep components minimal and focused
- One component = one feature
- Avoid over-engineering with bars, charts, or separate cards
- Use dropdown/expand patterns for detail views

### 2. Data at Server Level
- Server component calculates all computed data (e.g., booking stats)
- Pass pre-computed data to client components
- Client components only manage UI state (expanded/collapsed)

### 3. Clean Styling
- Use semantic color tokens: `bg-card`, `border-border`, `text-foreground`
- Consistent spacing with `space-y-*` utilities
- Hover states on clickable elements
- Dark mode support built-in

### 4. Type Safety
- Use entity-specific types from `@/backend/models` and getters
- Pass complete model objects, not partial data
- Leverage TypeScript for compile-time validation

### 5. Focused Components
- Each component has a single responsibility
- No nested sub-components unless necessary
- All logic within one file per feature

## Styling Guidelines

### Card Layout
```typescript
<div className="bg-card border border-border rounded-lg p-6 space-y-4">
    <h2 className="text-lg font-semibold text-foreground">Title</h2>
    {/* Content */}
</div>
```

### Interactive Elements
```typescript
<div
    className="p-3 rounded-lg cursor-pointer transition-colors"
    style={{
        backgroundColor: isSelected ? `${color}30` : "transparent"
    }}
    onClick={() => handleSelect()}
    onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = `${color}15`;
    }}
    onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
    }}
>
    {/* Content */}
</div>
```

### Semantic Colors
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Backgrounds: `bg-card`, `bg-muted/30`
- Borders: `border-border`, `border-muted/30`
- Selected: `${color}30` (30% opacity)
- Hover: `${color}15` (15% opacity)

## TODO: Dropdown Lists for All Entities

Implement dropdown list components for each entity in `src/app/(admin)/(databoard)/`:

- [x] **Students** → `StudentBookingStats.tsx` (dropdown list of bookings)
- [ ] **Teachers** → `TeacherBookingStats.tsx` (dropdown list of bookings through lessons) **[START HERE]**
- [ ] **Equipment** → `EquipmentEventsList.tsx` (dropdown list of events)
- [ ] **Packages** → `PackageBookingsList.tsx` (dropdown list of bookings)

Each dropdown component should:
- Show collapsed header with date range, type, count, and duration
- Expand to show stats grid, payment receipt, and balance
- Use `prettyDateSpan()` for date formatting
- Use `getPrettyDuration()` for duration formatting
- Follow the StudentBookingStats pattern

## Implementation Checklist

When adding a new entity detail page:

- [ ] Create `page.tsx` server component with data fetching
- [ ] Call `getEntityId()` and calculate computed data (e.g., booking stats)
- [ ] Add layout structure with left/right columns
- [ ] Create `{Entity}LeftColumn.tsx` for edit/view form
- [ ] Create special components for complex features (e.g., `StudentBookingStats.tsx`)
- [ ] Use dropdown/expand pattern for lists with details
- [ ] Add school context filtering in id-actions.ts (if multi-tenant)
- [ ] Update model types to include relations
- [ ] Create/update server actions for updates
- [ ] Keep components simple - one file per feature
- [ ] Use existing getter functions for data transformation

## Example: StudentBookingStats Dropdown List

```typescript
// src/app/(admin)/(databoard)/students/[id]/StudentBookingStats.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { getPrettyDuration } from "@/getters/duration-getter";
import { prettyDateSpan } from "@/getters/date-getter";
import type { BookingStatsData, GlobalStatsType } from "@/getters/student-booking-stats-getter";

interface StudentBookingStatsProps {
    bookings: BookingStatsData[];
    globalStats: GlobalStatsType;
}

export function StudentBookingStats({ bookings, globalStats }: StudentBookingStatsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Bookings</h2>
            {bookings.map((booking) => {
                const isExpanded = expandedId === booking.bookingId;
                const dateRange = prettyDateSpan(booking.dateStart, booking.dateEnd);

                return (
                    <div key={booking.bookingId} className="border border-border rounded-lg overflow-hidden">
                        {/* Collapsed Header */}
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : booking.bookingId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{dateRange}</p>
                                <p className="text-xs text-muted-foreground mt-1">{booking.packageDescription}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{booking.eventsCount} events</p>
                                    <p className="text-xs text-muted-foreground">{booking.durationHours.toFixed(1)}h</p>
                                </div>
                                <ChevronDown size={20} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                            </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="border-t border-border p-4 bg-muted/10 space-y-3 text-sm">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground">Status</p>
                                        <p className="font-medium text-foreground capitalize">{booking.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Events</p>
                                        <p className="font-medium text-foreground">{booking.eventsCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Duration</p>
                                        <p className="font-medium text-foreground">{getPrettyDuration(Math.round(booking.durationHours * 60))}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Payments</p>
                                        <p className="font-medium text-foreground">{booking.paymentsCount}</p>
                                    </div>
                                </div>

                                {/* Payment Receipt */}
                                <div className="border-t border-border pt-3 font-mono">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">{booking.durationHours.toFixed(1)}h × ${booking.packagePricePerHour.toFixed(2)}/hr</span>
                                        <span className="text-foreground">${booking.moneyToPay.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">Money Paid:</span>
                                        <span className="text-foreground">${booking.moneyPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-semibold text-foreground">Balance:</span>
                                        <span
                                            className="font-bold"
                                            style={{
                                                color:
                                                    booking.balance < 0
                                                        ? "#10b981"
                                                        : booking.balance > 0
                                                          ? "#ef4444"
                                                          : "#78716c",
                                            }}
                                        >
                                            ${Math.abs(booking.balance).toFixed(2)} {booking.balance < 0 ? "Credit" : booking.balance > 0 ? "Owed" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
```

**Key Details:**
- **Date formatting**: Uses `prettyDateSpan()` from `date-getter.ts` to show "Nov 14 +3" format
- **Duration formatting**: Uses `getPrettyDuration()` from `duration-getter.ts` for "6:00 hrs" format
- **Collapsed view**: Shows date range, package name, events count, and duration at a glance
- **Expanded view**: 2×2 grid showing Status, Events, Duration, Payments
- **Payment receipt**: Calculation (hours × rate = amount), money paid, and balance with color coding (green for credit, red for owed)

## Common Patterns

### Toggle Between View and Edit
```typescript
const [isEditing, setIsEditing] = useState(false);

return isEditing ? <EditMode onCancel={() => setIsEditing(false)} /> : <ViewMode onEdit={() => setIsEditing(true)} />;
```

### Change Detection
```typescript
const [formData, setFormData] = useState(initialData);
const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

<button disabled={!hasChanges}>Save Changes</button>
```

### School Context Filtering
```typescript
// In id-actions.ts
const filteredRelations = relations.filter(
    r => r.schoolId === schoolId
);
```

### Clickable Entity Navigation
```typescript
<Link href={`/bookings/${booking.id}`}>
    <div className="cursor-pointer hover:bg-accent/30 transition-colors">
        {/* Entity summary */}
    </div>
</Link>
```

## Maintenance & Evolution

### Adding a New Relation
1. Update entity model type to include new relation
2. Update `id-actions.ts` entityRelations config
3. Create new `{RelatedEntity}Card.tsx` component
4. Add card to page.tsx rightColumn
5. Implement sub-components as needed

### Modifying Edit Form
1. Update `{Entity}LeftColumn.tsx` EditMode
2. Update server action validation
3. Test change detection
4. Verify form validation

### Adding New Entity Type
1. Follow the same structure as existing entities
2. Reference this document as the architecture guide
3. Ensure all relations map to clickable cards
4. Implement school context filtering
5. Add comprehensive error handling

## Related Documentation

- Entity Configuration: `docs/ENTITY_CONFIG.md`
- Server Actions: `docs/SERVER_ACTIONS.md`
- Model Architecture: `docs/MODEL_ARCHITECTURE.md`
- Type System: `docs/TYPE_SYSTEM.md`
