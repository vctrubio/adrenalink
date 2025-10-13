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
- **Form component handles keyboard events** - ESC to close (if closeable), Enter to submit with validation
- **Auto-focus first field** - Forms automatically focus the first input when opened
- **Form components structure** (all in `src/components/ui/form/`):
  - `form.tsx` - Parent wrapper with keyboard handling and React Hook Form provider
  - `form-field.tsx` - Wraps label, input, and error display
  - `form-input.tsx` - Styled input with semantic colors
  - `form-select.tsx` - Styled select with semantic colors  
  - `form-button.tsx` - Styled button with variant system (primary, secondary, tertiary, fourth, fifth, destructive)
- **Validation with Zod** - Use Zod schemas with `@hookform/resolvers/zod` for type-safe validation
- **Error handling** - FormField automatically displays validation errors below inputs
- **Semantic colors** - Forms use the semantic color system (border-input, focus:ring-ring, text-destructive for errors)

## Project Directory Structure

For detailed project structure, see `docs/structure.md`

### Key Directories:
- **actions/** - API call functions and server actions
- **ai/** - Cloud-related files and generated markdown content
- **backend/** - Backend classes and logic declarations
- **config/** - Tenant-specific configuration files
- **docs/** - Application documentation for Adrenalink
- **drizzle/** - ORM configuration and database schema definitions
- **getters/** - Entity getter functions (e.g., getUserByName, getEntityByName)
- **src/** - Main application source code (Next.js app)