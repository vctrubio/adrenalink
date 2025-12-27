"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { EventStats as EventStatsGetters } from "@/getters/event-getter";
import { EventStats as DataboardEventStats } from "@/src/components/databoard/stats";
import { formatDate, formatEventTime } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import { updateEvent } from "@/actions/events-action";
import type { EventModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { EquipmentCreateTag, EquipmentTag } from "@/src/components/tags";
import type { TableRenderers } from "../DataboardTableSection";
import { RowHead } from "@/src/components/ui/row/row-head";
import { RowStr } from "@/src/components/ui/row/row-str";

export const calculateEventGroupStats = DataboardEventStats.getStats;

const EventAction = ({ event }: { event: EventModel }) => {
    const equipmentEvents = event.relations?.equipmentEvents || [];
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const EquipmentIcon = equipmentEntity.icon;

    return (
        <div className="flex flex-wrap gap-2">
            {equipmentEvents.length === 0 ? (
                <EquipmentCreateTag icon={<EquipmentIcon className="w-3 h-3" />} onClick={() => console.log("Adding new equipment...")} />
            ) : (
                <>
                    {equipmentEvents.map((equipmentEvent) => {
                        const equipment = equipmentEvent.equipment;
                        if (!equipment) return null;

                        return <EquipmentTag key={equipment.id} icon={<EquipmentIcon className="w-3 h-3" />} model={equipment.model} size={equipment.size} link={`/equipments/${equipment.id}`} />;
                    })}
                </>
            )}
        </div>
    );
};

export const eventRenderers: TableRenderers<EventModel> = {
    renderEntity: (event) => {
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        const schoolPackage = event.relations.lesson?.booking?.studentPackage?.schoolPackage;
        const category = schoolPackage?.categoryEquipment;
        const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
        const CategoryIcon = categoryConfig?.icon;
        const EventIconComponent = eventEntity.icon;

        const currentStatus = event.schema.status;
        const currentStatusConfig = EVENT_STATUS_CONFIG[currentStatus];

        const statusDropdownItems: DropdownItemProps[] = (["planned", "tbc", "completed", "uncompleted"] as const).map((status) => ({
            id: status,
            label: EVENT_STATUS_CONFIG[status].label,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[status].color }} />,
            color: EVENT_STATUS_CONFIG[status].color,
            onClick: () => updateEvent(event.schema.id, { status: status as EventStatus }),
        }));

        return (
            <RowHead
                avatar={
                    <div className="group" style={{ color: eventEntity.color }}>
                        {CategoryIcon ? (
                            <CategoryIcon className="w-8 h-8 transition-colors duration-200 group-hover:!text-current" style={{ color: categoryConfig?.color }} />
                        ) : (
                            <EventIconComponent className="w-8 h-8" />
                        )}
                    </div>
                }
                name={
                    <div className="flex items-baseline gap-2">
                        <HoverToEntity entity={eventEntity} id={event.schema.id}>
                            <span className="text-lg font-bold">{formatEventTime(event.schema.date)}</span>
                        </HoverToEntity>
                        <span className="text-muted-foreground text-sm">
                            {new Date(event.schema.date).getDate()}-{new Date(event.schema.date).toLocaleString("en-US", { month: "short" })}
                        </span>
                    </div>
                }
                status={currentStatusConfig.label}
                dropdownItems={statusDropdownItems}
                statusColor={currentStatusConfig.color}
            />
        );
    },
    renderStr: (event) => {
        const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
        const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        
        const packageDesc = EventStatsGetters.getPackageDescription(event);
        const capacity = EventStatsGetters.getStudentCapacity(event);
        const schoolPackage = event.relations.lesson?.booking?.studentPackage?.schoolPackage;
        const category = schoolPackage?.categoryEquipment;
        const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
        const CategoryIcon = categoryConfig?.icon;
        const leaderStudentName = EventStatsGetters.getLeaderStudentName(event);
        const studentNames = EventStatsGetters.getStudentNames(event);

        const lesson = event.relations?.lesson;
        const teacher = lesson?.teacher;
        const TeacherIcon = teacherEntity.icon;

        return (
            <RowStr
                label={
                    <div className="flex items-center gap-2">
                        {teacher && (
                            <>
                                <div style={{ color: teacherEntity.color }}>
                                    <TeacherIcon className="w-4 h-4" />
                                </div>
                                <span>{teacher.username}</span>
                            </>
                        )}
                        <div style={{ color: studentEntity.color }}>
                            <HelmetIcon className="w-4 h-4" />
                        </div>
                        <span>{leaderStudentName}</span>
                        {capacity > 1 && <span className="text-muted-foreground">+{capacity - 1}</span>}
                    </div>
                }
                items={[
                    {
                        label: "Students",
                        value: (
                            <div className="flex flex-col text-xs">
                                {studentNames.length > 0 ? (
                                    studentNames.map((name, index) => <span key={index}>{name}</span>)
                                ) : (
                                    <span>No students</span>
                                )}
                            </div>
                        ),
                    },
                    { label: "Date", value: formatDate(event.schema.date) },
                    { label: "Duration", value: getPrettyDuration(event.schema.duration || 0) },
                    {
                        label: "Package",
                        value: (
                            <div className="flex items-center gap-1 text-xs">
                                {CategoryIcon && <CategoryIcon className="w-3 h-3" style={{ color: categoryConfig?.color }} />}
                                <span>{packageDesc}</span>
                            </div>
                        ),
                    },
                ]}
                entityColor={eventEntity.bgColor}
            />
        );
    },
    renderAction: (event) => <EventAction event={event} />,
    renderStats: (event) => DataboardEventStats.getStats(event),
    renderColor: (event) => {
        const schoolPackage = event.relations.lesson?.booking?.studentPackage?.schoolPackage;
        const category = schoolPackage?.categoryEquipment;
        const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event");
        return categoryConfig?.color || eventEntity?.color || "#06b6d4";
    },
};

interface EventRowProps {
    item: EventModel;
}

export const EventRow = ({ item: event }: EventRowProps) => {
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const EventIconComponent = eventEntity.icon;
    const entityColor = eventEntity.color;
    const isActive = event.schema.status === "completed" || event.schema.status === "planned";
    const iconColor = isActive ? entityColor : "#9ca3af";

    const packageDesc = EventStatsGetters.getPackageDescription(event);
    const capacity = EventStatsGetters.getStudentCapacity(event);
    const schoolPackage = event.relations.lesson?.booking?.studentPackage?.schoolPackage;
    const category = schoolPackage?.categoryEquipment;
    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
    const CategoryIcon = categoryConfig?.icon;
    const leaderStudentName = EventStatsGetters.getLeaderStudentName(event);
    const studentNames = EventStatsGetters.getStudentNames(event);

    const strItems = [
        {
            label: "Students",
			value: (
				<div className="flex flex-col">
					{studentNames.length > 0 ? (
						studentNames.map((name, index) => <span key={index}>{name}</span>)
					) : (
						<span>No students</span>
					)}
				</div>
			),
        },
        { label: "Date", value: formatDate(event.schema.date) },
        { label: "Duration", value: getPrettyDuration(event.schema.duration || 0) },
        { label: "Location", value: event.schema.location || "TBD" },
        {
            label: "Package",
            value: (
                <div className="flex items-center gap-1">
                    {CategoryIcon && <CategoryIcon className="w-4 h-4" style={{ color: categoryConfig?.color }} />}
                    <span>{packageDesc}</span>
                </div>
            ),
        },
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
            isActive={isActive}
            head={{
                avatar: (
                    <div className="group" style={{ color: iconColor }}>
                        {CategoryIcon ? <CategoryIcon className="w-10 h-10 transition-colors duration-200 group-hover:!text-current" style={{ color: categoryConfig?.color }} /> : <EventIconComponent className="w-10 h-10" />}
                    </div>
                ),
                name: (
                    <div className="flex items-baseline gap-2">
                        <HoverToEntity entity={eventEntity} id={event.schema.id}>
                            <span className="text-lg font-bold">{formatEventTime(event.schema.date)}</span>
                        </HoverToEntity>
                        <span className="text-muted-foreground text-sm">
                            {new Date(event.schema.date).getDate()}-{new Date(event.schema.date).toLocaleString("en-US", { month: "short" })}
                        </span>
                    </div>
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
                                <span>{teacher.username}</span>
                            </>
                        )}
                        <div style={{ color: studentEntity.color }}>
                            <HelmetIcon className="w-4 h-4" />
                        </div>
                        <span>{leaderStudentName}</span>
                        {capacity > 1 && <span className="text-muted-foreground">+{capacity - 1}</span>}
                    </div>
                ),
                items: strItems,
            }}
            action={<EventAction event={event} />}
            stats={stats}
        />
    );
};
