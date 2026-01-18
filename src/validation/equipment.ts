import { z } from "zod";

export const equipmentUpdateSchema = z.object({
    id: z.string().uuid(),
    sku: z.string().min(1, "SKU is required").max(100),
    brand: z.string().min(1, "Brand is required").max(100),
    model: z.string().min(1, "Model is required").max(255),
    color: z.string().max(100).optional().nullable().or(z.literal("")),
    size: z.number().min(0).max(999.9).optional().nullable(),
    status: z.enum(["rental", "public", "selling", "sold", "inrepair", "rip"], {
        required_error: "Status is required",
    }),
});

export type EquipmentUpdateForm = z.infer<typeof equipmentUpdateSchema>;
