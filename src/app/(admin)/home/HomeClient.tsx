"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import type { HomeEntity } from "@/supabase/server/home";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import { ExpandCollapseIcon } from "@/src/components/ui/ExpandCollapseIcon";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";

interface HomeClientProps {
    entities: HomeEntity[];
}

type EntityWithIcon = HomeEntity & { Icon: ComponentType<{ className?: string }> };

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.25, ease: [0.16, 0.84, 0.44, 1] },
    }),
};

function EntityHeader({
    entity,
    view,
    onToggleView,
    expanded,
}: {
    entity: EntityWithIcon;
    view: "active" | "inactive";
    onToggleView: (next: "active" | "inactive") => void;
    expanded: boolean;
}) {
    return (
        <>
            <Link
                href={entity.link}
                className="flex items-center gap-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ color: entity.color }}
                >
                    <span className="text-current">
                        <entity.Icon className="w-6 h-6" />
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-foreground">{entity.name}</span>
                </div>
            </Link>
            <div className="ml-auto flex items-center gap-3">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <ToggleSwitch
                        value={view}
                        onChange={(next) => onToggleView(next as "active" | "inactive")}
                        values={{ left: "active", right: "inactive" }}
                        counts={{ active: entity.active.length, inactive: entity.inactive.length }}
                        tintColor={entity.color}
                    />
                </div>
                <div className="min-w-[24px] h-8 flex items-center justify-center text-primary">
                    <ExpandCollapseIcon isExpanded={expanded} className="w-5 h-5" />
                </div>
            </div>
        </>
    );
}

export function HomeClient({ entities }: HomeClientProps) {
    const router = useRouter();
    const credentials = useSchoolCredentials();
    const [viewMap, setViewMap] = useState<Record<string, "active" | "inactive">>({});
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    const withIcons = useMemo(
        () =>
            entities
                .map((entity) => {
                    const meta = ENTITY_DATA.find((e) => e.id === entity.id);
                    if (!meta) return null;
                    return { ...entity, Icon: meta.icon };
                })
                .filter((entity): entity is EntityWithIcon => Boolean(entity)),
        [entities]
    );

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {withIcons.map((entity, i) => {
                    const view = viewMap[entity.id] || "active";
                    const rows = view === "active" ? entity.active : entity.inactive;
                    const total = rows.length;
                    const isExpanded = expandedMap[entity.id] ?? true;

                    return (
                        <motion.div
                            key={entity.id}
                            className="rounded-lg bg-card border border-border"
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            custom={i}
                        >
                            <div
                                role="button"
                                tabIndex={0}
                                className="w-full flex items-center gap-3 p-4 border-b border-border text-left hover:bg-accent/10 transition-colors focus:outline-none"
                                onClick={() =>
                                    setExpandedMap((prev) => ({ ...prev, [entity.id]: !(prev[entity.id] ?? true) }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setExpandedMap((prev) => ({ ...prev, [entity.id]: !(prev[entity.id] ?? true) }));
                                    }
                                }}
                            >
                                <EntityHeader
                                    entity={entity}
                                    view={view}
                                    expanded={isExpanded}
                                    onToggleView={(next) =>
                                        setViewMap((prev) => ({ ...prev, [entity.id]: next as "active" | "inactive" }))
                                    }
                                />
                            </div>

                            {isExpanded && (
                                <div className="divide-y divide-border">
                                    {total === 0 ? (
                                        <div className="p-4 text-sm text-muted-foreground">No {view} items</div>
                                    ) : (
                                        rows.map((row, idx) => (
                                            <motion.button
                                                key={row.id}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/20 transition-colors"
                                                initial="hidden"
                                                animate="show"
                                                variants={itemVariants}
                                                custom={idx * 0.5}
                                                onClick={() => router.push(`${entity.link}/${row.id}`)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground">{row.label}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {row.id}</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground hover:text-accent">Open</span>
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
