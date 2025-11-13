"use client";

interface DateNavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
}

export function DateNavigationButtons({
  onPrevious,
  onNext,
  disabled = false,
  className = "",
}: DateNavigationButtonsProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled}
        className="btn-icon-round-sm"
        title="Previous"
      >
        -
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="btn-icon-round-sm"
        title="Next"
      >
        +
      </button>
    </div>
  );
}
