export default function AdrenalinkIcon({ className = "", size = 24 }: { className?: string; size?: number | string }) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* main outer shape */}
            <path
                d="M6.2 3.1C6.6 2.2 7.4 1.6 8.4 1.6H16c1.4 0 2.5 1.1 2.5 2.5v6.9c0 1.3-0.9 2.5-2.2 2.8l-2.4.6c-.2.1-.3.3-.3.5v1.2c0 2.3-1.8 4.1-4.1 4.1-2.2 0-4-1.7-4.1-3.9L5 9.4c0-.3-.2-.5-.4-.6L3.2 8.3C2.5 8 2 7.3 2 6.5c0-.9.5-1.7 1.3-2l2.9-1.1c.4-.1.7-.3 1-.3z"
                fill="currentColor"
            />
            {/* three “speed” stripes */}
            <path
                d="M2 10.1H14.8C15.3 10.1 15.7 10.5 15.7 11c0 .5-.4.9-.9.9H2.7C2.3 11.9 2 11.5 2 11c0-.5.2-.9.5-.9z"
                fill="currentColor"
            />
            <path
                d="M3.2 13H13.7C14.2 13 14.6 13.4 14.6 13.9 14.6 14.4 14.2 14.8 13.7 14.8H3.9C3.5 14.8 3.2 14.4 3.2 13.9c0-.5.2-.9.5-.9z"
                fill="currentColor"
            />
        </svg>
    );
}
