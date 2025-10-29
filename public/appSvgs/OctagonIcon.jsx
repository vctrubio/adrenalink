export default function OctagonIcon({ className = "", size = 24 }) {
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
                points="32.284,4 15.716,4 4,15.716 4,32.284 15.716,44 32.284,44 44,32.284 44,15.716"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
        </svg>
    );
}
