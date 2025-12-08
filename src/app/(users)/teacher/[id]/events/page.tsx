import { getTeacherEvents } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";
import { EventsFilter } from "./EventsFilter";

interface TeacherEventsPageProps {
	params: Promise<{ id: string }>;
}

export default async function TeacherEventsPage({ params }: TeacherEventsPageProps) {
	const { id: teacherId } = await params;

	// Get school from subdomain header
	const schoolHeader = await getSchoolHeader();
	const schoolId = schoolHeader?.id;

	const result = await getTeacherEvents(teacherId, schoolId);

	if (!result.success) {
		return (
			<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
				Error: {result.error}
			</div>
		);
	}

	const events = result.data;

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-4">My Events</h2>

			{events.length === 0 ? (
				<p className="text-muted-foreground">No events found</p>
			) : (
				<EventsFilter events={events} />
			)}
		</div>
	);
}
