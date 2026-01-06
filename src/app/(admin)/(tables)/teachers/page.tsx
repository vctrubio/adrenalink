import { getTeachersTable } from "@/supabase/server/teachers";
import { TeachersTable } from "./TeachersTable";

export default async function TeachersMasterTablePage() {
    const teachers = await getTeachersTable();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Teachers Master Table</h1>
                <p className="text-muted-foreground">Manage instructors, track lessons, earnings and assigned gear.</p>
            </div>
            
            <TeachersTable teachers={teachers} />
        </div>
    );
}
