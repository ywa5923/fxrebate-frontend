import { cn } from "@/lib/utils";
import { ChallengeStep } from "@/types";
import { X } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";

interface StepItemProps {
  step: ChallengeStep;
  index: number;
  isEditingHiddenState: boolean;
  handleStepClick: (step: ChallengeStep) => void;
  openDeleteConfirmation: (
    type: "category" | "step" | "amount",
    id: number,
    name: string,
  ) => void;
  isActive: boolean;
}

export default function StepItem({
  step,
  index,
  isEditingHiddenState,
  handleStepClick,
  openDeleteConfirmation,
  isActive,
}: StepItemProps) {
  const { ref, isDragging } = useSortable({
    id: `step-${step.id}`,
    index,
    disabled: !isEditingHiddenState,
  });

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => handleStepClick(step)}
      className={cn(
        "relative inline-block",
        "px-3 md:px-4 py-2",
        "text-xs md:text-sm font-medium",
        "rounded-lg border-2 border-green-800",
        "min-w-[100px] md:min-w-[120px]",
        "text-center transition-all duration-200",
        "hover:shadow-sm active:scale-95",
        isEditingHiddenState ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        "select-none",
        isDragging
          ? "!border-4 !border-green-500"
          : isActive
            ? "bg-green-800 text-white shadow-md"
            : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
      )}
    >
      {step.name}
      {isEditingHiddenState && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Hide step"
          onClick={(e) => {
            e.stopPropagation();
            openDeleteConfirmation("step", step.id, step.name);
          }}
          title="Hide this step"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center shadow hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}
