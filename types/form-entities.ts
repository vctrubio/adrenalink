import { z } from "zod";
import { equipmentStatusEnum } from "@/drizzle/schema";

// ============================================================================
// STUDENT FORM
// ============================================================================

export const studentFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    passport: z.string().min(1, "Passport is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    description: z.string().optional(),
    canRent: z.boolean().default(false),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

export const defaultStudentForm: StudentFormData = {
    firstName: "",
    lastName: "",
    passport: "",
    country: "",
    phone: "",
    languages: [],
    description: "",
    canRent: false,
};

// ============================================================================
// TEACHER FORM
// ============================================================================

export const commissionSchema = z.object({
    id: z.string(),
    commissionType: z.enum(["fixed", "percentage"]),
    commissionValue: z.number().min(0),
    commissionDescription: z.string().optional(),
});

export type CommissionData = z.infer<typeof commissionSchema>;

export const teacherFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-z0-9_-]+$/, "Username must be lowercase letters, numbers, dashes, or underscores"),
    passport: z.string().min(1, "Passport is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    commissions: z.array(commissionSchema).default([]),
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;

export const defaultTeacherForm: TeacherFormData = {
    firstName: "",
    lastName: "",
    username: "",
    passport: "",
    country: "",
    phone: "",
    languages: ["English"],
    commissions: [],
};

// ============================================================================
// PACKAGE FORM
// ============================================================================

export const packageFormSchema = z.object({
    durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
    description: z.string().min(1, "Description is required"),
    pricePerStudent: z.number().min(0, "Price must be 0 or greater"),
    capacityStudents: z.number().min(1, "Must allow at least 1 student"),
    capacityEquipment: z.number().min(1, "Must have at least 1 equipment"),
    categoryEquipment: z.enum(["kite", "wing", "windsurf"]),
    packageType: z.enum(["rental", "lessons"]),
    isPublic: z.boolean(),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;

export const defaultPackageForm: PackageFormData = {
    durationMinutes: 60,
    description: "",
    pricePerStudent: 0,
    capacityStudents: 1,
    capacityEquipment: 1,
    categoryEquipment: "" as any,
    packageType: "" as any,
    isPublic: true,
};

// ============================================================================
// EQUIPMENT FORM
// ============================================================================

export const equipmentFormSchema = z.object({
    category: z.enum(["kite", "wing", "windsurf"], { message: "Category is required" }),
    sku: z.string().min(1, "SKU is required"),
    model: z.string().min(1, "Model is required"),
    color: z.string().optional(),
    size: z.number().optional(),
    status: z.enum(equipmentStatusEnum.enumValues).optional(),
});

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

export const defaultEquipmentForm: EquipmentFormData = {
    category: "" as any,
    sku: "",
    model: "",
    color: "",
    size: undefined,
    status: "public" as any,
};
