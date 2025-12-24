interface CardListProps {
    fields: {
        label: string;
        value: string | number | React.ReactNode;
    }[];
}

export const CardList = ({ fields }: CardListProps) => {
    return (
        <div className="space-y-3">
            {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-muted/20">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{field.label}</span>
                    <span className="text-sm font-medium text-foreground">{field.value}</span>
                </div>
            ))}
        </div>
    );
};
