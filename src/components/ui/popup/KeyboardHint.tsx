interface KeyboardHintProps {
    keys: string | string[];
    action: string;
    className?: string;
}

export function KeyboardHint({ keys, action, className = "" }: KeyboardHintProps) {
    const keyArray = Array.isArray(keys) ? keys : [keys];

    return (
        <div className={`flex justify-center ${className}`}>
            <div className="popup-hint-container">
                <span>Press</span>
                {keyArray.map((key, index) => (
                    <span key={index} className="popup-hint-key">
                        {key}
                    </span>
                ))}
                <span>{action}</span>
            </div>
        </div>
    );
}
