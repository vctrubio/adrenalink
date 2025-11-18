import { getClassboardBookings } from "@/actions/classboard-action";
import ClientClassboard from "./ClientClassboard";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";

export default async function ClassBoardPage() {
    const result = await getClassboardBookings();

    if (!result.success) {
        return (
            <div>
                <h1>Class Board</h1>
                <p>Error: {result.error}</p>
            </div>
        );
    }

    return (
        <SchoolTeachersProvider>
            <ClientClassboard data={result.data} />
        </SchoolTeachersProvider>
    );
}
