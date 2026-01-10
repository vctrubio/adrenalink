const WAITING_LIST_LINK = "/waitlist";

export const EventDescription = () => {
    return (
        <p className="text-lg leading-relaxed text-white/90">
            When we want to do the actual <span className="font-bold text-blue-300">lesson planning</span>, this is the{" "}
            <span className="font-bold">core of our operations</span>. The classboard component allows setting and creating classes at
            ease. We have a <span className="font-semibold">controller</span> to orchestrate the{" "}
            <span className="font-semibold">time</span>, <span className="font-semibold">duration</span>,{" "}
            <span className="font-semibold">location</span> of selected dates. Everybody is notified. We have 3 different views for the
            same event: <span className="font-bold">Administration</span>, <span className="font-bold">Student</span> and{" "}
            <span className="font-bold">Teacher</span>. More on that once you enter our app. Or subscribe to our{" "}
            <a href={WAITING_LIST_LINK} className="font-bold text-white underline hover:text-white/80 transition-colors">
                waiting list
            </a>
            , where I will personally start sending out video recordings of all of this in action.
        </p>
    );
};
