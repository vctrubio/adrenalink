export default function FlagIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 15V21M4 15L8 12L12 15L16 12L20 15V3L16 6L12 3L8 6L4 3V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />
        </svg>
    );
}
