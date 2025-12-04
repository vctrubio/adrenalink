export default function WingIcon({ className = "", size = 24, flag = false }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12L22 2V22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />

            {flag && <path d="M12 17V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
    );
}