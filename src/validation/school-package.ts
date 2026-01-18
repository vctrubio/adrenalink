import { z } from "zod";

export const schoolPackageUpdateSchema = z.object({
    id: z.string().uuid(),
    description: z.string().min(1, "Description is required").max(500),
    is_public: z.boolean(),
    active: z.boolean(),
});

export type SchoolPackageUpdateForm = z.infer<typeof schoolPackageUpdateSchema>;
