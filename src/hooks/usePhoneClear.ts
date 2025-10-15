import { useState } from "react";

export function usePhoneClear() {
    const [clearPhone, setClearPhone] = useState(false);

    const triggerPhoneClear = () => {
        setClearPhone(prev => !prev);
    };

    return { clearPhone, triggerPhoneClear };
}