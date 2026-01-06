import Link from "next/link";

interface BrandSizeCategoryBadgeProps {
    id: string;
    model: string;
    size: number | null;
    className?: string;
}

export function BrandSizeCategoryBadge({ id, model, size, className = "" }: BrandSizeCategoryBadgeProps) {
    return (
        <Link href={`/equipments/${id}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer ${className}`}>
                <span className="text-purple-700 dark:text-purple-300 font-bold text-[10px] uppercase truncate max-w-[80px]">
                    {model}
                </span>
                {size && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1 rounded font-black text-[9px]">
                        {size}
                    </span>
                )}
            </div>
        </Link>
    );
}

export function BrandSizeCategoryList({ equipments, emptyLabel = "N/A", className = "" }: { equipments?: { id: string; model: string; size: number | null }[], emptyLabel?: string, className?: string }) {
    if (!equipments || equipments.length === 0) {
        return <span className="text-zinc-400 text-[10px] font-bold">{emptyLabel}</span>;
    }

    return (
        <div className={`flex flex-col gap-0.5 ${className}`}>
            {equipments.map((eq, i) => (
                <BrandSizeCategoryBadge key={i} id={eq.id} model={eq.model} size={eq.size} />
            ))}
        </div>
    );
}

export function BrandSizeCategoryListHorizontal({ equipments, className = "" }: { equipments?: { id: string; model: string; size: number | null }[], className?: string }) {
    if (!equipments || equipments.length === 0) return null;

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {equipments.map((eq, i) => (
                <Link key={i} href={`/equipments/${eq.id}`} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer">
                        <span className="text-purple-700 dark:text-purple-300 font-bold text-[9px] uppercase">
                            {eq.model}
                        </span>
                        {eq.size && (
                            <span className="text-purple-600 dark:text-purple-400 font-black text-[9px]">
                                {eq.size}
                            </span>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}
