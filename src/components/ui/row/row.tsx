import { ReactNode, useRef } from "react";
import { RowHead } from "./row-head";
import { RowStr } from "./row-str";
import { RowAction } from "./row-action";

import { RowStats, type StatItem } from "./row-stats";
import type { DropdownItemProps } from "../dropdown";

interface RowProps {
    id: string;
    entityData: any;
    entityBgColor: string;
    entityColor?: string;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    head: {
        avatar: ReactNode;
        name: string | ReactNode;
        status: string;
        dropdownItems?: DropdownItemProps[];
        statusColor?: string;
        statusDisabled?: boolean;
    };
    str?: {
        label: string | ReactNode;
        color?: string;
        items: {
            label: string;
            value: string | number;
        }[];
    };
    action?: ReactNode;
    popover?: ReactNode;
    rightAction?: ReactNode;
    stats?: StatItem[];
    expandedContent?: ReactNode;
}

export const Row = ({ id, entityData, entityBgColor, entityColor, isExpanded, onToggle, head, str, action, popover, rightAction, stats, expandedContent }: RowProps) => {
    const rowRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (!isExpanded && rowRef.current) {
            const avatarDiv = rowRef.current.querySelector(".avatar-wrapper > div") as HTMLElement;
            if (avatarDiv) {
                avatarDiv.style.color = entityColor || entityBgColor;
            }
        }
    };

    const handleMouseLeave = () => {
        if (!isExpanded && rowRef.current) {
            const avatarDiv = rowRef.current.querySelector(".avatar-wrapper > div") as HTMLElement;
            if (avatarDiv) {
                avatarDiv.style.color = "#9ca3af";
            }
        }
    };

    return (
        <div className="bg-card overflow-visible">
            <div ref={rowRef} className="px-4 py-6 hover:bg-accent/20 transition-colors cursor-pointer relative" onClick={() => onToggle(id)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                    {/* Head */}
                    <div className="flex-shrink-0">
                        <RowHead avatar={head.avatar} name={head.name} status={head.status} dropdownItems={head.dropdownItems} statusColor={head.statusColor} statusDisabled={head.statusDisabled} />
                    </div>

                    {/* Str and Action */}
                    {(str || action) && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:flex-row">
                            {str && (
                                <div className="flex-shrink-0">
                                    <RowStr label={str.label} items={str.items} entityColor={str.color || entityBgColor} />
                                </div>
                            )}

                            {action && (
                                <div className="flex-shrink-0">
                                    <RowAction>{action}</RowAction>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats, Popover, and Right Action - always on the right */}
                    {(stats || popover || rightAction) && (
                        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
                            {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
                            {popover && <div className="flex-shrink-0">{popover}</div>}
                            {stats && (
                                <div className="flex-shrink-0">
                                    <RowStats stats={stats} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && expandedContent && (
                <div className="bg-accent/20">
                    {expandedContent}
                </div>
            )}
        </div>
    );
};
