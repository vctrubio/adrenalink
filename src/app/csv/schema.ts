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

export const EQUIPMENT_IMPORT_SCHEMA: EntitySchema = {
    title: "Equipments",
    columns: [
        { dbField: "type", label: "Type", type: "enum", allowedValues: ["kite", "wing", "windsurf"], required: true },
        { dbField: "brand", label: "Brand", type: "string", required: true },
        { dbField: "model", label: "Model", type: "string", required: true },
        { dbField: "size", label: "Size", type: "number", required: true },
        { dbField: "color", label: "Color", type: "string", required: false },
        { dbField: "sku", label: "SKU", type: "string", required: true },
    ],
    zodSchema: z.object({
        type: z.enum(["kite", "wing", "windsurf"]),
        brand: z.string().min(1),
        model: z.string().min(1),
        size: z.coerce.number(),
        color: z.string().optional(),
        sku: z.string().min(1),
    }),
};

export const STUDENT_IMPORT_SCHEMA: EntitySchema = {
    title: "Students",
    columns: [
        { dbField: "first_name", label: "First Name", type: "string", required: true },
        { dbField: "last_name", label: "Last Name", type: "string", required: true },
        { dbField: "passport", label: "Passport", type: "string", required: false },
        { dbField: "country", label: "Country", type: "string", required: true },
        { dbField: "phone", label: "Phone", type: "string", required: true },
        { dbField: "email", label: "Email", type: "email", required: true },
    ],
    zodSchema: z.object({
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        passport: z.string().optional(),
        country: z.string().min(1),
        phone: z.string().min(5),
        email: z.string().email(),
    }),
};

export const TEACHER_IMPORT_SCHEMA: EntitySchema = {
    title: "Teachers",
    columns: [
        { dbField: "username", label: "Username", type: "string", required: true },
        { dbField: "first_name", label: "First Name", type: "string", required: true },
        { dbField: "last_name", label: "Last Name", type: "string", required: true },
        { dbField: "email", label: "Email", type: "email", required: true },
        { dbField: "phone", label: "Phone", type: "string", required: true },
    ],
    zodSchema: z.object({
        username: z.string().min(1),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(5),
    }),
};

export const BOOKING_IMPORT_SCHEMA: EntitySchema = {
    title: "Bookings",
    columns: [
        { dbField: "start_date", label: "Start Date", type: "string", required: true },
        { dbField: "end_date", label: "End Date", type: "string", required: true },
        { dbField: "package_id", label: "Package ID", type: "string", required: true },
        { dbField: "deposit", label: "Deposit", type: "number", required: true },
        { dbField: "total_to_pay", label: "Total to Pay", type: "number", required: true },
    ],
    zodSchema: z.object({
        start_date: z.string().min(1),
        end_date: z.string().min(1),
        package_id: z.string().min(1),
        deposit: z.coerce.number(),
        total_to_pay: z.coerce.number(),
    }),
};

export const ENTITY_SCHEMAS: Record<string, EntitySchema> = {
    school: SCHOOL_IMPORT_SCHEMA,
    packages: PACKAGE_IMPORT_SCHEMA,
    equipments: EQUIPMENT_IMPORT_SCHEMA,
    students: STUDENT_IMPORT_SCHEMA,
    teachers: TEACHER_IMPORT_SCHEMA,
    bookings: BOOKING_IMPORT_SCHEMA,
};
