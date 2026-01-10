export default function DurationIcon({ className = "", size = 24 }) {
    const LINE_THICKNESS = 0.8;
    const CORNER_RADIUS = 0.4;

    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Clock face circle */}
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" />

            {/* Hour markers */}
            <g opacity="0.6">
                {/* 12 o'clock */}
                <line x1="12" y1="3" x2="12" y2="4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                {/* 3 o'clock */}
                <line x1="21" y1="12" x2="19.5" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                {/* 6 o'clock */}
                <line x1="12" y1="21" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                {/* 9 o'clock */}
                <line x1="3" y1="12" x2="4.5" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* Hour hand - pointing at 10 */}
            <g transform="translate(12, 12)">
                <line
                    x1="0"
                    y1="0"
                    x2={Math.cos(((10 * 30 - 90) * Math.PI) / 180) * 4}
                    y2={Math.sin(((10 * 30 - 90) * Math.PI) / 180) * 4}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>

            {/* Minute hand - pointing at 2 */}
            <g transform="translate(12, 12)">
                <line
                    x1="0"
                    y1="0"
                    x2={Math.cos(((2 * 6 - 90) * Math.PI) / 180) * 5.5}
                    y2={Math.sin(((2 * 6 - 90) * Math.PI) / 180) * 5.5}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                />
            </g>

            {/* Center dot */}
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    );
}
