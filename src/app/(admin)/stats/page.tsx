
import { StatsClient } from "@/src/components/stats/StatsClient";
import { getBookings, getStudents, getTeachers, getEquipments } from "@/actions/databoard-action";

export default async function StatsPage() {
    // Fetch all entity data
    const [bookingsResult, studentsResult, teachersResult, equipmentsResult] = await Promise.all([
        getBookings(),
        getStudents(),
        getTeachers(),
        getEquipments(),
    ]);

    const bookings = bookingsResult.success ? bookingsResult.data : [];
    const students = studentsResult.success ? studentsResult.data : [];
    const teachers = teachersResult.success ? teachersResult.data : [];
    const equipments = equipmentsResult.success ? equipmentsResult.data : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <StatsClient
                bookings={bookings}
                students={students}
                teachers={teachers}
                equipments={equipments}
            />
        </div>
    );
}