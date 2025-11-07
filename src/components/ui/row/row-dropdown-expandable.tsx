interface RowDropdownExpandableProps {
    entityData: any;
    isExpanded: boolean;
}

export const RowDropdownExpandable = ({ entityData, isExpanded }: RowDropdownExpandableProps) => {
    if (!isExpanded) return null;

    return (
        <div className="p-6 border-t border-border bg-background">
            <pre className="text-xs text-muted-foreground font-mono overflow-auto">
                {JSON.stringify(entityData, null, 2)}
            </pre>
        </div>
    );
};
