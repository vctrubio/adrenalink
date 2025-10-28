export default function SchoolIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L2 9l10 6 10-6L12 3z" />
            <path d="M2 15l10 6 10-6" />
            <path d="M2 9l10 6 10-6" />
        </svg>
    );
}