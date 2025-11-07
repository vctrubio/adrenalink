interface RowDropdownExpandableProps {
    entityName: string;
    isExpanded: boolean;
}

export const RowDropdownExpandable = ({ entityName, isExpanded }: RowDropdownExpandableProps) => {
    if (!isExpanded) return null;

    return (
        <div className="p-6 border-t border-border bg-background">
            <pre className="text-xs text-muted-foreground font-mono overflow-auto">
                {JSON.stringify({ entityName }, null, 2)}
            </pre>
        </div>
    );
};
