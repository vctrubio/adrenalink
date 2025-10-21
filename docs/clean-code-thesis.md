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

## Preferred Code Pattern

### ✅ GOOD: Clean Structure with Result Pattern
```typescript
export async function getStudents(): Promise<ApiActionResponseModel<StudentType[]>> {
    try {
        const header = headers().get('x-school-username');
        
        let result;
        if (header) {
            result = await db.query.schoolStudents.findMany({
                where: eq(school.username, header),
                with: studentWithRelations
            });
        } else {
            result = await db.query.student.findMany({
                with: studentWithRelations
            });
        }
        
        const students = header 
            ? result.map(schoolStudent => schoolStudent.student)
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
    const schoolUsername = headers().get('x-school-username');
    
    if (schoolUsername) {
        const result = await db.query.schoolStudents.findMany({
            where: eq(school.username, schoolUsername),
            with: studentWithRelations
        });
        const students = result.map(schoolStudent => createStudentModel(schoolStudent.student));
        return students;
    } else {
        const result = await db.query.student.findMany({
            with: studentWithRelations
        });
        const students = result.map(studentData => createStudentModel(studentData));
        return students;
    }
}
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

## Implementation Guidelines

### Variable Naming
- Use descriptive names: `header`, `result`, `students`
- Avoid abbreviations: `usr` → `user`, `pkg` → `package`
- Boolean variables: `isLoading`, `hasError`, `canEdit`

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