export const CommissionDescription = () => {
    return (
        <p className="text-lg leading-relaxed text-white/90">
            You assign a <span className="font-bold text-green-300">commission rate</span> to a teacher in their profile. A commission
            consists of a <span className="font-semibold">value</span>, with a type:{" "}
            <span className="font-bold">percentage based</span> or <span className="font-bold">fixed based salary</span>. Together they
            define how much a teacher will earn through each lesson plan.
        </p>
    );
};
