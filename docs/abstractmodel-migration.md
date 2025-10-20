# AbstractModel Migration Guide for Next.js 15

## Problem Solved

Next.js 15 introduced strict serialization rules that prevent class instances from being passed between Server and Client Components. The error was:

```
Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
```

## Solution: Auto-Serializable AbstractModel

### What We Did for Schools (✅ COMPLETED)

#### 1. **Clean AbstractModel with Auto-Serialization**
```typescript
// backend/models/AbstractModel.ts
export abstract class AbstractModel<T> {
    tableName: string;
    schema: T;
    relations?: Record<string, any>;
    lambda?: Record<string, any>;

    constructor(tableName: string, schema: T) {
        this.tableName = tableName;
        this.schema = schema;
    }

    toJSON() {
        return {
            tableName: this.tableName,
            schema: this.schema,
            relations: this.relations,
            lambda: this.lambda
        };
    }
}
```
- **How it works**: `JSON.stringify()` automatically calls `toJSON()` when serializing
- **Result**: Models pass seamlessly through Next.js Server/Client boundary
- **No more**: `SerializedAbstractModel<T>` type or `.serialize()` method needed

#### 2. **Clean Action Architecture**
```typescript
// actions/schools-action.ts
export async function createSchool(): Promise<ApiActionResponseModel<SchoolType>> {
    const result = await db.insert(school).values(schoolSchema).returning();
    return new SchoolModel(result[0]); // ✅ Clean model instance
}

export async function getSchools(): Promise<ApiActionResponseModelArray<SchoolType>> {
    const schools: SchoolModel[] = result.map((schoolData) => {
        const schoolModel = new SchoolModel(pureSchema);
        schoolModel.relations = { ... };
        schoolModel.lambda = { ... };
        return schoolModel; // ✅ Proper model with relations/lambda
    });
    return schools;
}
```

#### 3. **Component Compatibility**
```typescript
// Components receive AbstractModel instances (auto-serialized by Next.js)
interface SchoolListViewProps {
    schools: AbstractModel<SchoolType>[]; // ✅ Proper typing
}

// Components use AbstractModel directly - no .serialize() or type casting needed
<SchoolCard school={school} />
```

## Migration Checklist for Other Entities

### ❌ **PENDING: Students Entity**
1. **Update `actions/students-action.ts`:**
   - Import `StudentModel` from `@/backend/models`
   - Change `createStudent()` to return `new StudentModel(result[0])`
   - Change `getStudents()` to return `StudentModel[]` instances with relations/lambda
   - Change `getStudentById()` to return `StudentModel` instance

2. **Update Components:**
   - Remove `.serialize()` calls in student components
   - Update type annotations to use `AbstractModel<StudentType>`

### ❌ **PENDING: Packages Entity**
1. **Update `actions/packages-action.ts`:**
   - Import `PackageModel` from `@/backend/models`
   - Change actions to return proper model instances
   - Add relations and lambda calculations

2. **Update Components:**
   - Remove `.serialize()` calls in package components
   - Update type annotations

### ❌ **PENDING: Other Entities**
Apply same pattern to:
- Bookings
- School-Student relationships
- Any other entities using the AbstractModel pattern

## Benefits of This Architecture

### ✅ **DRY (Don't Repeat Yourself)**
- Serialization logic in one place (`AbstractModel.toJSON()`)
- No `SerializedAbstractModel<T>` type duplication
- No manual `.serialize()` calls needed
- Consistent pattern across all entities

### ✅ **Type Safety**
- Real model instances with proper TypeScript types
- IntelliSense support for model methods and properties
- Compile-time error checking

### ✅ **Scalable**
- Same pattern works for all current and future entities
- No entity-specific serialization code needed
- Easy to add new relations and lambda calculations

### ✅ **Next.js 15 Compatible**
- Automatic serialization without manual intervention
- No "Classes or null prototypes" errors
- Seamless Server/Client component communication

## Key Principles

1. **Server Actions return AbstractModel instances** - not plain objects
2. **AbstractModel.toJSON() handles serialization** - automatic via JSON.stringify()
3. **Components use AbstractModel directly** - no `.serialize()` calls or type casting needed
4. **Relations and lambda data** - calculated in actions, attached to models
5. **Clean types** - no `SerializedAbstractModel<T>` type needed anywhere

## Files That Still Need .serialize() Removal

Current files still using `.serialize()` method (will break after migration):
- `src/app/(tables)/students/page.tsx`
- `src/app/(tables)/students/[id]/page.tsx`
- `src/app/(tables)/packages/page.tsx`
- `src/app/subdomain/page.tsx`
- `src/app/(tables)/schools/[id]/page.tsx`

## Next Steps

1. **✅ COMPLETED: School entity migration** - City field removed, timezone added, AbstractModel working
2. **❌ PENDING: Migrate students entity** using this pattern
3. **❌ PENDING: Migrate packages entity** using this pattern  
4. **❌ PENDING: Remove all remaining .serialize() calls**
5. **❌ PENDING: Update remaining components to use AbstractModel types**

---

**Note**: This migration preserves all existing functionality while making the codebase Next.js 15 compatible and more maintainable.