interface CardListProps {
    fields: {
        label: string | React.ReactNode;
        value: string | number | React.ReactNode;
    }[];
}

export const CardList = ({ fields }: CardListProps) => {
    return (
        <div className="space-y-2.5">
            {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between py-1.5">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{field.label}</span>
                    <span className="text-sm font-medium text-foreground">{field.value}</span>
                </div>
            ))}
        </div>
    );
};
