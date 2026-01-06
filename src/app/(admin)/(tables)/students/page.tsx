import { getStudentsTable } from "@/supabase/server/students";
import { StudentsTable } from "./StudentsTable";

export default async function StudentsMasterTablePage() {
    const students = await getStudentsTable();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Students Master Table</h1>
                <p className="text-muted-foreground">Manage students, view their bookings, and track payment status.</p>
            </div>

            <StudentsTable students={students} />
        </div>
    );
}
