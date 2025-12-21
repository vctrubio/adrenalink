"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { EventStats } from "@/getters/event-getter";
import { EventStats as DataboardEventStats } from "@/src/components/databoard/stats";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import { updateEvent } from "@/actions/events-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { EventModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export const calculateEventGroupStats = DataboardEventStats.getStats;

interface EventRowProps {
	item: EventModel;
	isExpanded: boolean;
	onToggle: (id: string) => void;
}

export const EventRow = ({ item: event, isExpanded, onToggle }: EventRowProps) => {
	const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
	const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

	const EventIconComponent = eventEntity.icon;
	const entityColor = eventEntity.color;
	const iconColor = isExpanded ? entityColor : "#9ca3af";

	const teacherName = EventStats.getTeacherName(event);
	const packageDesc = EventStats.getPackageDescription(event);
	const enrolledCount = EventStats.getEnrolledStudentsCount(event);
	const capacity = EventStats.getStudentCapacity(event);

	const strItems = [
		{ label: "Teacher", value: teacherName },
		{ label: "Date", value: formatDate(event.schema.date) },
		{ label: "Duration", value: getPrettyDuration(event.schema.duration || 0) },
		{ label: "Location", value: event.schema.location || "TBD" },
		{ label: "Package", value: packageDesc },
	];

	const stats = DataboardEventStats.getStats(event);

	const currentStatus = event.schema.status;
	const currentStatusConfig = EVENT_STATUS_CONFIG[currentStatus];

	const statusDropdownItems: DropdownItemProps[] = (["planned", "tbc", "completed", "uncompleted"] as const).map((status) => ({
		id: status,
		label: EVENT_STATUS_CONFIG[status].label,
		icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[status].color }} />,
		color: EVENT_STATUS_CONFIG[status].color,
		onClick: () => updateEvent(event.schema.id, { status: status as EventStatus }),
	}));

	const lesson = event.relations?.lesson;
	const teacher = lesson?.teacher;
	const TeacherIcon = teacherEntity.icon;

	return (
		<Row
			id={event.schema.id}
			entityData={event.schema}
			entityBgColor={eventEntity.bgColor}
			entityColor={eventEntity.color}
			isExpanded={isExpanded}
			onToggle={onToggle}
			head={{
				avatar: (
					<div style={{ color: iconColor }}>
						<EventIconComponent className="w-10 h-10" />
					</div>
				),
				name: (
					<HoverToEntity entity={eventEntity} id={event.schema.id}>
						{`Event ${event.schema.id.slice(0, 8)}`}
					</HoverToEntity>
				),
				status: currentStatusConfig.label,
				dropdownItems: statusDropdownItems,
				statusColor: currentStatusConfig.color,
			}}
			str={{
				label: (
					<div className="flex items-center gap-2">
						{teacher && (
							<>
								<div style={{ color: teacherEntity.color }}>
									<TeacherIcon className="w-4 h-4" />
								</div>
								<span>{teacherName}</span>
							</>
						)}
						<span className="text-muted-foreground">|</span>
						<span>{enrolledCount}/{capacity} students</span>
					</div>
				),
				items: strItems,
			}}
			action={
				<div className="flex flex-wrap gap-2">
					{teacher && (
						<HoverToEntity entity={teacherEntity} id={teacher.id}>
							<div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors cursor-pointer">
								<HeadsetIcon className="w-3 h-3" style={{ color: teacherEntity.color }} />
								<span className="text-xs font-medium">{teacher.username}</span>
							</div>
						</HoverToEntity>
					)}
				</div>
			}
			stats={stats}
		/>
	);
};
