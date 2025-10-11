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
├── docs/                       # Application documentation
├── drizzle/                    # ORM configuration and database schema definitions
├── getters/                    # Entity getter functions (e.g., getUserByName, getEntityByName)
├── public/                     # Static assets (images, icons, etc.)
├── src/
│   ├── app/                    # Next.js app router pages and routes
│   │   ├── dev/                # Development-specific pages
│   │   └── welcome/            # Welcome page components
│   ├── components/             # React components
│   │   └── ui/                 # Reusable UI components
│   │       └── form/           # Form-related components (form.tsx, form-field.tsx, etc.)
│   └── providers/              # React context providers and app-wide providers
├── package.json
├── tsconfig.json
├── next.config.ts
├── CLAUDE.md
└── README.md
```

## Architecture Notes

- **Frontend**: Next.js with App Router
- **Backend**: Server actions and API routes
- **Database**: Drizzle ORM
- **Components**: UI component library with form system
- **Styling**: Tailwind CSS with semantic color system

## File Organization Principles

1. **Component grouping**: Related components are grouped in subdirectories with index exports
2. **Separation of concerns**: Backend logic separated from frontend components
3. **Configuration isolation**: Tenant configs and app docs kept separate
4. **Form architecture**: Centralized form system with validation and keyboard handling