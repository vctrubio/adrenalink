import { getEvents } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { EventRow, calculateEventGroupStats } from "@/src/components/databoard/rows/EventRow";
import { EventDropdownRow } from "@/src/components/databoard/rows/EventDropdownRow";

export default async function EventsPage() {
    const result = await getEvents();

    if (!result.success) {
        return <div>Error loading events: {result.error}</div>;
    }

    return <DataboardPageClient entityId="event" data={result.data} rowComponent={EventRow} calculateStats={calculateEventGroupStats} dropdownComponent={EventDropdownRow} />;
}
