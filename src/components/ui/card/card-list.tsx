interface CardListProps {
    fields: Array<{
        label: string;
        value: string | number;
    }>;
}

export const CardList = ({ fields }: CardListProps) => {
    return (
        <div className="space-y-3">
            {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-xs uppercase tracking-wider text-white/60">{field.label}</span>
                    <span className="text-sm font-medium">{field.value}</span>
                </div>
            ))}
        </div>
    );
};
