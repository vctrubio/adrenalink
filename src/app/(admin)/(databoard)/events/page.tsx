import { getEvents } from "@/actions/databoard-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { EventRow } from "@/src/components/databoard/rows/EventRow";

export default async function EventsPage() {
	const result = await getEvents();

	if (!result.success) {
		return <div>Error loading events: {result.error}</div>;
	}

	return (
		<div>
			<DataboardRowsSection entityId="event" data={result.data} rowComponent={EventRow} />
		</div>
	);
}
