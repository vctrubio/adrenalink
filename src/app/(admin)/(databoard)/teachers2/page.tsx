import { getTeachers } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";

export default async function TeachersPage() {
    const result = await getTeachers();

    if (!result.success) {
        return <div>Error loading teachers: {result.error}</div>;
    }

    return <DataboardPageClient entityId="teacher" data={result.data} />;
}
