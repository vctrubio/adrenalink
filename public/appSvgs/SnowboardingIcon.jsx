// Snowboarding - rider on snowboard with mountain terrain
export default function SnowboardingIcon({ className = "w-6 h-6", ...props }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
            {/* Mountain silhouette */}
            <path d="M2 20L6 12L10 16L14 8L18 14L22 20" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
            {/* Rider */}
            <circle cx="12" cy="11" r="1.5" fill="currentColor" />
            {/* Body leaning */}
            <path d="M12 12.5L11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Arms for balance */}
            <path d="M9 12L11 12.5L13 12L15 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Snowboard */}
            <path d="M8 16L16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            {/* Bindings */}
            <rect x="9.5" y="15" width="1" height="2" fill="currentColor" />
            <rect x="13.5" y="15" width="1" height="2" fill="currentColor" />
            {/* Snow powder */}
            <path d="M6 17C7 16 8 17 9 16M15 17C16 16 17 17 18 16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            {/* Snow base */}
            <path d="M0 18L24 18" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            {/* Snowflakes */}
            <circle cx="5" cy="6" r="0.5" fill="currentColor" opacity="0.3" />
            <circle cx="19" cy="4" r="0.5" fill="currentColor" opacity="0.3" />
            <circle cx="8" cy="9" r="0.5" fill="currentColor" opacity="0.3" />
            <circle cx="16" cy="7" r="0.5" fill="currentColor" opacity="0.3" />
        </svg>
    );
}
