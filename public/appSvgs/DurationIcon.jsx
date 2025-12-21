export default function DurationIcon({ className = "", size = 24 }) {
    const LINE_THICKNESS = 0.7;
    const HORIZONTAL_HEIGHT = 1;
    const CORNER_RADIUS = 0.35;
    
    return (
        <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left vertical line - top */}
            <path
                d={`M 6 1 Q ${6 + CORNER_RADIUS} 1 ${6 + LINE_THICKNESS} 1.5 L ${6 + LINE_THICKNESS} 10 Q ${6 + CORNER_RADIUS} 10 6 10.5 L ${6 - LINE_THICKNESS} 10 Q ${6 - CORNER_RADIUS} 10 ${6 - LINE_THICKNESS} 9.5 L ${6 - LINE_THICKNESS} 1.5 Q ${6 - CORNER_RADIUS} 1 6 1 Z`}
                fill="currentColor"
            />
            
            {/* Left vertical line - bottom */}
            <path
                d={`M 6 13.5 L ${6 + LINE_THICKNESS} 13 L ${6 + LINE_THICKNESS} 22.5 L 6 23 Q ${6 - CORNER_RADIUS} 23 ${6 - LINE_THICKNESS} 22.5 L ${6 - LINE_THICKNESS} 13 L 6 13.5 Z`}
                fill="currentColor"
            />
            
            {/* Right vertical line - top */}
            <path
                d={`M 18 1 Q ${18 - CORNER_RADIUS} 1 ${18 - LINE_THICKNESS} 1.5 L ${18 - LINE_THICKNESS} 10 Q ${18 - CORNER_RADIUS} 10 18 10.5 L ${18 + LINE_THICKNESS} 10 Q ${18 + CORNER_RADIUS} 10 ${18 + LINE_THICKNESS} 9.5 L ${18 + LINE_THICKNESS} 1.5 Q ${18 + CORNER_RADIUS} 1 18 1 Z`}
                fill="currentColor"
            />
            
            {/* Right vertical line - bottom */}
            <path
                d={`M 18 13.5 L ${18 - LINE_THICKNESS} 13 L ${18 - LINE_THICKNESS} 22.5 L 18 23 Q ${18 + CORNER_RADIUS} 23 ${18 + LINE_THICKNESS} 22.5 L ${18 + LINE_THICKNESS} 13 L 18 13.5 Z`}
                fill="currentColor"
            />
            
            {/* Horizontal line */}
            <path
                d={`M 5 12 Q 5 ${12 - HORIZONTAL_HEIGHT / 2} ${5 + LINE_THICKNESS} ${12 - HORIZONTAL_HEIGHT / 2} L ${19 - LINE_THICKNESS} ${12 - HORIZONTAL_HEIGHT / 2} Q 19 ${12 - HORIZONTAL_HEIGHT / 2} 19 12 L ${19 - LINE_THICKNESS} ${12 + HORIZONTAL_HEIGHT / 2} Q 19 ${12 + HORIZONTAL_HEIGHT / 2} ${19 - LINE_THICKNESS} ${12 + HORIZONTAL_HEIGHT / 2} L ${5 + LINE_THICKNESS} ${12 + HORIZONTAL_HEIGHT / 2} Q 5 ${12 + HORIZONTAL_HEIGHT / 2} 5 12 Z`}
                fill="currentColor"
            />
        </svg>
    );
}