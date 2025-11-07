import { getRentals } from "@/actions/rentals-action";
import { ClientDataHeader } from "@/src/components/databoard/ClientDataHeader";
import { RentalRow } from "@/src/components/databoard/rows/RentalRow";

export default async function RentalsPage() {
    const result = await getRentals();

    if (!result.success) {
        return <div className="p-8 text-destructive">Error loading rentals: {result.error}</div>;
    }

    return (
        <div className="p-8">
            <ClientDataHeader entityId="rental" data={result.data} rowComponent={RentalRow} />
        </div>
    );
}
