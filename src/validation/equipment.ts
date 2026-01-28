import { z } from "zod";
import { EQUIPMENT_STATUS } from "@/supabase/db/enums";

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

export const equipmentCreateSchema = z.object({
    category: z.enum(["kite", "wing", "windsurf"], { message: "Category is required" }),
    sku: z.string().min(1, "SKU is required").max(100),
    brand: z.string().min(1, "Brand is required").max(100),
    model: z.string().min(1, "Model is required").max(255),
    color: z.string().max(100).optional().nullable().or(z.literal("")),
    size: z.number().min(0).max(999.9).optional().nullable(),
    status: z.enum(["rental", "public", "selling", "sold", "inrepair", "rip"]).default("public"),
});

export type EquipmentCreateForm = z.infer<typeof equipmentCreateSchema>;

export const defaultEquipmentForm: EquipmentCreateForm = {
    category: "kite",
    sku: "",
    brand: "",
    model: "",
    color: "",
    size: 0,
    status: "public",
};