"use client";

import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTeacherLessonCommission } from "@/getters/teacher-commission-getter";
import { getEventStatusColor, getEventStatusLabel } from "@/types/status";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

interface TLETabProps {
	booking: ActiveBookingModel;
	isCollapsed?: boolean;
}

export const TLETab = ({ booking, isCollapsed = false }: TLETabProps) => {
	if (booking.events.length === 0) {
		return <div className="text-xs text-muted-foreground">No events scheduled</div>;
	}

	// Group events by teacher
	const eventsByTeacher = booking.events.reduce(
		(acc, event) => {
			const teacherKey = event.teacher?.id || "unknown";
			if (!acc[teacherKey]) {
				acc[teacherKey] = {
					teacher: event.teacher,
					events: [],
				};
			}
			acc[teacherKey].events.push(event);
			return acc;
		},
		{} as Record<
			string,
			{
				teacher?: { id: string; firstName: string; lastName: string };
				events: typeof booking.events;
			}
		>
	);

	return (
		<div className="space-y-4">
			{Object.entries(eventsByTeacher).map(([teacherKey, { teacher, events }]) => {
				const commission = getTeacherLessonCommission(
					events,
					events[0]?.commission
				);

				return (
					<div key={teacherKey} className="space-y-2">
						{/* Teacher Name and Commission */}
						<div className="flex items-center justify-between">
							<div className="text-sm font-semibold text-foreground">
								{teacher?.firstName} {teacher?.lastName}
							</div>
							<div className="text-xs text-muted-foreground">
								{commission.formula}
							</div>
						</div>

					{/* Events List */}
					<div className="space-y-2">
						{events.map((event) => {
							const statusColor = getEventStatusColor(event.status);
							const statusLabel = getEventStatusLabel(event.status);

							return (
								<div key={event.id} className="flex items-start gap-2 pb-2 border-b border-border last:border-b-0">
									{/* Flag Icon with Status Color */}
									<div className="flex-shrink-0 mt-0.5" style={{ color: statusColor }}>
										<FlagIcon size={16} />
									</div>

									{/* Event Details */}
									<div className="flex-1 min-w-0">
										{/* Date, Time, Status, and Duration on same line */}
										<div className="flex items-center justify-between">
											<div className="text-xs text-muted-foreground">
												{new Date(event.date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "2-digit",
												})}{" "}
												{new Date(event.date).toLocaleTimeString("en-US", {
													hour: "2-digit",
													minute: "2-digit",
												})}{" "}
												• {statusLabel}
											</div>
											{/* Duration with Icon on the right */}
											<div className="flex items-center gap-1 flex-shrink-0">
												<DurationIcon size={16} />
												<span className="text-xs font-semibold text-foreground">
													{getPrettyDuration(event.duration)}
												</span>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				);
			})}
		</div>
	);
};
