import { z } from "zod";

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
