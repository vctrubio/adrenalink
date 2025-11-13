interface SchoolHeaderProps {
    school: {
        name: string;
        username: string;
    };
}

export function SchoolHeader({ school }: SchoolHeaderProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">{getInitials(school.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{school.name}</div>
                <div className="text-sm text-muted-foreground">@{school.username}</div>
            </div>
        </div>
    );
}
