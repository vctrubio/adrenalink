// Surfing - classic surfboard and rider on wave
export default function SurfingIcon({ className = "w-6 h-6", ...props }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Rider */}
            <circle 
                cx="12" 
                cy="10" 
                r="1.5" 
                fill="currentColor"
            />
            {/* Body position */}
            <path 
                d="M11 11.5L13 11.5M11.5 11.5L11.5 14" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
            />
            {/* Arms for balance */}
            <path 
                d="M9 12L11 11.5L13 12L15 11" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
            />
            {/* Surfboard */}
            <path 
                d="M8 16C8 15 9 14 12 14C15 14 16 15 16 16C16 17 15 18 12 18C9 18 8 17 8 16Z" 
                fill="currentColor" 
                opacity="0.6"
            />
            {/* Large wave */}
            <path 
                d="M2 18C4 16 6 17 8 16C10 15 12 16 14 15C16 16 18 15 20 16C22 17 24 16 24 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
            />
            {/* Wave crest */}
            <path 
                d="M2 18C3 19 4 18 5 19C6 18 7 19 8 18M16 18C17 19 18 18 19 19C20 18 21 19 22 18" 
                stroke="currentColor" 
                strokeWidth="1" 
                opacity="0.6"
            />
            {/* Water base */}
            <path 
                d="M0 20L24 20" 
                stroke="currentColor" 
                strokeWidth="3" 
                opacity="0.3"
            />
        </svg>
    );
}