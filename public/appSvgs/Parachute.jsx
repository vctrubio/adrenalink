export default function Parachute({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            {/* Open wing/parachute - expanded state */}
            <g>
                {/* Main sail - left */}
                <path d="M2 8 Q2 4, 8 3 Q10 6, 10 12 Z" opacity="0.9" />
                {/* Main sail - right */}
                <path d="M22 8 Q22 4, 16 3 Q14 6, 14 12 Z" opacity="0.9" />
                {/* Center peak */}
                <path d="M12 2 L12 12" stroke={color} strokeWidth="1.5" fill="none" />
                {/* Suspension lines */}
                <line x1="5" y1="12" x2="4" y2="18" stroke={color} strokeWidth="0.8" opacity="0.7" />
                <line x1="12" y1="12" x2="12" y2="20" stroke={color} strokeWidth="0.8" opacity="0.7" />
                <line x1="19" y1="12" x2="20" y2="18" stroke={color} strokeWidth="0.8" opacity="0.7" />
            </g>
        </svg>
    );
}
