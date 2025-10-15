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
├── backend/                    # Backend classes and logic declarations
├── config/                     # Tenant-specific configuration files
│   └── entities.ts             # Entity visual configuration (icons, colors, routes)
├── docs/                       # Application documentation
├── drizzle/                    # ORM configuration and database schema definitions
│   ├── db.ts                   # Database connection instance
│   ├── schema.ts               # Database schema definitions (tables, types)
│   ├── migrations/             # Generated migration files
│   └── seeds/                  # Database seeding scripts
│       └── students.ts         # Student table seed data with Faker
├── getters/                    # Entity getter functions and business logic
│   ├── students-getter.ts      # Student data transformation functions (getStudentName, getAllStudents)
│   ├── schools-getter.ts       # School data transformation functions (getSchoolName, getAllSchools)
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
│   │   │   └── docs/           # Entity documentation page
│   │   ├── (tables)/           # Entity management pages with breadcrumb layout
│   │   │   ├── layout.tsx      # Tables layout with Breadcrumbs component
│   │   │   ├── bookings/       # Booking entity page
│   │   │   ├── commissions/    # Commission entity page
│   │   │   ├── equipment/      # Equipment entity page
│   │   │   ├── events/         # Event entity page
│   │   │   ├── lessons/        # Lesson entity page
│   │   │   ├── packages/       # Package entity page
│   │   │   ├── payments/       # Payment entity page
│   │   │   ├── schools/        # School entity page with data listing
│   │   │   │   └── form/       # School form page (/schools/form)
│   │   │   ├── students/       # Student entity page with data listing
│   │   │   │   └── form/       # Student form page (/students/form)
│   │   │   ├── teachers/       # Teacher entity page
│   │   │   └── users/          # User entity page
│   │   ├── dev/                # Development-specific pages
│   │   └── welcome/            # Welcome page components
│   ├── components/             # React components
│   │   ├── forms/              # Entity-specific form components
│   │   │   ├── WelcomeStudentForm.tsx # Student registration form with phone input
│   │   │   ├── WelcomeSchoolForm.tsx  # School registration form with phone input
│   │   │   └── *.tsx           # Additional entity form components
│   │   ├── Breadcrumbs.tsx     # Navigation breadcrumbs for entity pages with form/detail routing
│   │   ├── LabelTag.tsx        # Reusable entity display component
│   │   ├── navbar.tsx          # Navigation with entity links
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

- **Frontend**: Next.js with App Router
- **Backend**: Server actions and API routes
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **ORM**: Drizzle with migrations, seeding, and type-safe queries
- **Components**: UI component library with form system
- **Styling**: Tailwind CSS with semantic color system
- **Entity System**: Centralized configuration with custom JSX icons
- **API Layer**: Server actions in `/actions/` directory for all database operations with revalidatePath
- **Forms**: Entity-specific forms with react-phone-number-input integration
- **Navigation**: Breadcrumb navigation system for entity pages and form routing
- **Path Mapping**: TypeScript paths with `@/*` pointing to root directory

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
- **Visual consistency**: Icons, colors, routes, and descriptions
- **Type safety**: TypeScript interfaces for reliable data structure
- **Easy maintenance**: Single source of truth for entity properties

### Custom Icon System (`public/appSvgs/`)

- **JSX Components**: SVG files converted to React components
- **Customizable props**: `className` and `size` props for styling
- **Consistent API**: All icons follow same interface pattern
- **Bypass Tailwind purging**: Inline styles for dynamic colors

### Entity Pages (`src/app/(tables)/`)

- **Consistent layout**: All entity pages use LabelTag component
- **Color-coded borders**: Each entity has distinct visual identity
- **DRY principle**: Reusable LabelTag component reduces code duplication
- **Type-safe**: Leverages centralized entity configuration

### Navigation Enhancement

- **Two-tier navigation**: Main nav + entity-specific nav
- **Visual feedback**: Active states with entity colors
- **Responsive design**: Flexible layout for different screen sizes
- **Accessibility**: Proper ARIA labels and semantic markup

## API Architecture (`actions/` Directory)

### Server Actions Pattern

- **File naming**: Each entity has its own action file (e.g., `student.ts`, `school.ts`)
- **Function naming**: Use schema-based parameters (`createStudent(studentSchema: NewStudent)`)
- **Consistent CRUD operations**: create, get, getById, update, delete for each entity
- **Error handling**: All functions return `{ success: boolean, data?, error? }` format
- **Type safety**: Use Drizzle's inferred types (`NewStudent`, `NewSchool`, etc.)

### Standard Action Functions

Each entity action file should include:

```typescript
export async function createEntity(entitySchema: NewEntity);
export async function getEntities();
export async function getEntityById(id: number);
export async function updateEntity(
  id: number,
  entitySchema: Partial<NewEntity>,
);
export async function deleteEntity(id: number);
```

### Form Integration

- **react-phone-number-input**: Used in all forms requiring phone number input
- **Zod validation**: Schema validation matches database schema structure
- **Server actions**: Forms call actions directly with type-safe parameters
