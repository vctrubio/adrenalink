import { getClassboardBookings } from "@/actions/classboard-action";

export default async function ClassBoardPage() {
    const result = await getClassboardBookings();
    const showJson = process.env.JSONIFY === "true";

    if (!result.success) {
        return (
            <div>
                <h1>Class Board</h1>
                <p>Error: {result.error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Class Board - Bookings</h1>
            {showJson ? (
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
            ) : (
                <p>Total Bookings: {result.data?.length ?? 0}</p>
            )}
        </div>
    );
}
