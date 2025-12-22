import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { EventModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { EventIdStats } from "@/src/components/databoard/stats/EventIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { formatDate, formatEventTime } from "@/getters/date-getter";
import { EventLeftColumn } from "./EventLeftColumn";
import { EventRightColumn } from "./EventRightColumn";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const schoolHeader = await getSchoolHeader();

	if (!schoolHeader) {
		return (
			<EntityIdLayout
				header={
					<EntityHeaderRow
						entityId="event"
						entityName={`Event ${id}`}
						stats={[]}
					/>
				}
				leftColumn={<div>School context not found</div>}
				rightColumn={null}
			/>
		);
	}

	const result = await getEntityId("event", id);

	if (!result.success) {
		return (
			<EntityIdLayout
				header={
					<EntityHeaderRow
						entityId="event"
						entityName={`Event ${id}`}
						stats={[]}
					/>
				}
				leftColumn={<div>Event not found</div>}
				rightColumn={null}
			/>
		);
	}

	const event = result.data as EventModel & { schema: { schoolId?: string; date: string } };

	// Verify event belongs to the school
	if (event.schema?.schoolId !== schoolHeader.id) {
		return (
			<EntityIdLayout
				header={
					<EntityHeaderRow
						entityId="event"
						entityName={`Event ${id}`}
						stats={[]}
					/>
				}
				leftColumn={<div>You do not have permission to view this event</div>}
				rightColumn={null}
			/>
		);
	}

	const eventStats = EventIdStats.getStats(event);
	const eventDate = formatDate(event.schema?.date || "");
	const eventTime = formatEventTime(event.schema?.date || "");
	const entityName = `${eventDate} ${eventTime}`;

	return (
		<EntityIdLayout
			header={
				<EntityHeaderRow
					entityId="event"
					entityName={entityName}
					stats={eventStats}
				/>
			}
			leftColumn={<EventLeftColumn event={event} />}
			rightColumn={<EventRightColumn event={event} />}
		/>
	);
}
