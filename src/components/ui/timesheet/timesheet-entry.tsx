"use client";

type TimesheetEntryProps = {
    number: number;
    title: string;
    subtitle: string;
    tagLabel: string;
    tagColor: string;
    isSelected?: boolean;
    onSelect?: () => void;
};

// Sub-component: Entry Info (number, title, subtitle)
function EntryInfo({ number, title, subtitle }: { number: number; title: string; subtitle: string }) {
    return (
        <>
            <div className="w-6 text-sm text-white/60">{number}</div>
            <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold">{title}</h3>
                <div className="text-xs uppercase tracking-wider text-white/60">{subtitle}</div>
            </div>
        </>
    );
}

// Sub-component: Tag Badge
function EntryTag({ label, color }: { label: string; color: string }) {
    return (
        <div
            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            style={{
                backgroundColor: `${color}20`,
                color: color,
            }}
        >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
        </div>
    );
}

// Sub-component: Actions (go to project, continue)
function EntryActions() {
    const handleGoToProject = () => {
        console.log("Go to project clicked");
    };

    const handleContinue = () => {
        console.log("Continue clicked");
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleGoToProject();
                }}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/5 transition-colors"
            >
                Go To Project
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleContinue();
                }}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-400 transition-colors"
            >
                Continue
            </button>
        </>
    );
}

// Parent component: Only renders, logic in sub-components
export function TimesheetEntry({ number, title, subtitle, tagLabel, tagColor, isSelected = false, onSelect }: TimesheetEntryProps) {
    return (
        <div
            onClick={onSelect}
            className={`flex items-center gap-4 py-4 transition-all cursor-pointer ${isSelected ? "bg-white/10 px-[calc(1.5rem-4px)]" : "hover:bg-white/5 px-6"}`}
            style={{
                ...(isSelected && {
                    borderLeft: `4px solid ${tagColor}`,
                }),
            }}
        >
            <EntryInfo number={number} title={title} subtitle={subtitle} />
            <EntryTag label={tagLabel} color={tagColor} />
            <EntryActions />
        </div>
    );
}
