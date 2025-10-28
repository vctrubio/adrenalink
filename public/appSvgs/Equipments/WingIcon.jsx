export default function WingIcon({ className = "", size = 24, flag = false, center = false }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform={center ? "rotate(-90 12 12) scale(1.15) translate(-6, 0)" : "rotate(-90 12 12) scale(1.15)"}>
                <path d="M12 3 L21 21 L3 21 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {flag && <path d="M24.15 12V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
    );
}
