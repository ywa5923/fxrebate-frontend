"use client";

import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PublishToggleProps {
  isPublished: boolean;
  onToggle: (newState: boolean) => void;
  disabled?: boolean;
}

export default function PublishToggle({ isPublished, onToggle, disabled = false }: PublishToggleProps) {
  return (
    <AlertDialog>
      <div className={cn(
        "relative flex items-center h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 cursor-pointer select-none",
        disabled && "opacity-60 pointer-events-none"
      )}>
        <button
          onClick={!isPublished ? () => onToggle(true) : undefined}
          disabled={disabled}
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
            isPublished
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
          )}
        >
          <span className={cn("h-2 w-2 rounded-full", isPublished ? "bg-emerald-500 animate-pulse" : "")} />
          <span>Public</span>
        </button>
        <AlertDialogTrigger asChild disabled={!isPublished || disabled}>
          <button
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-3 h-full rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
              !isPublished
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", !isPublished ? "bg-amber-500" : "")} />
            <span>Draft</span>
          </button>
        </AlertDialogTrigger>
        <div className={cn(
          "absolute top-1 h-[calc(100%-8px)] rounded-md transition-all duration-300 ease-in-out",
          isPublished
            ? "left-1 w-[calc(50%-2px)] bg-gray-100 dark:bg-slate-800 shadow-sm"
            : "left-[calc(50%+2px)] w-[calc(50%-6px)] bg-gray-100 dark:bg-slate-800 shadow-sm"
        )} />
      </div>

      {/* Confirmation dialog for switching to Draft */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set As Draft?</AlertDialogTitle>
          <AlertDialogDescription>
            This will hide the table from the public site. Only you will be able to see it as a draft.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onToggle(false)}
            className="bg-slate-700 hover:bg-slate-800 text-white"
          >
            Yes, set as draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
