export default function WindSpeed({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            {/* Wind speed gauge - ACTIVE (high speed) */}
            <g>
                {/* Gauge circle */}
                <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
                {/* Speed lines - right side expanded */}
                <line x1="14" y1="6" x2="19" y2="4" stroke={color} strokeWidth="1.2" opacity="0.8" />
                <line x1="15" y1="9" x2="21" y2="8" stroke={color} strokeWidth="1.2" opacity="0.7" />
                <line x1="15" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.2" opacity="0.7" />
                <line x1="15" y1="15" x2="21" y2="16" stroke={color} strokeWidth="1.2" opacity="0.7" />
                <line x1="14" y1="18" x2="19" y2="20" stroke={color} strokeWidth="1.2" opacity="0.8" />
                {/* Needle pointing right (high) */}
                <g transform="translate(12, 12)">
                    <line x1="0" y1="0" x2="7" y2="-1" stroke={color} strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="1.5" fill={color} />
                </g>
            </g>
        </svg>
    );
}
