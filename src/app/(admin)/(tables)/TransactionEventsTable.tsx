"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, TrendingUp, TrendingDown, Calendar, Clock, Handshake, Receipt, Activity, Plus, User, HelpCircle } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { getLeaderCapacity } from "@/getters/bookings-getter";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { MasterTable, type GroupingType, type ColumnDef, type MobileColumnDef, type GroupStats } from "./MasterTable";

import { filterTransactionEvents } from "@/types/searching-entities";
import { useTableLogic } from "@/src/hooks/useTableLogic";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";
import { useEquipment } from "@/src/hooks/useEquipment";
import { updateEventStatus } from "@/supabase/server/classboard";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { StatItemUI } from "@/backend/data/StatsData";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";

// --- Sub-component: Equipment Fulfillment Dropdown ---

function EquipmentFulfillmentCell({
    data,
    onUpdate,
}: {
    data: TransactionEventData;
    onUpdate: (eventId: string, equipment: any) => void;
}) {
    const categoryId = data.packageData.categoryEquipment;
    const { availableEquipment, fetchAvailable, assign } = useEquipment(categoryId);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
    const CategoryIcon = equipmentConfig?.icon || Activity;

    const handleAssign = async (equipment: any) => {
        const success = await assign(data.event.id, equipment.id);
        if (success) {
            // Only update event status if it's not already completed
            if (data.event.status !== "completed") {
                await updateEventStatus(data.event.id, "completed");
            }
            onUpdate(data.event.id, equipment);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen && availableEquipment.length > 0) {
            const firstEq = availableEquipment[0];
            console.log(`[TransactionTable] 🔍 Checking preferred gear for ${data.teacher.username} (${data.teacher.id})`, {
                gearRelations: firstEq.teacher_equipment?.map((te: any) => te.teacher_id),
            });
        }
    }, [isOpen, availableEquipment, data.teacher]);

    if (data.equipments && data.equipments.length > 0) {
        return <BrandSizeCategoryList equipments={data.equipments as any} />;
    }

    // Always allow equipment assignment if equipment is N/A (not assigned)
    // If event is not completed, we'll update status when assigning

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "header",
            label: (
                <div className="flex items-center gap-3 leading-none">
                    <span className="font-bold">{data.teacher.username}</span>
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                        <FlagIcon size={12} className="opacity-70" />
                        <span className="translate-y-[0.5px]">{data.event.date.split("T")[1].substring(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                        <DurationIcon size={12} className="opacity-70" />
                        <span className="translate-y-[0.5px]">{getHMDuration(data.event.duration)}</span>
                    </div>
                </div>
            ) as any,
            icon: HeadsetIcon,
            color: "#16a34a",
            disabled: true,
        },
        ...availableEquipment
            .sort((a, b) => {
                const aPreferred = a.teacher_equipment?.some((te: any) => te.teacher_id === data.teacher.id);
                const bPreferred = b.teacher_equipment?.some((te: any) => te.teacher_id === data.teacher.id);
                if (aPreferred && !bPreferred) return -1;
                if (!aPreferred && bPreferred) return 1;
                return 0;
            })
            .map((eq) => {
                const isPreferred = eq.teacher_equipment?.some((te: any) => te.teacher_id === data.teacher.id);
                return {
                    id: eq.id,
                    label: (
                        <div className={`inline-block ${isPreferred ? "border-b-[1.5px] border-primary/50" : ""}`}>
                            <span className="font-bold text-foreground/90">
                                {eq.brand} {eq.model}
                                {eq.size ? ` (${eq.size})` : ""}
                            </span>
                        </div>
                    ) as any,
                    description: `SKU: ${eq.sku}${eq.color ? ` • ${eq.color}` : ""}`,
                    icon: CategoryIcon,
                    color: "rgb(var(--muted-foreground))",
                    onClick: () => handleAssign(eq),
                };
            }),
    ];

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isOpen) fetchAvailable();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 text-muted-foreground transition-all group"
            >
                <Plus size={12} className="group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">N/A</span>
            </button>

            {isOpen && (
                <Dropdown
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    items={dropdownItems}
                    align="left"
                    triggerRef={triggerRef}
                />
            )}
        </div>
    );
}

// Header className groups for consistent styling across columns
const HEADER_CLASSES = {
    blue: "px-2 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-2 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    zincRight: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right",
    zincRightBold: "px-2 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right font-bold",
    purple: "px-2 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
} as const;

// --- Main component ---

export function TransactionEventsTable({
    events: initialEvents = [],
    groupBy,
    showYear = false,
}: {
    events: TransactionEventData[];
    groupBy?: GroupingType;
    showYear?: boolean;
}) {
    const [events, setEvents] = useState(initialEvents);
    const { sort } = useTablesController();

    // Sync state when props change
    useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    const {
        filteredRows: filteredEventsRaw,
        masterTableGroupBy,
        getGroupKey,
    } = useTableLogic({
        data: events,
        filterSearch: filterTransactionEvents,
        dateField: (row) => row.event.date,
    });

    // Apply sorting
    const filteredEvents = useMemo(() => {
        if (!sort.field) return filteredEventsRaw;

        const sorted = [...filteredEventsRaw].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sort.field === "date") {
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
            } else if (sort.field === "createdAt") {
                // Use event date as created date fallback
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
            } else if (sort.field === "updatedAt") {
                // Use event date as updated date fallback
                aValue = new Date(a.event.date).getTime();
                bValue = new Date(b.event.date).getTime();
            } else {
                return 0;
            }

            if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredEventsRaw, sort]);

    const handleEquipmentUpdate = (eventId: string, equipment: any) => {
        setEvents((prev) =>
            prev.map((row) => {
                if (row.event.id === eventId) {
                    return {
                        ...row,
                        event: { ...row.event, status: "completed" },
                        equipments: [...(row.equipments || []), equipment],
                    };
                }
                return row;
            }),
        );
    };

    const desktopColumns: ColumnDef<TransactionEventData>[] = [
        {
            header: "Date",
            headerClassName: `${HEADER_CLASSES.blue} text-center`,
            className: "w-[100px] text-center",
            render: (data) => {
                // Manually parse ISO string parts to avoid timezone shifts
                const [datePart] = data.event.date.split("T");
                const [year, month, day] = datePart.split("-");
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const formattedDate = showYear 
                    ? `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
                    : `${months[parseInt(month) - 1]} ${parseInt(day)}`;

                return (
                    <span className="text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-center block">
                        {formattedDate}
                    </span>
                );
            },
        },
        {
            header: "Time",
            headerClassName: HEADER_CLASSES.blue,
            className: "w-[50px]",
            render: (data) => {
                // Manually extract time from ISO: "2025-01-12T14:00:00Z" -> "14:00"
                const timeMatch = data.event.date.match(/T(\d{2}:\d{2})/);
                const formattedTime = timeMatch ? timeMatch[1] : "--:--";

                return (
                    <span className="text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] font-medium">
                        {formattedTime}
                    </span>
                );
            },
        },
        {
            header: "Dur",
            headerClassName: `${HEADER_CLASSES.blue} text-center`,
            className: "w-[60px] text-center",
            render: (data) => (
                <span className="text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-center block">
                    {getHMDuration(data.event.duration)}
                </span>
            ),
        },
        {
            header: "Location",
            headerClassName: HEADER_CLASSES.blue,
            className: "w-[100px]",
            render: (data) => (
                <span className="text-muted-foreground bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-xs">
                    {data.event.location || "-"}
                </span>
            ),
        },
        {
            header: "Teacher",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">
                    {data.teacher.username}
                </span>
            ),
        },
        {
            header: "Students",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <span className="bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">
                    {getLeaderCapacity(data.leaderStudentName, data.studentCount)}
                </span>
            ),
        },
        {
            header: "Package",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <span className="max-w-[150px] truncate text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-medium italic">
                    {data.packageData.description}
                </span>
            ),
        },
        {
            header: "PPH",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => {
                const pricePerHour =
                    data.packageData.durationMinutes / 60 > 0
                        ? data.packageData.pricePerStudent / (data.packageData.durationMinutes / 60)
                        : 0;
                return (
                    <span className="tabular-nums text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-bold">
                        {getCompactNumber(pricePerHour)} <span className="text-[10px] font-normal">{data.financials.currency}</span>
                    </span>
                );
            },
        },
        {
            header: "Cap.",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => {
                const EquipmentIcon = EQUIPMENT_CATEGORIES.find((c) => c.id === data.packageData.categoryEquipment)?.icon;
                return EquipmentIcon ? (
                    <EquipmentStudentCapacityBadge
                        categoryIcon={EquipmentIcon}
                        equipmentCapacity={data.packageData.capacityEquipment}
                        studentCapacity={data.packageData.capacityStudents}
                    />
                ) : null;
            },
        },
        {
            header: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => <EquipmentFulfillmentCell data={data} onUpdate={handleEquipmentUpdate} />,
        },
        {
            header: "Comm.",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <span className="tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">
                    {getCompactNumber(data.financials.teacherEarnings)}
                </span>
            ),
        },
        {
            header: "Rev.",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <span className="tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">
                    {getCompactNumber(data.financials.studentRevenue)}
                </span>
            ),
        },
        {
            header: "Profit",
            headerClassName: HEADER_CLASSES.zincRightBold,
            render: (data) => {
                const profit = data.financials.profit;
                const isPositive = profit >= 0;
                return (
                    <div className="flex items-center justify-end gap-1 bg-emerald-500/[0.02]">
                        {isPositive ? (
                            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
                        )}
                        <span
                            className={`text-right tabular-nums font-black ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                        >
                            {getCompactNumber(Math.abs(profit))}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Status",
            headerClassName: "px-4 py-3 font-medium text-center",
            render: (data) => {
                const statusConfig = EVENT_STATUS_CONFIG[data.event.status as EventStatus];
                return statusConfig ? (
                    <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
                        style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
                    >
                        {data.event.status === "completed" && <Check size={10} strokeWidth={4} />}
                        {statusConfig.label}
                    </div>
                ) : null;
            },
        },
    ];

    const mobileColumns: MobileColumnDef<TransactionEventData>[] = [
        {
            label: "Event",
            render: (data) => {
                const [datePart, timePartFull] = data.event.date.split("T");
                const [, month, day] = datePart.split("-");
                const timePart = timePartFull.substring(0, 5);

                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground/60">
                                {month}/{day}
                            </span>
                            <span className="text-sm font-black text-foreground">{timePart}</span>
                        </div>
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
                            +{getHMDuration(data.event.duration)}
                        </span>
                    </div>
                );
            },
        },
        {
            label: "Teacher",
            render: (data) => (
                <TeacherUsernameCommissionBadge
                    teacherIcon={HeadsetIcon}
                    teacherUsername={data.teacher.username}
                    teacherColor="#22c55e"
                    commissionValue={data.financials.commissionValue.toString()}
                    commissionType={data.financials.commissionType}
                    currency={data.financials.currency}
                    showCurrency={false}
                />
            ),
        },
        {
            label: "Package",
            render: (data) => (
                <div className="inline-flex scale-90 origin-center">
                    <EquipmentStudentPackagePriceBadge
                        categoryEquipment={data.packageData.categoryEquipment}
                        equipmentCapacity={data.packageData.capacityEquipment}
                        studentCapacity={data.packageData.capacityStudents}
                        packageDurationHours={data.packageData.durationMinutes / 60}
                        pricePerHour={data.packageData.pricePerStudent / (data.packageData.durationMinutes / 60)}
                    />
                </div>
            ),
        },
        {
            label: "Profit",
            render: (data) => {
                const statusConfig = EVENT_STATUS_CONFIG[data.event.status as EventStatus];
                return statusConfig ? (
                    <div
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tighter"
                        style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
                    >
                        {data.financials.profit >= 0 ? (
                            <TrendingUp size={12} strokeWidth={4} className="shrink-0" />
                        ) : (
                            <TrendingDown size={12} strokeWidth={4} className="shrink-0" />
                        )}
                        {getCompactNumber(Math.abs(data.financials.profit))}
                    </div>
                ) : null;
            },
        },
    ];

    const calculateStats = (groupRows: TransactionEventData[]) => {
        return groupRows.reduce(
            (acc, curr) => ({
                totalDuration: acc.totalDuration + curr.event.duration,
                eventCount: acc.eventCount + 1,
                completedCount: acc.completedCount + (curr.event.status === "completed" ? 1 : 0),
                studentCount: acc.studentCount + curr.studentCount,
                totalCommissions: acc.totalCommissions + curr.financials.teacherEarnings,
                totalRevenue: acc.totalRevenue + curr.financials.studentRevenue,
                totalProfit: acc.totalProfit + curr.financials.profit,
            }),
            {
                totalDuration: 0,
                eventCount: 0,
                completedCount: 0,
                studentCount: 0,
                totalCommissions: 0,
                totalRevenue: 0,
                totalProfit: 0,
            },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="students" value={stats.studentCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI
                type="events"
                value={hideLabel ? stats.eventCount : `${stats.completedCount}/${stats.eventCount}`}
                hideLabel={hideLabel}
                iconColor={false}
            />
            <StatItemUI type="duration" value={stats.totalDuration} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="commission" value={stats.totalCommissions} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="revenue" value={stats.totalRevenue} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI
                type={stats.totalProfit >= 0 ? "profit" : "loss"}
                value={Math.abs(stats.totalProfit)}
                hideLabel={hideLabel}
                variant="primary"
                iconColor={false}
            />
        </>
    );

    const renderGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} />
        </TableGroupHeader>
    );

    const renderMobileGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableMobileGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} hideLabel />
        </TableMobileGroupHeader>
    );

    return (
        <MasterTable
            rows={filteredEvents}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            groupBy={groupBy || masterTableGroupBy}
            showGroupToggle={false}
        />
    );
}
