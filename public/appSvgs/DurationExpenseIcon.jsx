export default function DurationExpenseIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="3" width="10" height="5" rx="1" fill="currentColor" />
            <rect x="7" y="9.5" width="10" height="5" rx="1" fill="currentColor" fillOpacity="0.6" />
            <rect x="7" y="16" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}
