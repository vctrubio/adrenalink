export default function AdminIcon({ className = "", size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M21.5 9.5L12 2L2.5 9.5" />
            <path d="M19 9.5V18H5V9.5L12 4L19 9.5Z" />
        </svg>
    );
}
