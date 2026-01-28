import { z } from "zod";

export const commissionSchema = z.object({
    id: z.string().optional(),
    commission_type: z.enum(["fixed", "percentage"]),
    cph: z.number().min(0),
    description: z.string().optional().nullable(),
});

export type CommissionData = z.infer<typeof commissionSchema>;

export const teacherUpdateSchema = z.object({
    id: z.string().uuid(),
    username: z.string().min(1, "Username is required").max(100),
    first_name: z.string().min(1, "First name is required").max(255),
    last_name: z.string().min(1, "Last name is required").max(255),
    email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
    passport: z.string().min(1, "Passport is required").max(50),
    country: z.string().min(1, "Country is required").max(100),
    phone: z.string().min(1, "Phone is required").max(20),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    active: z.boolean(),
});

export type TeacherUpdateForm = z.infer<typeof teacherUpdateSchema>;

export const teacherCreateSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(255),
    last_name: z.string().min(1, "Last name is required").max(255),
    username: z
        .string()
        .min(1, "Username is required")
        .regex(/^[a-z0-9_-]+$/, "Username must be lowercase letters, numbers, dashes, or underscores"),
    passport: z.string().min(1, "Passport is required").max(50),
    country: z.string().min(1, "Country is required").max(100),
    phone: z.string().min(1, "Phone is required").max(20),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
    commissions: z.array(commissionSchema).default([]),
});

export type TeacherCreateForm = z.infer<typeof teacherCreateSchema>;

export const defaultTeacherForm: TeacherCreateForm = {
    first_name: "",
    last_name: "",
    username: "",
    passport: "",
    country: "",
    phone: "",
    languages: ["English"],
    email: "",
    commissions: [],
};