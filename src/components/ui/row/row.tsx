import { ReactNode, useRef } from "react";
import { RowHead } from "./row-head";
import { RowStr } from "./row-str";
import { RowAction } from "./row-action";
import { RowDropdownExpandable } from "./row-dropdown-expandable";
import { RowStats, type StatItem } from "./row-stats";

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
    };
    str?: {
        label: string;
        items: Array<{
            label: string;
            value: string | number;
        }>;
    };
    action?: ReactNode;
    popover?: ReactNode;
    stats?: StatItem[];
}

export const Row = ({ id, entityData, entityBgColor, entityColor, isExpanded, onToggle, head, str, action, popover, stats }: RowProps) => {
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
        <div className="bg-card overflow-hidden">
            <div 
                ref={rowRef}
                className="px-4 py-6 hover:bg-accent/20 transition-colors cursor-pointer" 
                onClick={() => onToggle(id)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                    {/* Head */}
                    <div className="flex-shrink-0">
                        <RowHead
                            avatar={head.avatar}
                            name={head.name}
                            status={head.status}
                            entityBgColor={entityBgColor}
                            isExpanded={isExpanded}
                        />
                    </div>

                    {/* Str and Action */}
                    {(str || action) && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:flex-row">
                            {str && (
                                <div className="flex-shrink-0">
                                    <RowStr label={str.label} items={str.items} entityColor={entityBgColor} />
                                </div>
                            )}

                            {action && (
                                <div className="flex-shrink-0">
                                    <RowAction>{action}</RowAction>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats and Popover - always on the right */}
                    {(stats || popover) && (
                        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
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

            <RowDropdownExpandable entityData={entityData} isExpanded={isExpanded} />
        </div>
    );
};
