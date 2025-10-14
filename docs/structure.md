# Adrenalink Repository Structure

This document outlines the directory structure and organization of the Adrenalink application.

## Directory Tree

```
adrenalink-beta/
├── .claude/                    # Claude Code configuration
├── .vscode/                    # VS Code workspace settings
├── actions/                    # API call functions and server actions
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
├── getters/                    # Entity getter functions (e.g., getUserByName, getEntityByName)
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
│   │   ├── (tables)/           # Entity management pages
│   │   │   ├── bookings/       # Booking entity page
│   │   │   ├── commissions/    # Commission entity page
│   │   │   ├── equipment/      # Equipment entity page
│   │   │   ├── events/         # Event entity page
│   │   │   ├── lessons/        # Lesson entity page
│   │   │   ├── packages/       # Package entity page
│   │   │   ├── payments/       # Payment entity page
│   │   │   ├── schools/        # School entity page
│   │   │   ├── students/       # Student entity page
│   │   │   ├── teachers/       # Teacher entity page
│   │   │   └── users/          # User entity page
│   │   ├── dev/                # Development-specific pages
│   │   └── welcome/            # Welcome page components
│   ├── components/             # React components
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

## File Organization Principles

1. **Component grouping**: Related components are grouped in subdirectories with index exports
2. **Separation of concerns**: Backend logic separated from frontend components
3. **Configuration isolation**: Tenant configs and app docs kept separate
4. **Form architecture**: Centralized form system with validation and keyboard handling
5. **Entity management**: Centralized entity configuration with visual consistency

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