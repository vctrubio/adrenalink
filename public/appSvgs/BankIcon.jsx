export default function BankIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            <path d="M12 11v10" />
            <path d="M8 11v10" />
            <path d="M16 11v10" />
            <path d="M3 11h18" />
        </svg>
    );
}