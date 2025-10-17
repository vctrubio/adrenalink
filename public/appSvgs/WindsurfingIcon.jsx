// Windsurfing - board with mast and sail
export default function WindsurfingIcon({ className = "w-6 h-6", ...props }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Sail */}
            <path 
                d="M10 3C12 3 14 4 15 6C16 8 15 10 14 12L10 12L10 3Z" 
                fill="currentColor" 
                opacity="0.7"
            />
            {/* Mast */}
            <path 
                d="M10 3L10 18" 
                stroke="currentColor" 
                strokeWidth="2"
            />
            {/* Boom */}
            <path 
                d="M10 8L14 8" 
                stroke="currentColor" 
                strokeWidth="1.5"
            />
            {/* Rider */}
            <circle 
                cx="12" 
                cy="16" 
                r="1.5" 
                fill="currentColor"
            />
            {/* Board */}
            <path 
                d="M6 18L16 18" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
            />
            {/* Fin */}
            <path 
                d="M11 18L11 20" 
                stroke="currentColor" 
                strokeWidth="1.5"
            />
            {/* Water waves */}
            <path 
                d="M2 21C3 20 4 21 5 20C6 21 7 20 8 21M16 21C17 20 18 21 19 20C20 21 21 20 22 21" 
                stroke="currentColor" 
                strokeWidth="1" 
                opacity="0.4"
            />
        </svg>
    );
}