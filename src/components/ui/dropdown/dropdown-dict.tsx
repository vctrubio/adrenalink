export interface DropdownDictItemProps {
    id?: string;
    label: string;
    value: string | number;
    color?: string;
}

export function DropdownDictItem({ item, onClose }: { item: DropdownDictItemProps; onClose?: () => void }) {
    const handleClick = () => {
        onClose?.();
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (item.color) {
            e.currentTarget.style.backgroundColor = `${item.color}15`;
        } else {
            e.currentTarget.style.backgroundColor = "rgb(var(--accent) / 0.5)";
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = "transparent";
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center justify-between w-full px-3 py-2.5 text-left transition-colors cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center gap-2">
                {item.color && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />}
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{item.value}</span>
        </button>
    );
}
