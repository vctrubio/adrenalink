import { z } from "zod";

// --- Types ---

export interface ColumnMapping {
    dbField: string;
    label: string;
    type: "string" | "number" | "enum" | "email";
    allowedValues?: string[];
    required: boolean;
}

export interface EntitySchema {
    title: string;
    columns: ColumnMapping[];
    zodSchema: z.ZodObject<any>;
}

// --- Schemas ---

export const SCHOOL_IMPORT_SCHEMA: EntitySchema = {
    title: "Schools",
    columns: [
        { dbField: "name", label: "Name", type: "string", required: true },
        { dbField: "currency", label: "Currency", type: "enum", allowedValues: ["USD", "EUR", "CHF"], required: true },
        { dbField: "country", label: "Country", type: "string", required: true },
        { dbField: "website_url", label: "Website", type: "string", required: false },
        { dbField: "phone", label: "Phone", type: "string", required: true },
        { dbField: "instagram_url", label: "Instagram", type: "string", required: false },
    ],
    zodSchema: z.object({
        name: z.string().min(1, "Name is required"),
        currency: z.enum(["USD", "EUR", "CHF"]),
        country: z.string().min(1, "Country is required"),
        website_url: z.string().optional(),
        phone: z.string().min(5, "Valid phone required"),
        instagram_url: z.string().optional(),
    }),
};

export const PACKAGE_IMPORT_SCHEMA: EntitySchema = {
    title: "Packages",
    columns: [
        { dbField: "package_type", label: "Type", type: "enum", allowedValues: ["lessons", "rental"], required: true },
        { dbField: "description", label: "Name", type: "string", required: true },
        { dbField: "category_equipment", label: "Equipment", type: "enum", allowedValues: ["kite", "wing", "windsurf"], required: true },
        { dbField: "capacity_equipment", label: "Cap. Equip", type: "number", required: true },
        { dbField: "capacity_students", label: "Cap. Student", type: "number", required: true },
        { dbField: "duration_minutes", label: "Duration", type: "number", required: true },
        { dbField: "price_per_student", label: "Price", type: "number", required: true },
    ],
    zodSchema: z.object({
        package_type: z.enum(["lessons", "rental"]),
        description: z.string().min(1, "Name is required"),
        category_equipment: z.enum(["kite", "wing", "windsurf"]),
        capacity_equipment: z.coerce.number().min(1),
        capacity_students: z.coerce.number().min(1),
        duration_minutes: z.coerce.number().min(1),
        price_per_student: z.coerce.number().min(0),
    }),
};

export const ENTITY_SCHEMAS: Record<string, EntitySchema> = {
    school: SCHOOL_IMPORT_SCHEMA,
    packages: PACKAGE_IMPORT_SCHEMA,
};
