# Stats System Documentation

## Overview

The stats system provides a centralized, DRY architecture for calculating and displaying statistics across the application. It consists of three main layers:

1. **Calculation Layer** (`/getters/databoard-getter.ts`) - Business logic for computing stats
2. **Presentation Layer** (`/src/components/databoard/stats/stat-factory.tsx`) - Icons, colors, formatting
3. **Aggregation Layer** (`/src/components/databoard/stats/*RowStats.tsx`) - Combining stats for rows/lists

## Architecture

### Single Source of Truth Pattern

```typescript
// ✅ CORRECT - Use databoard-getter + stat-factory
import { StudentDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";

const stats = [
  createStat("bookings", StudentDataboard.getBookingCount(student), "Bookings"),
  createStat("events", StudentDataboard.getEventCount(student), "Events"),
  createStat("schoolNet", StudentDataboard.getSchoolNet(student), "Net"),
];

// ❌ WRONG - Don't calculate stats inline
const bookingCount = student.relations?.bookingStudents?.length || 0;
stats.push({ icon: <BookingIcon />, value: bookingCount, label: "Bookings" });
```

## Calculation Layer: databoard-getter.ts

Contains pure calculation functions for each entity type.

### StudentDataboard Methods

```typescript
StudentDataboard.getBookingCount(student: StudentModel): number
  // Returns total number of bookings for a student

StudentDataboard.getEventCount(student: StudentModel): number
  // Returns total number of events across all bookings

StudentDataboard.getDurationMinutes(student: StudentModel): number
  // Returns total duration of all events in minutes

StudentDataboard.getSchoolNet(student: StudentModel): number
  // Returns school NET REVENUE from student bookings
  // Formula: (pricePerStudent / packageDuration) × eventDuration × studentCount
  // NOTE: This is REVENUE, not profit. Teacher commissions are NOT subtracted.

StudentDataboard.getMoneyToPay(student: StudentModel): number
  // Returns total amount student needs to pay (sum of package prices)

StudentDataboard.getMoneyPaid(student: StudentModel): number
  // Returns total amount student has paid (sum of payment records)
```

### TeacherDataboard Methods

```typescript
TeacherDataboard.getLessonCount(teacher: TeacherModel): number
  // Returns total number of lessons

TeacherDataboard.getEventCount(teacher: TeacherModel): number
  // Returns total number of events across all lessons

TeacherDataboard.getDurationMinutes(teacher: TeacherModel): number
  // Returns total duration of all events in minutes

TeacherDataboard.getCommission(teacher: TeacherModel): number
  // Returns total teacher earnings from commissions
  // Uses commission-calculator.ts for accurate fixed/percentage calculations

TeacherDataboard.getSchoolRevenue(teacher: TeacherModel): number
  // Returns school PROFIT (revenue - teacher commission)
  // This is different from Student Net (which doesn't subtract commission)
```

## Presentation Layer: stat-factory.tsx

Centralizes all visual presentation logic (icons, colors, formatting).

### Stat Types

| Type | Icon | Color | Formatter | Use Case |
|------|------|-------|-----------|----------|
| `student` | HelmetIcon | Student entity color | Pass-through | Student count |
| `teacher` | HeadsetIcon | Teacher entity color | Pass-through | Teacher count |
| `lessons` | LessonIcon | Lesson entity color | Number | Lesson count |
| `events` | FlagIcon | Event entity color | Number | Event count |
| `duration` | DurationIcon | Gray (#4b5563) | getFullDuration() | Time duration |
| `bookings` | BookingIcon | Booking entity color | Number | Booking count |
| `commission` | HandshakeIcon | Commission color | getCompactNumber() | Teacher earnings |
| `revenue` | TrendingUp | Orange | getCompactNumber() | School profit |
| **`schoolNet`** | **TrendingUpDown** | **Orange** | **getCompactNumber()** | **School revenue** |
| `moneyToPay` | TrendingUp | Orange | getCompactNumber() | Student owes |
| `moneyPaid` | TrendingUp | Orange | getCompactNumber() | Student paid |

### Understanding "Net" vs "Revenue"

**CRITICAL CONCEPT:**

- **`schoolNet`** (Student context) = Revenue from student bookings
  - Icon: **TrendingUpDown** (↕)
  - Represents money coming in from students
  - Teacher commissions are NOT subtracted
  - Always positive (money flowing in)
  - Called "Net" because it's net of package calculations, not net profit

- **`revenue`** (Teacher context) = School profit after teacher commission
  - Icon: **TrendingUp** (↗)
  - Represents school's actual profit
  - Teacher commissions ARE subtracted
  - Can be positive or negative

### createStat() Function

```typescript
function createStat(
  type: StatType,
  value: number | string,
  label?: string
): StatItem | null

// Returns null for zero values (auto-filters)
// Returns StatItem with icon, value, label, color
```

**Auto-filtering:**
- Returns `null` for zero values
- Filters are handled by caller: `.filter(Boolean)`

## Aggregation Layer: RowStats

Used for displaying stats in table rows and entity detail pages.

### StudentRowStats

```typescript
import { StudentRowStats } from "@/src/components/databoard/stats/StudentRowStats";

// Single student (detail page)
const stats = StudentRowStats.getStats(student, false);
// includeCount=false means don't show "Students: 1"

// Multiple students (table row)
const stats = StudentRowStats.getStats([student1, student2], true);
// includeCount=true shows "Students: 2"
```

**Implementation Pattern:**
```typescript
export const StudentRowStats = {
  getStats: (items: StudentModel | StudentModel[], includeCount = true): StatItem[] => {
    const students = Array.isArray(items) ? items : [items];

    // Aggregate using databoard-getter methods
    const totalBookings = students.reduce(
      (sum, student) => sum + StudentDataboard.getBookingCount(student),
      0
    );

    // Build stats using stat-factory
    const stats: StatItem[] = [];
    const bookingsStat = createStat("bookings", totalBookings, "Bookings");
    if (bookingsStat) stats.push(bookingsStat);

    return stats;
  },
};
```

## Usage Examples

### Entity Detail Page

```typescript
// src/app/(admin)/(databoard)/students/[id]/page.tsx
import { StudentDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";

const stats = [
  createStat("student", `${student.schema.firstName} ${student.schema.lastName}`, student.schema.firstName),
  createStat("bookings", StudentDataboard.getBookingCount(student), "Bookings"),
  createStat("events", StudentDataboard.getEventCount(student), "Events"),
  createStat("duration", StudentDataboard.getDurationMinutes(student), "Duration"),
  createStat("schoolNet", StudentDataboard.getSchoolNet(student), "Net"),
].filter(Boolean) as any[];

return (
  <EntityStatsWrapper stats={stats}>
    {/* Page content */}
  </EntityStatsWrapper>
);
```

### Databoard Table Row

```typescript
// src/components/databoard/DataboardTableSection.tsx
import { StudentRowStats } from "@/src/components/databoard/stats/StudentRowStats";

const renderers = {
  renderStats: (student: StudentModel) => {
    return StudentRowStats.getStats(student, false);
  },
};
```

### Custom Stat Calculation

```typescript
// If you need a one-off stat not in StudentDataboard
import { createStat } from "@/src/components/databoard/stats/stat-factory";

const customValue = /* your calculation */;
const customStat = createStat("events", customValue, "Custom Label");
```

## Adding New Stat Types

1. **Add to StatType union** in `stat-factory.tsx`:
```typescript
type StatType =
  | "student"
  | "newStatType"; // Add here
```

2. **Add to STAT_CONFIGS**:
```typescript
const STAT_CONFIGS: Record<StatType, StatConfig> = {
  newStatType: {
    icon: <YourIcon />,
    color: "#hexcolor",
    formatter: (value) => value.toFixed(2),
  },
};
```

3. **Add calculation method** to databoard-getter.ts:
```typescript
export const StudentDataboard = {
  getNewStat: (student: StudentModel): number => {
    // Your calculation logic
    return result;
  },
};
```

4. **Use it**:
```typescript
createStat("newStatType", StudentDataboard.getNewStat(student), "My Stat");
```

## Icon Reference

All stat icons use size 20 for consistency:
- `<TrendingUp size={20} />` - Growth, positive metrics
- `<TrendingDown size={20} />` - Decline, negative metrics
- `<TrendingUpDown size={20} />` - Revenue/bidirectional flow (Net)
- Entity icons use their configured colors from `/config/entities.ts`

## Best Practices

1. ✅ **Always use stat-factory** for consistent presentation
2. ✅ **Always use databoard-getter** for calculations
3. ✅ **Use RowStats for aggregation** (multiple items)
4. ✅ **Filter with `.filter(Boolean)`** to remove null stats
5. ❌ **Never calculate inline** - keep business logic in getters
6. ❌ **Never hardcode icons/colors** - use stat-factory
7. ❌ **Never duplicate calculations** - DRY principle

## File Structure

```
/getters/
  databoard-getter.ts         # Calculation logic

/src/components/databoard/stats/
  stat-factory.tsx            # Presentation logic (icons, colors, formatting)
  StudentRowStats.tsx         # Student aggregation
  TeacherStats.tsx            # Teacher aggregation
  index.ts                    # Exports

/src/app/(admin)/(databoard)/
  students/[id]/page.tsx      # Uses StudentDataboard + createStat
  teachers/[id]/page.tsx      # Uses TeacherDataboard + createStat
```

## Migration Guide

If you have old stat code:

```typescript
// OLD ❌
const stats = StudentIdStats.getStats(student);
const commissionsStats = stats.find((stat) => stat.label === "Commissions");

// NEW ✅
const commissionsStats = createStat(
  "commission",
  TeacherDataboard.getCommission(teacher),
  "Commission"
);
```

## Common Pitfalls

### ❌ Confusing Net with Profit
```typescript
// WRONG - This is revenue, not profit
createStat("schoolNet", revenue - commission, "Net");

// RIGHT - Net is gross revenue from students
createStat("schoolNet", StudentDataboard.getSchoolNet(student), "Net");
```

### ❌ Calculating in Component
```typescript
// WRONG - Logic in component
const eventCount = student.relations?.bookingStudents?.reduce(...)

// RIGHT - Logic in getter
const eventCount = StudentDataboard.getEventCount(student);
```

### ❌ Hardcoding Icons
```typescript
// WRONG - Hardcoded icon
stats.push({ icon: <TrendingUp />, value: net });

// RIGHT - Use stat-factory
stats.push(createStat("schoolNet", net, "Net"));
```

## Related Documentation

- `/getters/commission-calculator.ts` - Commission calculation formulas
- `/config/entities.ts` - Entity colors and icons
- `/docs/structure.md` - Overall project structure
