interface DateSinceBadgeProps {
    date: Date;
}

export function DateSinceBadge({ date }: DateSinceBadgeProps) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let label: string;
    let colorClass: string;

    if (diffDays === 0) {
        label = "Today";
        colorClass = "bg-green-500/20 text-green-600 dark:text-green-400";
    } else if (diffDays === 1) {
        label = "Tomorrow";
        colorClass = "bg-blue-500/20 text-blue-600 dark:text-blue-400";
    } else if (diffDays === -1) {
        label = "Yesterday";
        colorClass = "bg-muted text-muted-foreground";
    } else if (diffDays > 1) {
        label = `in ${diffDays}d`;
        colorClass = "bg-blue-500/20 text-blue-600 dark:text-blue-400";
    } else {
        label = `${Math.abs(diffDays)}d ago`;
        colorClass = "bg-muted text-muted-foreground";
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
        </span>
    );
}
