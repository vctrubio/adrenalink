export default function KiteIcon({ className = "", size = 24, flag = false, center = false }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {flag && <path d="M12 22V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
    );
}
