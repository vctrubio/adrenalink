# Adrenalink Repository Structure

This document outlines the directory structure and organization of the Adrenalink application.

## Directory Tree

```
adrenalink-beta/
├── .claude/                    # Claude Code configuration
├── .vscode/                    # VS Code workspace settings
├── actions/                    # Server actions and API call functions using Drizzle ORM
│   ├── students-action.ts      # Student CRUD operations (create, read, update, delete)
│   ├── schools-action.ts       # School CRUD operations
│   └── *-action.ts             # Additional entity action files (plural-action format)
├── ai/                         # Cloud-related files and generated markdown content
├── backend/                    # Backend type definitions and logic declarations
│   └── models/                 # Entity model types and create functions (Next.js 15 compatible)
│       ├── index.ts            # Model exports (AbstractModel type, all entity models)
│       ├── StudentModel.ts     # Student model type with createStudentModel function
│       ├── SchoolModel.ts      # School model type with createSchoolModel function
│       └── *Model.ts           # Additional entity model files
├── config/                     # Tenant-specific configuration files
│   └── entities.ts             # Entity configuration (icons, colors, routes, relations)
├── docs/                       # Application documentation
├── drizzle/                    # ORM configuration and database schema definitions
│   ├── db.ts                   # Database connection instance
│   ├── schema.ts               # Database schema definitions (tables, types)
│   ├── migrations/             # Generated migration files
│   └── seeds/                  # Database seeding scripts
│       └── students.ts         # Student table seed data with Faker
├── getters/                    # Entity getter functions and computed values (Next.js 15 compatible)
│   ├── students-getter.ts      # Student data transformation functions (getStudentName, computed values)
│   ├── schools-getter.ts       # School data transformation functions (getSchoolName, computed values)
│   ├── entities-getter.ts      # Entity count fetching (getEntityCount)
│   └── *-getter.ts             # Additional entity getter files (plural-getter format)
├── public/                     # Static assets (images, icons, etc.)
│   └── appSvgs/                # Custom SVG icons converted to JSX components
│       ├── AdminIcon.jsx       # School entity icon
│       ├── BookingIcon.jsx     # Booking entity icon
│       ├── CreditIcon.jsx      # Commission/Payment entity icon
│       ├── EquipmentIcon.jsx   # Equipment entity icon
│       ├── FlagIcon.jsx        # Lesson entity icon
│       ├── HeadsetIcon.jsx     # Teacher entity icon
│       ├── HelmetIcon.jsx      # Student entity icon
│       ├── KiteIcon.jsx        # Event entity icon
│       ├── PackageIcon.jsx     # Package entity icon
│       ├── RegistrationIcon.jsx # User entity icon
│       └── *.jsx               # Additional custom icons
├── src/
│   ├── app/                    # Next.js app router pages and routes
│   │   ├── (playground)/       # Development and testing pages
│   │   │   ├── csv/            # CSV import functionality
│   │   │   ├── docs/           # Entity documentation page
│   │   │   └── table/          # Entity databoard with relations visualization
│   │   ├── (tables)/           # Entity management pages with EntityCard headers
│   │   │   ├── layout.tsx      # Tables layout with Breadcrumbs component
│   │   │   ├── bookings/       # Booking entity page with EntityCard
│   │   │   ├── commissions/    # Commission entity page with EntityCard
│   │   │   ├── equipment/      # Equipment entity page with EntityCard
│   │   │   ├── events/         # Event entity page with EntityCard
│   │   │   ├── lessons/        # Lesson entity page with EntityCard
│   │   │   ├── packages/       # Package entity page with data listing and EntityCard
│   │   │   ├── payments/       # Payment entity page with EntityCard
│   │   │   ├── request/        # Student package requests page (/request)
│   │   │   ├── schools/        # School entity page with data listing and EntityCard
│   │   │   │   └── form/       # School form page (/schools/form)
│   │   │   ├── students/       # Student entity page with data listing and EntityCard
│   │   │   │   └── form/       # Student form page (/students/form)
│   │   │   ├── teachers/       # Teacher entity page with EntityCard
│   │   │   └── users/          # User entity page with EntityCard
│   │   ├── dev/                # Development-specific pages
│   │   └── welcome/            # Welcome page components
│   ├── components/             # React components
│   │   ├── cards/              # Card components
│   │   │   ├── EntityCard.tsx  # Entity card with relations (client component)
│   │   │   ├── SchoolCard.tsx  # School entity card
│   │   │   ├── StudentCard.tsx # Student entity card
│   │   │   └── *.tsx           # Additional entity card components
│   │   ├── forms/              # Entity-specific form components
│   │   │   ├── WelcomeStudentForm.tsx # Student registration form with phone input
│   │   │   ├── WelcomeSchoolForm.tsx  # School registration form with phone input
│   │   │   └── *.tsx           # Additional entity form components
│   │   ├── navigations/        # Navigation components
│   │   │   ├── Devbar.tsx      # Development navigation bar
│   │   │   └── Breadcrumbs.tsx # Navigation breadcrumbs for entity pages
│   │   ├── tags/               # Tag/badge components
│   │   │   └── LabelTag.tsx    # Reusable entity badge with optional link (client component)
│   │   ├── themes/             # Theme components
│   │   │   └── toggle-theme.tsx # Dark mode toggle
│   │   └── ui/                 # Reusable UI components
│   │       └── form/           # Form-related components (form.tsx, form-field.tsx, etc.)
│   └── providers/              # React context providers and app-wide providers
├── .env.example                # Environment variables template
├── .env.local                  # Local environment variables (git ignored)
├── drizzle.config.ts           # Drizzle ORM configuration
├── package.json
├── tsconfig.json
├── next.config.ts
├── CLAUDE.md
└── README.md
```

## Architecture Notes

- **Frontend**: Next.js 15 with App Router
- **Backend**: Server actions and API routes
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **ORM**: Drizzle with migrations, seeding, and type-safe queries using `db.query` syntax
- **Components**: UI component library with form system and entity card system
- **Styling**: Tailwind CSS with semantic color system and dynamic hex colors
- **Entity System**: Centralized configuration with custom JSX icons and relations mapping
- **API Layer**: Server actions in `/actions/` directory for all database operations with revalidatePath
- **Forms**: Entity-specific forms with react-phone-number-input integration
- **Navigation**: Breadcrumb navigation system and entity-based navigation with relations
- **Path Mapping**: TypeScript paths with `@/*` pointing to root directory
- **Model Architecture**: Type-based models (not classes) for Next.js 15 compatibility with no serialization issues

## File Organization Principles

1. **Component grouping**: Related components are grouped in subdirectories with index exports
2. **Separation of concerns**: Backend logic separated from frontend components
3. **Configuration isolation**: Tenant configs and app docs kept separate
4. **Form architecture**: Centralized form system with validation and keyboard handling
5. **Entity management**: Centralized entity configuration with visual consistency
6. **API consistency**: Standardized CRUD operations in action files using Drizzle ORM
7. **Form integration**: Entity forms use react-phone-number-input for phone/country handling

## Entity System Architecture

### Entity Configuration (`config/entities.ts`)

- **Centralized configuration**: All entity metadata in one place
- **Visual consistency**: Icons, colors (hex values), routes, and descriptions
- **Relations mapping**: Each entity defines related entity IDs
- **Type safety**: TypeScript interfaces for reliable data structure
- **Easy maintenance**: Single source of truth for entity properties
- **Color system**: Uses hex values for dynamic styling (no Tailwind class conversion)

### Custom Icon System (`public/appSvgs/`)

- **JSX Components**: SVG files converted to React components
- **Customizable props**: `className` and `size` props for styling
- **Consistent API**: All icons follow same interface pattern
- **Bypass Tailwind purging**: Inline styles for dynamic colors

### Entity Pages (`src/app/(tables)/`)

- **Consistent layout**: All entity pages use EntityCard component as header
- **Relations display**: EntityCard shows related entities with clickable badges
- **Color-coded borders**: Each entity has distinct visual identity using hex colors
- **DRY principle**: EntityCard fetches entity data internally using entityId prop
- **Type-safe**: Leverages centralized entity configuration
- **Navigation**: Clicking relation badges navigates to related entity pages

### Navigation Enhancement

- **Devbar Component**: Main navigation with entity tables sub-navigation
- **Entity relations**: Visual relation badges in EntityCard headers
- **Visual feedback**: Active states with entity colors and hover effects
- **Responsive design**: Flexible layout for different screen sizes
- **Accessibility**: Proper ARIA labels and semantic markup
- **Router-based navigation**: Uses Next.js router for programmatic navigation in badges

## API Architecture (`actions/` Directory)

### Server Actions Pattern

- **File naming**: Each entity has its own action file (e.g., `student.ts`, `school.ts`)
- **Function naming**: Use schema-based parameters (`createStudent(studentSchema: NewStudent)`)
- **Consistent CRUD operations**: create, get, getById, update, delete for each entity
- **Error handling**: All functions return `ApiActionResponseModel<T>` format (`AbstractModel<T> | { error: string }`)
- **Type safety**: Use Drizzle's inferred types (`NewStudent`, `NewSchool`, etc.)

### Standard Action Functions

Each entity action file should include:

```typescript
export async function createEntity(entitySchema: NewEntity): Promise<ApiActionResponseModel<EntityType>>;
export async function getEntities(): Promise<EntityModel[]>;
export async function getEntityById(id: number): Promise<ApiActionResponseModel<EntityType>>;
export async function updateEntity(
  id: number,
  entitySchema: Partial<NewEntity>,
): Promise<ApiActionResponseModel<EntityType>>;
export async function deleteEntity(id: number): Promise<{ error: string } | void>;
```

**IMPORTANT**: All `getEntities()` functions must return model instances (e.g., `StudentModel[]`, `SchoolModel[]`) that conform to `AbstractModel<T>` type. This ensures consistent data structure with `.schema` property access patterns and `.relations.tableName` for related data access in components. Models use type-based architecture (not classes) for Next.js 15 serialization compatibility.

### Form Integration

- **react-phone-number-input**: Used in all forms requiring phone number input
- **Zod validation**: Schema validation matches database schema structure
- **Server actions**: Forms call actions directly with type-safe parameters

## Component Architecture

### EntityCard Component (`src/components/cards/EntityCard.tsx`)

- **Client component**: Uses `"use client"` directive for interactive features
- **Simplified API**: Accepts only `entityId` and optional `count` props
- **Auto-fetching**: Fetches entity data from `ENTITY_DATA` internally
- **Relations display**: Shows related entities as clickable color-coded badges
- **Single source**: Uses hex colors directly from entity configuration
- **Clickable**: Entire card is a link to entity page

### LabelTag Component (`src/components/tags/LabelTag.tsx`)

- **Client component**: Uses `"use client"` for router navigation
- **Badge display**: Small icon + text badge with entity colors
- **Optional link**: If link provided, uses `router.push()` for navigation
- **No nested links**: Uses div with onClick to avoid nested `<a>` tags
- **Reusable**: Used for relation badges in EntityCard

### Model Architecture (Next.js 15 Compatible)

- **Type-based**: Models are types, not classes (no serialization issues)
- **Create functions**: Each model has `createEntityModel()` function
- **AbstractModel type**: Base type with `entityConfig`, `schema`, and `relations`
- **No lambda functions**: All computed values moved to `/getters/` directory
- **Direct passing**: Model data can be passed directly to client components without `.serialize()`
