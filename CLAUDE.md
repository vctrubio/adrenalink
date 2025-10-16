# Claude Development Guidelines

## Core Principles

- **FOLLOW INSTRUCTIONS PRECISELY** - Execute exactly what is requested, nothing more, nothing less. Do not make any modifications or improvements unless explicitly asked.
- **ASK BEFORE MODIFYING** - If you want to make any modification or improvement beyond what was requested, you MUST ask for permission first.
- **USE USERNAMES FOR URLS** - Always use username identifiers in URLs instead of UUIDs when the entity has a unique username field. URLs should be human-readable (e.g., `/schools/mit` not `/schools/uuid...`).
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
- **CRITICAL: Use db.query syntax with relations** - ALWAYS use `db.query.entityTable.findMany()` and `db.query.entityTable.findFirst()` instead of `db.select()` to automatically handle relations
- **Consistent patterns** - Follow the established CRUD pattern for all entity operations
- **Schema-based parameters** - Use `entitySchema` parameter names that match the database schema (e.g., `studentSchema: NewStudent`)
- **Return types** - Use `ApiActionResponseModel<T>` and `ApiActionResponseModelArray<T>` for consistent typing
- **Schema purity** - Schema objects contain ONLY database table fields. Relations go in separate `relations` property
- **Type safety** - Always use Drizzle's inferred types (`NewStudent`, `NewSchool`, etc.) for parameters
- **CRITICAL: revalidatePath** - ALWAYS import and call `revalidatePath()` after create/update/delete operations to refresh cached data

### Standard Action Function Template

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { entityTable, type NewEntity, type Entity } from "@/drizzle/schema";
import { EntityModel } from "@/backend/models";
import type { ApiActionResponseModelArray } from "@/types/actions";

export async function getEntities(): Promise<ApiActionResponseModelArray<Entity>> {
  try {
    const result = await db.query.entityTable.findMany({
      with: {
        entityRelations: {
          with: {
            relatedEntity: true
          }
        }
      }
    });
    
    const entities: EntityModel[] = result.map(entityData => {
      // Separate pure schema from relations
      const { entityRelations, ...pureSchema } = entityData;
      const entityModel = new EntityModel(pureSchema);
      
      // Map relations from query result
      entityModel.relations = {
        entityRelations: entityRelations
      };
      
      // Calculate lambda values
      entityModel.lambda = {
        count: entityRelations.length
      };
      
      return entityModel;
    });
    
    return entities;
  } catch (error) {
    console.error("Error fetching entities:", error);
    return { error: "Failed to fetch entities" };
  }
}
```

**CRITICAL MODEL INHERITANCE PATTERN**: All `getEntities()` functions MUST return model instances that inherit from `AbstractModel`. This ensures:
- **Schema purity**: `.schema` contains ONLY database table fields
- **Relations separation**: Relations stored in separate `.relations` property
- **Consistent data structure** across all entity pages
- **Lambda computed values** for calculated fields

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
  - **models/** - Entity model classes inheriting from AbstractModel base class
- **config/** - Tenant-specific configuration files (includes entities.ts for entity visual config)
- **docs/** - Application documentation for Adrenalink
- **drizzle/** - ORM configuration and database schema definitions
- **getters/** - Entity getter functions (e.g., getUserByName, getEntityByName)
- **src/** - Main application source code (Next.js app)
