# Claude Development Guidelines

## Core Principles

- **Don't run, follow instructions** - Execute exactly what is requested, nothing more
- **Use inline props** - Pass props directly inline rather than extracting to variables
- **Don't overcomplicate** - Keep solutions simple and straightforward
- **Render only in parent** - Parent components handle rendering, child components handle logic
- **Logic in sub-components** - Business logic belongs in child components, not parents

## Import Guidelines

- **Import React types explicitly** - Import ReactNode from React instead of using React.ReactNode
- **Explicit imports** - Import what you need rather than using namespace imports

## Code Quality Guidelines

- **No trailing spaces** - Always remove trailing whitespace from lines to avoid ESLint errors
- **Clean formatting** - Ensure proper indentation and spacing without extra whitespace
- **Consistent line endings** - Use consistent line endings throughout files
- **DRY principle** - Export shared functions and import them to avoid code duplication
- **Constants at top** - Declare all configuration constants at the top of files
- **Single source of truth** - Define arrays and configurations once, import everywhere
- **Graceful error handling** - Use try/catch with descriptive "No X found, skipping..." messages
- **Shared utilities** - Export reusable functions and import them across modules
- **No emojis in code** - Never use emojis in user-facing text, labels, or any code components
- **Simple, clean labels** - Use clear, professional text without decorative elements
- **Dropdown indicators** - For custom dropdown styling, use the DropdownBullsIcon.svg from `/public/appSvgs/` with appropriate CSS filters for semantic color matching

## Component Architecture

- Parent components are for layout and rendering
- Child components contain all business logic and state management
- Props should be passed inline for clarity
- Avoid unnecessary abstractions or complex patterns
- **Component grouping with index exports** - When creating multiple related components, group them in a subdirectory with an index.ts file for clean imports:
  ```
  src/components/ui/form/
  ├── form.tsx
  ├── form-field.tsx
  ├── form-input.tsx
  └── index.ts
  ```
  ```typescript
  // index.ts
  export { default as Form } from "./form";
  export { default as FormField } from "./form-field";
  ```
  ```typescript
  // Usage
  import { Form, FormField } from "../../components/ui/form";
  ```

## Layout Guidelines

- **Background and colors handled in layout** - Never add `bg-white dark:bg-black` or similar background/text colors in individual pages
- **Layout manages global styling** - The root layout (`layout.tsx`) handles `min-h-screen`, `bg-background`, `text-foreground`
- **Pages focus on content** - Individual pages should only handle their specific content and padding

## Styling Guidelines

- **No max-width constraints** - Never add `max-w-*` classes that limit content width
- **Use semantic color tokens** - Always use semantic tokens like `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border` for proper dark mode support
- **Dark mode friendly** - Never use hardcoded colors like `bg-white`, `text-gray-700`, `border-gray-300` that break in dark mode
- **Table styling** - Headers must always have different background than rows (use `bg-muted/50` for headers), subtle borders with `border-muted/30`, `hover:bg-accent/30` for row hovers
- **Interactive elements** - Use `bg-primary`, `hover:bg-primary/90`, `bg-accent` with semantic foreground colors
- **Transitions** - Add `transition-colors` to interactive elements for smooth hover effects

## Form Component Guidelines

- **Use Form wrapper for all forms** - All forms must use `src/components/ui/form/form.tsx` as the parent wrapper
- **Form component handles keyboard events** - ESC to close (if closeable), Shift+Enter to submit with validation
- **Auto-focus first field** - Forms automatically focus the first input when opened
- **CRITICAL: Input height consistency** - ALL form inputs MUST have identical height using `h-10` class. Never mix different heights or padding - this looks unprofessional
- **Form components structure** (all in `src/components/ui/form/`):
  - `form.tsx` - Parent wrapper with keyboard handling and React Hook Form provider
  - `form-field.tsx` - Wraps label, input, and error display
  - `form-input.tsx` - Styled input with semantic colors
  - `form-select.tsx` - Styled select with semantic colors  
  - `form-button.tsx` - Styled button with variant system (primary, secondary, tertiary, fourth, fifth, destructive)
  - `form-submit.tsx` - Styled submit button with entity color support
- **Validation with Zod** - Use Zod schemas with `@hookform/resolvers/zod` for type-safe validation
- **Error handling** - FormField automatically displays validation errors below inputs
- **Semantic colors** - Forms use the semantic color system (border-input, focus:ring-ring, text-destructive for errors)
- **Sub-component architecture** - Create sub-components inside form components following parent-render principle: parent only renders, sub-components handle logic

## Entity Configuration

- **Entity icons and colors** - All entity visual configurations are defined in `config/entities.ts`
- **ENTITY_DATA constant** - Contains icon, color, bgColor, hoverColor, link, and description for each entity
- **Always reference entities** - When working with entities, always get color, icon, and route information from `config/entities.ts`
- **Consistent entity representation** - Use the same visual styling across all UI components by importing from the entities config

## API Call Guidelines

- **Use actions directory** - All database operations must be performed through server actions in the `actions/` directory
- **File naming convention** - Use `entities-action.ts` format (e.g., `students-action.ts`, `schools-action.ts`)
- **Drizzle ORM integration** - Use Drizzle's type-safe queries and schema types for all database operations
- **Consistent patterns** - Follow the established CRUD pattern for all entity operations
- **Schema-based parameters** - Use `entitySchema` parameter names that match the database schema (e.g., `studentSchema: NewStudent`)
- **Error handling** - All action functions must return `{ success: boolean, data?, error? }` format
- **Type safety** - Always use Drizzle's inferred types (`NewStudent`, `NewSchool`, etc.) for parameters
- **CRITICAL: revalidatePath** - ALWAYS import and call `revalidatePath()` after create/update/delete operations to refresh cached data

### Standard Action Function Template
```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { entityTable, type NewEntity } from "@/drizzle/schema";

export async function createEntity(entitySchema: NewEntity) {
  try {
    const result = await db.insert(entityTable).values(entitySchema).returning();
    revalidatePath("/entities"); // ALWAYS revalidate the entity list page
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating entity:", error);
    return { success: false, error: "Failed to create entity" };
  }
}

export async function updateEntity(id: number, entitySchema: Partial<NewEntity>) {
  try {
    const result = await db.update(entityTable).set(entitySchema).where(eq(entityTable.id, id)).returning();
    revalidatePath("/entities"); // ALWAYS revalidate after updates
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating entity:", error);
    return { success: false, error: "Failed to update entity" };
  }
}

export async function deleteEntity(id: number) {
  try {
    await db.delete(entityTable).where(eq(entityTable.id, id));
    revalidatePath("/entities"); // ALWAYS revalidate after deletes
    return { success: true };
  } catch (error) {
    console.error("Error deleting entity:", error);
    return { success: false, error: "Failed to delete entity" };
  }
}
```

### Getter Functions
- **Use getters directory** - All data transformation and business logic functions in `/getters/` directory
- **File naming convention** - Use `entities-getter.ts` format (e.g., `students-getter.ts`, `schools-getter.ts`)
- **Function patterns** - Include `getEntityName()`, `getAllEntityNames()`, `getEntityInfo()`, `getAllEntities()`
- **Error handling** - Use graceful error handling with descriptive "No X found, skipping..." messages

### Phone Number Integration
- **react-phone-number-input** - Use this library for all phone number inputs with country selection
- **Form integration** - Phone inputs should integrate with the existing form system using setValue and watch from react-hook-form
- **Styling consistency** - Phone inputs must match the semantic color system used by other form inputs

## Project Directory Structure

For detailed project structure, see `docs/structure.md`

### Key Directories:
- **actions/** - API call functions and server actions
- **ai/** - Cloud-related files and generated markdown content
- **backend/** - Backend classes and logic declarations
- **config/** - Tenant-specific configuration files (includes entities.ts for entity visual config)
- **docs/** - Application documentation for Adrenalink
- **drizzle/** - ORM configuration and database schema definitions
- **getters/** - Entity getter functions (e.g., getUserByName, getEntityByName)
- **src/** - Main application source code (Next.js app)