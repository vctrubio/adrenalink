import { getEntityId } from "@/actions/id-actions";
import type { BookingModel } from "@/backend/models";
import { InfoHeader } from "../../InfoHeader";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("booking", id);

    if (!result.success) {
        return <InfoHeader title={`Booking ${id}`} />;
    }

    const booking = result.data as BookingModel;
    const bookingTitle = booking.schema.leaderStudentName;

    return (
        <>
            <InfoHeader title={bookingTitle} />
            <div className="space-y-4">
                {/* Booking details will go here */}
            </div>
        </>
    );
}
