interface SectionProps {
    id: string;
    title: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    entityIcon?: React.ComponentType<any>;
    entityColor?: string;
    alwaysExpanded?: boolean;
}

export function Section({ id, title, isExpanded, onToggle, children, entityIcon: EntityIcon, entityColor, alwaysExpanded = false }: SectionProps) {
    const handleClick = () => {
        if (!alwaysExpanded) {
            onToggle();
        }
    };

    return (
        <div id={id} className="scroll-mt-4">
            <div
                className={`rounded-lg bg-card border border-border transition-all duration-200 ${
                    alwaysExpanded 
                        ? "" 
                        : "hover:border-primary/50 hover:shadow-md"
                }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 ${
                        alwaysExpanded 
                            ? "cursor-default" 
                            : "cursor-pointer active:bg-muted touch-manipulation"
                    }`}
                    onClick={handleClick}
                >
                    <div className="flex items-center gap-3">
                        {EntityIcon && (
                            <div
                                className="w-8 h-8 flex items-center justify-center"
                                style={{ color: entityColor }}
                            >
                                <EntityIcon className="w-8 h-8" />
                            </div>
                        )}
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    </div>
                    {!alwaysExpanded && (
                        <span className="text-xl font-bold text-primary min-w-[24px] h-8 flex items-center justify-center">
                            {isExpanded ? "−" : "+"}
                        </span>
                    )}
                </div>
                
                {/* Content */}
                {(isExpanded || alwaysExpanded) && (
                    <div className="px-4 pb-4">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
