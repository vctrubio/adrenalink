export default function CreditIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
            <path d="M6 15H8" stroke="currentColor" strokeWidth="2" />
            <path d="M12 15H18" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
