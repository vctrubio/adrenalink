# Clean Code Thesis

## Philosophy

We believe in writing **DRY, reusable, and human-friendly code** that tells a story without excessive comments. Code should be self-documenting through clear structure, meaningful variable names, and logical flow.

## Core Principles

### 1. DRY (Don't Repeat Yourself)

- **Shared Relations**: Use the same `with` clauses across conditional queries
- **Single Processing**: One mapping/transformation block instead of duplication
- **Reusable Constants**: Extract shared query patterns and configurations

### 2. Human-Friendly Structure

- **Top-to-Bottom Flow**: Code should read like a story from declaration to processing
- **Clear Variable Names**: `const header = headers().get('x-school-username')` not `const h = getH()`
- **Logical Separation**: Query logic separate from processing logic

### 3. Minimal Comments

- **Self-Documenting Code**: Structure and naming should explain the intent
- **Comments Only When Necessary**: Business logic explanations, not obvious code descriptions
- **Function Names Tell Stories**: `getAllStudents()`, `createStudentModel()`, `getSchoolStudentCount()`

### 4. Avoid Trivial One-Line Returns

- **Don't extract code that's only called once**: Inline one-line utilities that don't reduce cognitive load
- **Return directly, don't wrap unnecessarily**: Simple returns don't need an extra wrapper function
- **Rule of thumb**: If a function's return statement adds more complexity than clarity, keep it inline
- **Real cost**: Trivial abstractions scatter logic across files and require developers to jump between function definitions

### 5. Centralize Configuration Objects

- **Single Source of Truth**: Define config objects once, access directly everywhere
- **No intermediate wrappers**: Don't create redundant exports that duplicate the config
- **Direct access from config**: Import the main config object, not extracted pieces
- **Benefit**: When refactoring, you only change one place; no orphaned imports across the codebase
- **Real cost**: Intermediate constants like `STATUS_COLORS` encourage scattered imports; when one file changes the config structure, others still try importing removed constants

## Preferred Code Pattern

### ✅ GOOD: Clean Structure with Result Pattern

```typescript
export async function getStudents(): Promise<
  ApiActionResponseModel<StudentType[]>
> {
  try {
    const header = headers().get("x-school-username");

    let result;
    if (header) {
      result = await db.query.schoolStudents.findMany({
        where: eq(school.username, header),
        with: studentWithRelations,
      });
    } else {
      result = await db.query.student.findMany({
        with: studentWithRelations,
      });
    }

    const students = header
      ? result.map((schoolStudent) => schoolStudent.student)
      : result;

    return { success: true, data: students };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students" };
  }
}
```

### ❌ BAD: Duplicated Logic

```typescript
export async function getStudents(): Promise<StudentModel[]> {
  const schoolUsername = headers().get("x-school-username");

  if (schoolUsername) {
    const result = await db.query.schoolStudents.findMany({
      where: eq(school.username, schoolUsername),
      with: studentWithRelations,
    });
    const students = result.map((schoolStudent) =>
      createStudentModel(schoolStudent.student),
    );
    return students;
  } else {
    const result = await db.query.student.findMany({
      with: studentWithRelations,
    });
    const students = result.map((studentData) =>
      createStudentModel(studentData),
    );
    return students;
  }
}
```

### ❌ BAD: Trivial One-Line Wrapper Functions

```typescript
// Example 1: Unnecessary wrappers that just access object properties
export function getEventStatusColor(status: EventStatus): string {
    return getEventStatusConfig(status).color;
}

export function getEventStatusLabel(status: EventStatus): string {
    return getEventStatusConfig(status).label;
}

// Usage requires understanding multiple function definitions
const color = getEventStatusColor(status);

// Example 2: Trivial function extraction
const getBaseColor = (shade: RainbowShade) => shade.split("-")[0];

const ColorLabel = ({ shade }: { shade: RainbowShade }) => {
  return colorLabels[getBaseColor(shade) as ColorType];
};

// Developer now has to jump to getBaseColor definition to understand what it does
```

### ✅ GOOD: Direct Access and Inline When It Adds Clarity

```typescript
// Example 1: Direct config access - no wrapper needed
const color = EVENT_STATUS_CONFIG[status].color;
const label = EVENT_STATUS_CONFIG[status].label;

// Clear, direct, no function jumping required

// Example 2: Inline simple operations
const ColorLabel = ({ shade }: { shade: RainbowShade }) => {
  const baseColor = shade.split("-")[0];
  return colorLabels[baseColor as ColorType];
};
```

### ❌ BAD: Intermediate Configuration Exports

```typescript
// types/status.ts - Creates intermediate wrapper
export const STATUS_COLORS = {
  eventPlanned: "#9ca3af",
  eventCompleted: "#86efac",
};

export const EVENT_STATUS_CONFIG = {
  planned: { color: STATUS_COLORS.eventPlanned, label: "Planned" },
  completed: { color: STATUS_COLORS.eventCompleted, label: "Completed" },
};

// Later: getters/booking-progress-getter.ts imports STATUS_COLORS directly
import { STATUS_COLORS } from "@/types/status";

// Problem: When refactoring to use EVENT_STATUS_CONFIG directly,
// STATUS_COLORS gets removed but booking-progress-getter still tries to import it
```

### ✅ GOOD: Direct Config Access, Single Source

```typescript
// types/status.ts - Single source of truth
export const EVENT_STATUS_CONFIG = {
  planned: { color: "#9ca3af", label: "Planned" },
  completed: { color: "#86efac", label: "Completed" },
};

// getters/booking-progress-getter.ts
import { EVENT_STATUS_CONFIG } from "@/types/status";

// Direct access - always works after refactoring
const gradient = `${EVENT_STATUS_CONFIG.completed.color} 50%`;

// If structure changes, only EVENT_STATUS_CONFIG is updated
// All imports continue to work because they reference the same object
```

## Why This Matters

### Benefits of Clean Structure:

1. **Easier Debugging**: Single place to add console.logs or breakpoints
2. **Simpler Testing**: One flow to test instead of multiple paths
3. **Better Maintenance**: Changes to mapping logic happen in one place
4. **Reduced Bugs**: Less duplication means fewer places for inconsistencies
5. **Faster Development**: Pattern recognition speeds up coding

### Real-World Impact:

- **Code Reviews**: Easier to spot issues and improvements
- **Onboarding**: New developers understand the pattern quickly
- **Scaling**: Consistent patterns across the entire codebase
- **Refactoring**: Changes propagate cleanly through single sources of truth
- **Configuration Refactoring**: Direct config access prevents orphaned imports when restructuring config objects (e.g., removing `STATUS_COLORS` while files still try to import it)

## Implementation Guidelines

### Function Structure

1. **Declare conditions first**: `const header = headers().get('x-school-username')`
2. **Handle data fetching**: Conditional queries with shared relations
3. **Process results**: Single mapping/transformation block
4. **Return consistently**: Same return type and error handling

### Error Handling

- **Result Pattern**: Use `{ success: true, data: T }` or `{ success: false, error: string }`
- **Consistent API**: All actions return the same result structure
- **Type Safety**: `result.success` check provides proper type narrowing
- **Clean Usage**: `if (result.success) { result.data }` is readable and safe

## Enforcement

This is not just a suggestion - it's our **standard**. All new code should follow these patterns, and existing code should be refactored to match when touched.

**Remember**: Code is read far more often than it's written. Optimize for the human reading it next.
