import { z } from "zod";

// Bucket metadata schema for R2 storage
export const bucketMetadataSchema = z.object({
    school_username: z.string(),
    school_name: z.string(),
    owner_email: z.string().email(),
    reference_note: z.string(),
    created_at: z.string(),
    approved_at: z.string().nullable(),
    welcome_form: z.string().optional(),
});

export type BucketMetadata = z.infer<typeof bucketMetadataSchema>;