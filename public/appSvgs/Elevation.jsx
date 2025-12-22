export default function Elevation({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Altitude graph - expanded state (peaks) */}
            <g>
                <polyline points="2,18 5,14 8,16 11,8 14,12 17,6 20,10 22,8" />
                <line x1="2" y1="18" x2="22" y2="18" opacity="0.4" />
                <line x1="1" y1="12" x2="3" y2="12" opacity="0.3" strokeWidth="0.8" />
                <line x1="1" y1="6" x2="3" y2="6" opacity="0.3" strokeWidth="0.8" />
            </g>
        </svg>
    );
}
