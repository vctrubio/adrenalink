import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import type { BookingModel } from "@/backend/models";
import { BookingLeftColumn } from "./BookingLeftColumn";
import { BookingStatsColumns } from "./BookingStatsColumns";
import { BookingContainer } from "@/src/components/ids";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log(`BookingDetailPage: Fetched ID from params: ${id}`);
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("booking", id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const booking = result.data as BookingModel;

    console.log("DEV:JSON: BookingModel =", booking);

    // Verify booking belongs to the school
    if (booking.schema.schoolId !== schoolHeader.id) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this booking</div>
            </div>
        );
    }

    return (
        <MasterAdminLayout
            controller={<BookingLeftColumn booking={booking} />}
            form={
                <>
                    <BookingStatsColumns booking={booking} />
                    <BookingContainer booking={booking} />
                </>
            }
        />
    );
}
