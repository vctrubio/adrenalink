export default function DurationIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(15 12 12)">
                <path
                    d="M12 5V3M9 3H15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M19.665 9.4A7.99974 7.99974 0 1 0 4.33502 9.4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 7L11 14L12 12L13 14L12 7Z"
                    fill="currentColor"
                />
            </g>
        </svg>
    );
}