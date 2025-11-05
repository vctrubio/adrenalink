# Card Component System

## Overview

This document outlines the card component architecture for Adrenalink. All cards in the application should follow these guidelines to maintain consistency and scalability.

The card system is organized as a **module** (like the form system), with separate files for each component to ensure maintainability and reusability.

## Core Principles

### 1. DRY (Don't Repeat Yourself)

**CRITICAL:** The card system is designed to eliminate code duplication:

- **No redundant styling** - `bg-slate-900/80` (not `bg-slate-900/80 dark:bg-slate-900/80`)
- **Default text color** - `text-white` is set on the Card component, no need to repeat it
- **Props-based headers** - Pass `name` and `status` as props, NOT as children with manual styling
- **Centralized text styles** - h3 and status div styling handled by CardHeader component
- **Single source of truth** - All card styling defined in `src/components/ui/card.tsx`

**Text Color Inheritance:**
- Card component sets `text-white` by default
- All children inherit white text automatically
- Only specify text color when using opacity variants (e.g., `text-white/60`, `text-white/80`)
- Never write `text-white` on elements that use full opacity

### 2. Always Use Dark Backgrounds

**CRITICAL:** All cards MUST use dark backgrounds for consistency across the application.

- Background color: `bg-slate-900/80` (single declaration, no dark mode variant)
- This ensures consistent appearance in both light and dark modes
- The dark background provides contrast for white text and colored accents

### 3. Inherit from Base Card Component

**Location:** `src/components/ui/card/`

All card implementations should use the base Card component and its sub-components. The card system follows a **modular architecture** (like the form system):

```
src/components/ui/card/
├── card.tsx          - Base Card container
├── card-header.tsx   - Header with name, status, avatar
├── card-body.tsx     - Generic content wrapper
├── card-list.tsx     - Field list renderer (DRY)
├── card-stats.tsx    - Stats badges
└── index.ts          - Exports all components
```

**Import Pattern:**

```tsx
import { Card, CardHeader, CardBody, CardList, CardStats } from "@/src/components/ui/card";
```

**Available Components:**

- `Card` - Base container with border, shadow, and dark background
- `CardHeader` - Header section with name, status, avatar, and colored divider
- `CardBody` - Generic content wrapper for custom content
- `CardList` - Field list renderer with consistent styling (NEW!)
- `CardStats` - Optional stats badges in top-right corner

### 4. Color System

Adrenalink uses two color configuration systems that work together:

#### Entity-Specific Colors (`config/entities.ts`)

**Location:** `config/entities.ts`

This config contains **entity-specific** icons, colors, and metadata. Use this for:
- Entity icons (e.g., `AdminIcon`, `HelmetIcon`, `BookingIcon`)
- Entity-specific text colors (e.g., `text-yellow-500` for students)
- Entity descriptions and relations

**Default Accent Color:** `#6b7280` (Grey) - Used for School/Admin entities

#### Rainbow Color Groups (`config/rainbow.ts`)

**Location:** `config/rainbow.ts`

This config groups entities by **color families** for visual consistency. Use this for:
- Understanding which entities are related by function
- Consistent color theming across features
- Visual navigation aids

| Color | Hex | Entities | Purpose |
|-------|-----|----------|---------|
| **Purple** | `#a855f7` | Equipment, Repairs | Equipment tracking and maintenance |
| **Blue** | `#3b82f6` | Booking, Lesson, Event | Core booking activities |
| **Green** | `#22c55e` | Teacher, Commission | Teacher-related features |
| **Yellow** | `#eab308` | Student | Student management |
| **Orange** | `#f97316` | Student Package, School Package | Package offerings |
| **Red** | `#ef4444` | Rental | Equipment rental |
| **Grey** | `#6b7280` | School, Referral | School homebase and admin (DEFAULT) |

## Implementation Guide

### Basic Card with Field List (Recommended)

```tsx
import { Card, CardHeader, CardList } from "@/src/components/ui/card";

export const MyCard = ({ name, status, fields, accentColor = "#6b7280" }) => {
    const avatar = (
        <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
                backgroundColor: `${accentColor}20`,
                border: `3px solid ${accentColor}`,
            }}
        >
            {/* Icon or image */}
        </div>
    );

    return (
        <Card accentColor={accentColor}>
            <CardHeader name={name} status={status} avatar={avatar} accentColor={accentColor} />
            <CardList fields={fields} />
        </Card>
    );
};
```

**CRITICAL: Component Props**

**CardHeader:**
- `name` (string) - Main title, rendered as `<h3>` with `text-3xl font-bold`
- `status` (string) - Subtitle, rendered as `<div>` with `text-xs uppercase tracking-wider text-white/60`
- `avatar` (ReactNode) - Avatar/icon element (usually circular)
- `accentColor` (string) - Colored divider line

**CardList:**
- `fields` (array) - Array of `{ label: string, value: string | number }` objects
- Renders each field with consistent styling (label left, value right, border bottom)
- NO manual styling needed - all handled internally

### Card with Stats Badges and Field List

```tsx
import { Card, CardHeader, CardList } from "@/src/components/ui/card";
import { Calendar, Users, Clock } from "lucide-react";

export const EntityCard = ({ name, status, fields, accentColor = "#6b7280" }) => {
    const stats = [
        { icon: Calendar, value: 12 },
        { icon: Users, value: 8 },
        { icon: Clock, value: 24 },
    ];

    const avatar = (
        <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
                backgroundColor: `${accentColor}20`,
                border: `3px solid ${accentColor}`,
            }}
        >
            <Calendar className="w-10 h-10" />
        </div>
    );

    return (
        <Card accentColor={accentColor} stats={stats} isActionable={false}>
            <CardHeader name={name} status={status} avatar={avatar} accentColor={accentColor} />
            <CardList fields={fields} />
        </Card>
    );
};
```

**Note:** Set `isActionable={false}` for display-only stats (like EntityInfoCard). Set `isActionable={true}` for clickable stats (like FounderInfoCard with social links).

### Card with Custom Body Content

For custom content (not a field list), use `CardBody`:

```tsx
import { Card, CardHeader, CardBody } from "@/src/components/ui/card";

export const CustomCard = ({ name, status, accentColor = "#6b7280" }) => {
    const sections = [
        { label: "Description", value: "Some description..." },
        { label: "Vision", value: "Some vision..." },
    ];

    return (
        <Card accentColor={accentColor}>
            <CardHeader name={name} status={status} avatar={avatar} accentColor={accentColor} />

            <CardBody>
                {sections.map((section, index) => (
                    <div key={index} className="py-3 border-b border-white/10 last:border-0">
                        <div className="text-xs uppercase tracking-wider text-white/60 mb-2">{section.label}</div>
                        <p className="text-sm text-white/80 leading-relaxed">{section.value}</p>
                    </div>
                ))}
            </CardBody>
        </Card>
    );
};
```

### Getting Entity Color

```tsx
import { rainbowBaseColors } from "@/config/rainbow";
import { getEntityRainbowShade } from "@/config/rainbow";
import { rainbowColors } from "@/config/rainbow";

// Get color for an entity
const shade = getEntityRainbowShade("student"); // Returns "yellow-0"
const color = rainbowColors[shade].fill; // Returns "#eab308"

// Or use base colors
const studentColor = rainbowBaseColors.yellow.fill; // Returns "#eab308"
```

## When to Use CardList vs CardBody

**Use CardList when:**
- Displaying key-value pairs (e.g., Passport, Country, Phone)
- Data follows label-value pattern
- Want consistent styling without manual work
- Example: EntityInfoCard

**Use CardBody when:**
- Custom content layout needed
- Multi-paragraph descriptions
- Mixed content types
- Example: FounderInfoCard (Description, Vision, Adrenalink sections)

## Example Implementations

### EntityInfoCard (Uses CardList)

**Location:** `src/components/cards/EntityInfoCard.tsx`

Shows entity information with:
- Circular icon/avatar
- Entity name and status
- Stats badges in top-right (display-only, `isActionable={false}`)
- **CardList for fields** - Clean, no manual styling

```tsx
<Card accentColor={accentColor} stats={stats} isActionable={false}>
    <CardHeader name={entity.name} status={status} avatar={avatar} accentColor={accentColor} />
    <CardList fields={fields} />
</Card>
```

### FounderInfoCard (Uses CardBody)

**Location:** `src/components/cards/FounderInfoCard.tsx`

Shows founder information with:
- Circular profile photo
- Name and role
- Social media icons as stats badges (clickable, `isActionable={true}`)
- **CardBody for custom sections** - Descriptions with paragraphs

```tsx
<Card accentColor={accentColor} stats={socialIcons} isActionable={true}>
    <CardHeader name={name} status={role} avatar={avatar} accentColor={accentColor} />
    <CardBody>
        {sections.map((section) => (
            <div>
                <div className="text-xs uppercase tracking-wider text-white/60 mb-2">{section.label}</div>
                <p className="text-sm text-white/80 leading-relaxed">{section.value}</p>
            </div>
        ))}
    </CardBody>
</Card>
```

## Styling Guidelines

### Card Container

- Border: `2px` solid with accent color
- Border radius: `rounded-2xl`
- Shadow: Layered shadows using accent color
- Background: `bg-slate-900/80` (always dark, no redundant dark mode variant needed)

### Card Header

**CRITICAL: DRY Principles Applied**

The CardHeader component handles all title and status styling internally to ensure consistency:

- **Props-based API:** Pass `name`, `status`, and `avatar` as props (NOT as children)
- **Name styling:** Always `text-3xl font-bold` (h3 element, inherits white from Card)
- **Status styling:** Always `text-xs uppercase tracking-wider text-white/60 mb-1` (div element)
- **Divider:** `h-1` horizontal line with accent color
- **Margin:** `my-6` for proper spacing after divider

This approach ensures:
- No duplicate text styling across card implementations
- Consistent name and status appearance
- Single source of truth for header structure
- Text color inheritance from parent Card component

### Card Body

- Spacing: `space-y-3` between items
- Borders: `border-white/10` for field dividers
- Text: Inherits white from Card, use `text-white/60` for labels, `text-white/80` for body text
- **Never specify `text-white`** - It's inherited from the parent Card component

### Stats Badges

- Position: `absolute -top-2 -right-2`
- Background: Solid accent color
- Icons: `w-4 h-4` white icons
- Text: `text-sm font-bold` white text
- **Count: Always 3 stats** - Standard pattern across all entity cards

#### Standard Stats by Entity Type

Each entity type should display 3 relevant statistics in the top-right corner:

**Students:**
```tsx
const studentStats = [
    { icon: BookingIcon, label: "Bookings", value: 12 },
    { icon: FlagIcon, label: "Events", value: 8 },
    { icon: DurationIcon, label: "Hours", value: 24 },
];
```

**Teachers:**
```tsx
const teacherStats = [
    { icon: LessonIcon, label: "Lessons", value: 45 },
    { icon: FlagIcon, label: "Events", value: 18 },
    { icon: DurationIcon, label: "Hours", value: 120 },
];
```

**General Pattern:**
- **First stat** - Primary activity count (Bookings, Lessons, etc.)
- **Second stat** - Event participation count
- **Third stat** - Time-based metric (Hours, Duration, etc.)

**Implementation:**
```tsx
{stats.map((stat, index) => {
    const StatIcon = stat.icon;
    return (
        <div key={index} className="flex items-center gap-1 px-2.5 py-2">
            <StatIcon className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">{stat.value}</span>
        </div>
    );
})}
```

See `src/app/(playground)/mock-cards/page.tsx` for complete examples.

## Color Consistency Rules

1. **Always use rainbowBaseColors for accent colors** - Never hardcode hex values directly
2. **Match entity type to color group** - Students = yellow, Teachers = green, etc.
3. **Use semantic white opacity** - `text-white` for primary, `text-white/60` for secondary, `text-white/80` for body text
4. **Maintain border consistency** - Always use accent color for borders and dividers

## Best Practices

### DO ✅

- Use the Card component system for all card implementations
- Reference `config/rainbow.ts` for entity colors
- Maintain dark background (`bg-slate-900/80`)
- Use semantic white opacity values for text (`text-white/60`, `text-white/80`)
- Keep accent colors consistent with entity types
- Let text color inherit from Card component (default white)
- Use `isActionable` prop to control stat hover behavior

### DON'T ❌

- Create custom card containers with different backgrounds
- Hardcode color values outside of rainbow.ts
- Use light backgrounds for cards
- Mix different background opacity values
- Create new card structures without using base components
- Write `text-white` on elements (it's inherited from Card)
- Make stats hoverable if they don't perform actions

## Future Considerations

### Adding New Card Types

1. Import base Card components from `src/components/ui/card.tsx`
2. Determine appropriate accent color from `config/rainbow.ts`
3. Use consistent header structure (avatar/icon + title)
4. Follow dark background and white text guidelines
5. Add stats badges if applicable

### Extending Color System

If new entity types are added:
1. Update `config/rainbow.ts` with new entity-to-color mapping
2. Ensure color choice aligns with entity purpose
3. Update `colorLabels` with description
4. Maintain color group balance

## Related Documentation

- `docs/structure.md` - Project structure overview
- `config/entities.ts` - Entity configuration
- `config/rainbow.ts` - Color system mapping

## Summary

The card component system provides a scalable, consistent foundation for displaying information throughout Adrenalink. By following these guidelines, all cards will maintain visual consistency, proper dark mode support, and clear entity-color associations that help users navigate the application intuitively.

**Key Takeaways:**
- **Modular architecture** - Separate files like the form system (`src/components/ui/card/`)
- **Always dark background** - `bg-slate-900/80` set once in Card component
- **Use CardList for field lists** - No manual styling, consistent appearance
- **Use CardBody for custom content** - When you need custom layouts
- **Default color is Grey** - `#6b7280` for School/Admin entities
- **Two color systems** - `config/entities.ts` for entity-specific, `config/rainbow.ts` for grouping
- **isActionable prop** - Controls whether stats are hoverable
- **Text color inheritance** - `text-white` from Card, only specify opacity variants
