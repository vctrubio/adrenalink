export default function ClassboardIcon({ className = "", size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
        >
            <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
            <line x1="3" y1="19" x2="21" y2="19"></line>
            <line x1="12" y1="9" x2="12" y2="15"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
        </svg>
    );
}
