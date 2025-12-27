"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { LessonTag } from "@/src/components/tags";
import { TeacherEventEquipmentPopover } from "@/src/components/popover/TeacherEventEquipmentPopover";
import { TeacherStats as DataboardTeacherStats } from "@/src/components/databoard/stats";
import { TEACHER_STATUS_CONFIG, type TeacherStatus } from "@/types/status";
import { updateTeacherActive } from "@/actions/teachers-action";
import { getFullDuration } from "@/getters/duration-getter";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { TeacherModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";
import IdIcon from "@/public/appSvgs/IdIcon";
import type { TableRenderers } from "../DataboardTableSection";
import { RowHead } from "@/src/components/ui/row/row-head";
import { RowStr } from "@/src/components/ui/row/row-str";

export const calculateTeacherGroupStats = DataboardTeacherStats.getStats;

const TeacherAction = ({ teacher }: { teacher: TeacherModel }) => {
    const lessons = teacher.relations?.lessons || [];
    const DefaultEquipmentIcon = EQUIPMENT_CATEGORIES[0].icon;

    return (
        <div className="flex flex-wrap gap-2">
            {lessons.map((lesson) => {
                const events = lesson.events || [];
                const totalMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);
                const duration = getFullDuration(totalMinutes);

                const categoryEquipment = lesson.booking?.studentPackage?.schoolPackage?.categoryEquipment;
                                                        const equipmentCategory = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
                                                        const EquipmentIcon = equipmentCategory?.icon || DefaultEquipmentIcon;
                                        
                                                                                        return (
                                        
                                                                                            <LessonTag 
                                        
                                                                                                key={lesson.id} 
                                        
                                                                                                icon={<EquipmentIcon className="w-4 h-4" />} 
                                        
                                                                                                createdAt={lesson.createdAt} 
                                        
                                                                                                status={lesson.status} 
                                        
                                                                                                duration={duration} 
                                        
                                                                                                eventCount={events.length} 
                                        
                                                                                                link={`/bookings/${lesson.bookingId}`}
                                        
                                                                                                studentName={(lesson as any).booking?.leaderStudentName}
                                        
                                                                                                capacity={(lesson as any).booking?.studentPackage?.schoolPackage?.capacityStudents}
                                        
                                                                                            />
                                        
                                                                                        );                                    })}        </div>
    );
};

function validateActivity(fromStatus: TeacherStatus, toStatus: TeacherStatus): boolean {
    return true;
}

export const teacherRenderers: TableRenderers<TeacherModel> = {
    renderEntity: (teacher) => {
        const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
        const TeacherIcon = teacherEntity.icon;

        const currentStatus = teacher.schema.active ? "active" : "inactive";
        const currentStatusConfig = TEACHER_STATUS_CONFIG[currentStatus];

        const statusDropdownItems: DropdownItemProps[] = (["active", "inactive"] as const).map((status) => ({
            id: status,
            label: TEACHER_STATUS_CONFIG[status].label,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEACHER_STATUS_CONFIG[status].color }} />,
            color: TEACHER_STATUS_CONFIG[status].color,
            onClick: async () => {
                if (validateActivity(currentStatus, status)) {
                    await updateTeacherActive(teacher.schema.id, status === "active");
                }
            },
        }));

        return (
            <RowHead
                avatar={
                    <div style={{ color: teacherEntity.color }}>
                        <TeacherIcon className="w-8 h-8" />
                    </div>
                }
                name={
                    <HoverToEntity entity={teacherEntity} id={teacher.schema.id}>
                        {`${teacher.schema.firstName} ${teacher.schema.lastName}`}
                    </HoverToEntity>
                }
                status={currentStatusConfig.label}
                dropdownItems={statusDropdownItems}
                statusColor={currentStatusConfig.color}
            />
        );
    },
    renderStr: (teacher) => {
        const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
        return (
            <RowStr
                label={
                    <div className="flex items-center gap-2">
                        <IdIcon size={16} />
                        <span className="text-xs">{teacher.schema.username}</span>
                    </div>
                }
                items={[
                    { label: "Phone", value: teacher.schema.phone },
                    { label: "Passport", value: teacher.schema.passport },
                    { label: "Country", value: teacher.schema.country },
                    { label: "Languages", value: teacher.schema.languages.join(", ") },
                ]}
                entityColor={teacherEntity.bgColor}
            />
        );
    },
    renderAction: (teacher) => <TeacherAction teacher={teacher} />,
    renderStats: (teacher) => DataboardTeacherStats.getStats(teacher, false),
};

interface TeacherRowProps {
    item: TeacherModel;
}

export const TeacherRow = ({ item: teacher }: TeacherRowProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    const TeacherIcon = teacherEntity.icon;
    const entityColor = teacherEntity.color;
    const isActive = teacher.schema.active;
    const iconColor = isActive ? entityColor : "#9ca3af";

    const currentStatus = teacher.schema.active ? "active" : "inactive";
    const currentStatusConfig = TEACHER_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (["active", "inactive"] as const).map((status) => ({
        id: status,
        label: TEACHER_STATUS_CONFIG[status].label,
        icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEACHER_STATUS_CONFIG[status].color }} />,
        color: TEACHER_STATUS_CONFIG[status].color,
        onClick: async () => {
            if (validateActivity(currentStatus, status)) {
                await updateTeacherActive(teacher.schema.id, status === "active");
            }
        },
    }));

    const totalMinutes = teacher.stats?.total_duration_minutes || 0;
    const durationColor = "#4b5563";

    const strItems = [
        { label: "Phone", value: teacher.schema.phone },
        { label: "Passport", value: teacher.schema.passport },
        { label: "Country", value: teacher.schema.country },
        { label: "Languages", value: teacher.schema.languages.join(", ") },
    ];

    const stats = DataboardTeacherStats.getStats(teacher, false);

    return (
        <Row
            id={teacher.schema.id}
            entityData={teacher.schema}
            entityBgColor={teacherEntity.bgColor}
            entityColor={teacherEntity.color}
            isActive={isActive}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <TeacherIcon className="w-10 h-10" />
                    </div>
                ),
                name: (
                    <HoverToEntity entity={teacherEntity} id={teacher.schema.id}>
                        {`${teacher.schema.firstName} ${teacher.schema.lastName}`}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: (
                    <div className="flex items-center gap-2">
                        <IdIcon size={20} />
                        <span>{teacher.schema.username}</span>
                    </div>
                ),
                items: strItems,
            }}
            action={<TeacherAction teacher={teacher} />}
            popover={<TeacherEventEquipmentPopover teacher={teacher} />}
            stats={stats}
        />
    );
};
