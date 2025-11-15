import { getRentals } from "@/actions/rentals-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { RentalRow } from "@/src/components/databoard/rows/RentalRow";

export default async function RentalsPage() {
    const result = await getRentals();

    if (!result.success) {
        return <div className="text-destructive">Error loading rentals: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="rental" data={result.data} rowComponent={RentalRow} />
        </div>
    );
}
