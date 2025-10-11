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

## Component Architecture

- Parent components are for layout and rendering
- Child components contain all business logic and state management
- Props should be passed inline for clarity
- Avoid unnecessary abstractions or complex patterns