import { getStat, type StatType } from "@/backend/RenderStats";
import type { StatItem } from "@/src/components/ui/row";

export function createStat(
    type: StatType,
    value: number | string,
    label?: string
): StatItem | null {
    return getStat(type, value, label);
}
