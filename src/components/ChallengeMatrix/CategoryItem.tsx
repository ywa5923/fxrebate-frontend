import { cn } from "@/lib/utils";
import { ChallengeType } from "@/types";
import { X } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";

interface CategoryItemProps {
  category: ChallengeType;
  index: number;
  isEditingHiddenState: boolean;
  handleCategoryClick: (category: ChallengeType) => void;
  openDeleteConfirmation: (
    type: "category" | "step" | "amount",
    id: number,
    name: string,
  ) => void;
  isActive: boolean;
}

export default function CategoryItem({
  category,
  index,
  isEditingHiddenState,
  handleCategoryClick,
  openDeleteConfirmation,
  isActive,
}: CategoryItemProps) {
  const { ref, isDragging } = useSortable({
    id: category.id.toString(),
    index,
    disabled: !isEditingHiddenState,
  });

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => handleCategoryClick(category)}
      className={cn(
        "relative inline-block",
        "px-4 md:px-8 py-3 md:py-4",
        "text-sm md:text-lg font-medium",
        "rounded-lg border-2 border-green-800",
        "min-w-[140px] md:min-w-[200px]",
        "text-center transition-all duration-200",
        "hover:shadow-md active:scale-95",
        isEditingHiddenState ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        "select-none",
        isDragging
          ? "!border-4 !border-green-500"
          : isActive
            ? "bg-green-800 text-white shadow-lg"
            : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
      )}
    >
      {category.name}
      {isEditingHiddenState && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Hide category"
          onClick={(e) => {
            e.stopPropagation();
            openDeleteConfirmation("category", category.id, category.name);
          }}
          title="Hide this category"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center shadow hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </div>
  );
}
