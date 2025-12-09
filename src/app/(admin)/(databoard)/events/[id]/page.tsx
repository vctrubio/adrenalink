import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import type { EventModel } from "@/backend/models";
import { EventLeftColumn } from "./EventLeftColumn";
import { EventRightColumn } from "./EventRightColumn";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const schoolHeader = await getSchoolHeader();

	if (!schoolHeader) {
		return (
			<div className="p-8">
				<div className="text-destructive">Error: School context not found</div>
			</div>
		);
	}

	const result = await getEntityId("event", id);

	if (!result.success) {
		return (
			<div className="p-8">
				<div className="text-destructive">Error: {result.error}</div>
			</div>
		);
	}

	const event = result.data as EventModel;

	// Verify event belongs to the school
	if (event.schema.schoolId !== schoolHeader.id) {
		return (
			<div className="p-8">
				<div className="text-destructive">Error: You do not have permission to view this event</div>
			</div>
		);
	}

	return (
		<MasterAdminLayout
			controller={<EventLeftColumn event={event} />}
			form={<EventRightColumn event={event} />}
		/>
	);
}
