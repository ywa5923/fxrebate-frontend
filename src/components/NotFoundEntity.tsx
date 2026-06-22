"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
};

export function NotFoundEntity({
  title,
  description,
  onClick,
  ariaLabel,
  className,
}: Props) {
  const containerClassName = cn(
    "w-full rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-12 text-center sm:px-6 sm:py-14",
    "dark:border-gray-700 dark:bg-gray-900/30",
    onClick &&
      "group transition-all duration-150 hover:border-green-500 hover:bg-green-50/50 dark:hover:border-green-700 dark:hover:bg-green-950/20",
    className,
  );

  const content = (
    <>
      {onClick && (
        <span
          className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed transition-colors",
            "border-gray-300 bg-white text-gray-400 group-hover:border-green-500 group-hover:text-green-600",
            "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
            "dark:group-hover:border-green-600 dark:group-hover:text-green-400",
          )}
        >
          <Plus className="h-8 w-8" strokeWidth={1.75} />
        </span>
      )}
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={containerClassName}
        aria-label={ariaLabel ?? title}
      >
        {content}
      </button>
    );
  }

  return <div className={containerClassName}>{content}</div>;
}
