interface RowDropdownExpandableProps {
    entityName: string;
    isExpanded: boolean;
}

export const RowDropdownExpandable = ({ entityName, isExpanded }: RowDropdownExpandableProps) => {
    if (!isExpanded) return null;

    return (
        <div className="p-6 border-t border-border bg-background">
            <p className="text-sm text-muted-foreground">Hello world, this is a dropdown component for {entityName}.</p>
        </div>
    );
};
