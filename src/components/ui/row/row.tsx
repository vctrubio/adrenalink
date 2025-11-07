import { ReactNode } from "react";
import { RowHead } from "./row-head";
import { RowStr } from "./row-str";
import { RowAction } from "./row-action";
import { RowDropdownExpandable } from "./row-dropdown-expandable";
import { RowStats, type StatItem } from "./row-stats";

interface RowProps {
    id: string;
    entityData: any;
    entityBgColor: string;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    head: {
        avatar: ReactNode;
        name: string;
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

export const Row = ({ id, entityData, entityBgColor, isExpanded, onToggle, head, str, action, popover, stats }: RowProps) => {
    return (
        <div className="bg-card overflow-hidden">
            <div className="px-4 py-6 hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => onToggle(id)}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                    {/* Mobile/Tablet: Head and Stats Row, Desktop: Part of single row */}
                    <div className="flex items-center justify-between gap-4 lg:contents">
                        <div className="flex-shrink-0">
                            <RowHead avatar={head.avatar} name={head.name} status={head.status} />
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 lg:ml-auto lg:order-last">
                            {popover && <div className="flex-shrink-0">{popover}</div>}
                            {stats && (
                                <div className="flex-shrink-0">
                                    <RowStats stats={stats} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile: Stack Str and Action, Tablet: Side by side, Desktop: Part of single row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:contents">
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
                </div>
            </div>

            <RowDropdownExpandable entityData={entityData} isExpanded={isExpanded} />
        </div>
    );
};
