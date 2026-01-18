import { z } from "zod";

export const bookingUpdateSchema = z.object({
    id: z.string().uuid(),
    date_start: z.string().min(1, "Start date is required"),
    date_end: z.string().min(1, "End date is required"),
    leader_student_name: z.string().min(1, "Leader student is required"),
    status: z.enum(["active", "completed", "uncompleted"], {
        required_error: "Status is required",
    }),
});

export type BookingUpdateForm = z.infer<typeof bookingUpdateSchema>;
