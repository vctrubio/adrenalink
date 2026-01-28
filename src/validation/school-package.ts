import { z } from "zod";

export const schoolPackageUpdateSchema = z.object({
    id: z.string().uuid(),
    description: z.string().min(1, "Description is required").max(500),
    is_public: z.boolean(),
    active: z.boolean(),
});

export type SchoolPackageUpdateForm = z.infer<typeof schoolPackageUpdateSchema>;

export const schoolPackageCreateSchema = z.object({
    duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
    description: z.string().min(1, "Description is required").max(500),
    price_per_student: z.number().min(0, "Price must be 0 or greater"),
    capacity_students: z.number().min(1, "Must allow at least 1 student"),
    capacity_equipment: z.number().min(1, "Must have at least 1 equipment"),
    category_equipment: z.enum(["kite", "wing", "windsurf"]),
    package_type: z.enum(["rental", "lessons"]),
    is_public: z.boolean().default(true),
});

export type SchoolPackageCreateForm = z.infer<typeof schoolPackageCreateSchema>;

export const defaultPackageForm: SchoolPackageCreateForm = {
    duration_minutes: 60,
    description: "",
    price_per_student: 0,
    capacity_students: 1,
    capacity_equipment: 1,
    category_equipment: "kite",
    package_type: "lessons",
    is_public: true,
};