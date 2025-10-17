// Wing foiling - handheld wing with hydrofoil board
export default function WingFoilingIcon({ className = "w-6 h-6", ...props }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Wing shape */}
            <path 
                d="M4 8C4 6 6 4 8 4C10 4 12 5 14 6C16 7 18 8 20 8C20 10 18 12 16 12C14 12 12 11 10 10C8 9 6 8 4 8Z" 
                fill="currentColor" 
                opacity="0.7"
            />
            {/* Wing handle */}
            <path 
                d="M10 10L11 14" 
                stroke="currentColor" 
                strokeWidth="2"
            />
            {/* Rider */}
            <circle 
                cx="11" 
                cy="16" 
                r="1.5" 
                fill="currentColor"
            />
            {/* Board (smaller than kiteboard) */}
            <path 
                d="M9 19L13 19" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
            />
            {/* Hydrofoil mast */}
            <path 
                d="M11 19L11 21" 
                stroke="currentColor" 
                strokeWidth="1.5"
            />
            {/* Hydrofoil wing */}
            <path 
                d="M8 21L14 21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
            />
            {/* Front foil */}
            <path 
                d="M8 21L8 22" 
                stroke="currentColor" 
                strokeWidth="1.5"
            />
            <path 
                d="M14 21L14 22" 
                stroke="currentColor" 
                strokeWidth="1.5"
            />
            {/* Water waves */}
            <path 
                d="M2 22.5C3 21.5 4 22.5 5 21.5C6 22.5 7 21.5 8 22.5M16 22.5C17 21.5 18 22.5 19 21.5C20 22.5 21 21.5 22 22.5" 
                stroke="currentColor" 
                strokeWidth="1" 
                opacity="0.4"
            />
        </svg>
    );
}