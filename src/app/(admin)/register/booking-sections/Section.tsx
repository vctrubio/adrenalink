"use client";

export interface SectionState {
    isSelected?: boolean;
    isLast?: boolean;
    previousSectionSelected?: boolean;
}

export interface SectionConfig {
    // Core props
    id: string;
    title: React.ReactNode;
    isExpanded: boolean;
    children: React.ReactNode;
    
    // Visual props
    entityIcon?: React.ComponentType<{ className?: string }>;
    entityColor?: string;
    state?: SectionState;
    className?: string; // Additional className for the section container
    
    // Behavior props
    optional?: boolean;
    hasSelection?: boolean;
    
    // Action handlers
    onToggle?: () => void;
    onClear?: () => void;
    onOptional?: () => void;
    onExpand?: () => void; // Called when section should be opened (e.g. on Clear)
    showAddButton?: boolean;
    onAddClick?: () => void;
    headerActions?: React.ReactNode; // Custom header actions/content
}

export function Section(config: SectionConfig) {
    const {
        id,
        title,
        isExpanded,
        children,
        entityIcon: EntityIcon,
        entityColor,
        state = {},
        className = "",
        optional = false,
        hasSelection = false,
        onToggle,
        onClear,
        onOptional,
        onExpand,
        showAddButton = false,
        onAddClick,
        headerActions,
    } = config;

    // Booking sections should not be manually collapsible via the header,
    // but they *are* programmatically collapsible via `isExpanded` (e.g. on select).
    void onToggle;

    // Extract state properties
    const {
        isSelected = false,
        isLast = false,
        previousSectionSelected = false,
    } = state;

    // When selected, add bottom separator (like card-list)
    const shouldShowSeparator = isSelected && !isLast;
    // Remove top border/separator if previous section is also selected (they should be combined)
    const shouldHideTopBorder = previousSectionSelected && isSelected;

    // Handle clear: clear the selection AND expand the section
    const handleClear = () => {
        onClear?.();
        onExpand?.(); // Open section when cleared
    };

    return (
        <div 
            id={id} 
            className={`scroll-mt-4 ${shouldShowSeparator ? "mb-6 pb-6 border-b border-border/50" : ""} ${shouldHideTopBorder ? "-mt-6" : ""}`}
        >
            <div className={className}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 cursor-default">
                    <div className="flex items-center gap-3">
                        {EntityIcon && (
                            <div className="w-8 h-8 flex items-center justify-center" style={{ color: entityColor }}>
                                <EntityIcon className="w-8 h-8" />
                            </div>
                        )}
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {headerActions}
                        {showAddButton && onAddClick && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddClick();
                                }}
                                className="px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted/80 text-foreground transition-colors"
                                style={{ color: entityColor }}
                            >
                                + Add
                            </button>
                        )}
                        {optional ? (
                            <>
                                {hasSelection && onClear && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear();
                                        }}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                                {!hasSelection && onOptional && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOptional();
                                        }}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                    >
                                        Not Now
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {onClear && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClear();
                                        }}
                                        disabled={!hasSelection}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted"
                                    >
                                        Clear
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isExpanded && (
                    <div className="px-4 pb-4">{children}</div>
                )}
            </div>
        </div>
    );
}
