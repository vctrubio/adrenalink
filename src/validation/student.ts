import { z } from "zod";

export const studentUpdateSchema = z.object({
    id: z.string().uuid(),
    first_name: z.string().min(1, "First name is required").max(255),
    last_name: z.string().min(1, "Last name is required").max(255),
    passport: z.string().min(1, "Passport is required").max(50),
    country: z.string().min(1, "Country is required").max(100),
    phone: z.string().min(1, "Phone is required").max(20),
    languages: z.union([z.string(), z.array(z.string())]),
    description: z.string().optional().nullable(),
    email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
    active: z.boolean(),
    rental: z.boolean(),
});

export type StudentUpdateForm = z.infer<typeof studentUpdateSchema>;
