// Kitesurfing - kite with control bar and rider on board
export default function KitesurfingIcon({ className = "w-6 h-6", ...props }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
            {/* Kite */}
            <path d="M12 2L8 6L12 10L16 6L12 2Z" fill="currentColor" opacity="0.8" />
            {/* Kite lines */}
            <path d="M12 10L11 16M12 10L13 16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            {/* Control bar */}
            <path d="M9 16L15 16" stroke="currentColor" strokeWidth="2" />
            {/* Rider on board */}
            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
            {/* Board */}
            <path d="M8 21L16 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            {/* Water waves */}
            <path
                d="M2 22C3 21 4 22 5 21C6 22 7 21 8 22M16 22C17 21 18 22 19 21C20 22 21 21 22 22"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
            />
        </svg>
    );
}
