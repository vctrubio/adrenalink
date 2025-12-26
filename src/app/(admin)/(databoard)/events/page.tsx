import { getEvents } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { eventRenderers, calculateEventGroupStats } from "@/src/components/databoard/rows/EventRow";

export default async function EventsPage() {
    const result = await getEvents();

    if (!result.success) {
        return <div>Error loading events: {result.error}</div>;
    }

    return <DataboardPageClient entityId="event" data={result.data} renderers={eventRenderers} calculateStats={calculateEventGroupStats} />;
}
