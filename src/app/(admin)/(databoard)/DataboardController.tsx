"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { DataHeader } from "@/src/components/databoard/DataHeader";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardController as DataboardControllerType } from "@/types/databoard";

const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];
const FILTER_OPTIONS: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days"];
const GROUP_OPTIONS: DataboardGroupByDate[] = ["All", "Daily", "Weekly", "Monthly"];

interface DataboardControllerProps {
    controller: DataboardControllerType;
    isMobile?: boolean;
}

export default function DataboardController({ controller, isMobile = false }: DataboardControllerProps) {
    const pathname = usePathname();

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));

    // Find active entity based on pathname
    const activeEntity = databoardEntities.find((entity) => {
        const entityLink = entity.link;
        return pathname.startsWith(entityLink);
    });

    if (!activeEntity) return null;

    const Icon = activeEntity.icon;
    const activeCount = controller.counts[activeEntity.id] || 0;

    return (
        <div className="space-y-6">
            <DataHeader
                icon={<Icon />}
                color={activeEntity.color}
                title={activeEntity.name}
                subtitle={`${activeCount} Active`}
            />

                {/* Filter */}
                <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Filter</div>
                    <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.map((option) => {
                            const isActive = controller.filter === option;
                            return (
                                <button
                                    key={option}
                                    onClick={() => controller.onFilterChange(option)}
                                    style={{
                                        borderColor: isActive ? activeEntity.color : undefined,
                                        backgroundColor: isActive ? `${activeEntity.color}20` : undefined,
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? "border" : "border border-transparent hover:bg-muted/50"}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Group By */}
                <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Group By</div>
                    <div className="flex flex-wrap gap-2">
                        {GROUP_OPTIONS.map((option) => {
                            const isActive = controller.group === option;
                            return (
                                <button
                                    key={option}
                                    onClick={() => controller.onGroupChange(option)}
                                    style={{
                                        borderColor: isActive ? activeEntity.color : undefined,
                                        backgroundColor: isActive ? `${activeEntity.color}20` : undefined,
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isActive ? "border" : "border border-transparent hover:bg-muted/50"}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Add Button */}
                <button onClick={controller.onAddClick} style={{ borderColor: activeEntity.color }} className="w-full px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted/50 transition-colors">
                    Add {activeEntity.name}
                </button>

                {/* All Entities Navigation */}
                <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Navigate To</div>
                {databoardEntities.map((entity) => {
                    const EntityIcon = entity.icon;
                    const isActive = entity.id === activeEntity.id;
                    return (
                        <Link key={entity.id} href={entity.link} className={`flex items-center justify-between p-3 rounded-lg border border-transparent transition-all ${isActive ? "bg-muted" : "hover:bg-muted"}`}>
                            <div className="flex items-center gap-3">
                                <EntityIcon className="w-5 h-5" style={{ color: entity.color }} />
                                <span className="text-sm font-medium">{entity.name}</span>
                            </div>
                            {controller.counts[entity.id] !== undefined && <span className="text-xs text-muted-foreground">{controller.counts[entity.id]}</span>}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
