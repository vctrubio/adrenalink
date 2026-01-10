export default function KiteIcon({ className = "", size = 24, flag = false }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L4 12L12 22L20 12L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.3"
            />
            {flag && <path d="M12 22V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
    );
}
