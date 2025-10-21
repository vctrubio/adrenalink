"use client";

import { useEffect, useState } from "react";

const BetaCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const targetDate = new Date("2026-01-01T00:00:00");
            const now = new Date();
            const diffTime = targetDate.getTime() - now.getTime();

            if (diffTime <= 0) {
                clearInterval(timer);
                return;
            }

            const hours = Math.floor(diffTime / (1000 * 60 * 60));
            const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="inline-block px-3 py-1 border border-b-cyan-700 rounded-full ">
            <span className="font-bold text-warm-500">beta</span> coming soon - {String(timeLeft.hours).padStart(2, "0")}h:{String(timeLeft.minutes).padStart(2, "0")}m:{String(timeLeft.seconds).padStart(2, "0")}s
        </div>
    );
};

export default BetaCountdown;
