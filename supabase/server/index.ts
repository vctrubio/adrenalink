import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Export types
export type { RegisterPackage, RegisterStudent, RegisterSchoolStudent, RegisterCommission, RegisterTeacher, RegisterReferral, StudentBookingTableStats, TeacherLessonTableStats, RegisterTables } from "./register";

// Export functions
export { getRegisterTables } from "./register";
