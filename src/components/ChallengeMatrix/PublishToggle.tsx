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
        "relative flex items-center h-9 rounded-full bg-gray-200 dark:bg-gray-800 p-0.5 select-none",
        disabled && "opacity-60 pointer-events-none"
      )}>
        {/* Public option */}
        <button
          onClick={!isPublished ? () => onToggle(true) : undefined}
          disabled={disabled}
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-4 h-full rounded-full text-xs font-semibold transition-colors duration-200",
            isPublished
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
          )}
        >
          <span className={cn(
            "h-2 w-2 rounded-full",
            isPublished ? "bg-emerald-500 animate-pulse" : "bg-gray-400 dark:bg-gray-500"
          )} />
          <span>Public</span>
        </button>

        {/* Draft option */}
        <AlertDialogTrigger asChild disabled={!isPublished || disabled}>
          <button
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-4 h-full rounded-full text-xs font-semibold transition-colors duration-200",
              !isPublished
                ? "text-amber-700 dark:text-amber-300"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            )}
          >
            <span className={cn(
              "h-2 w-2 rounded-full",
              !isPublished ? "bg-amber-500" : "bg-gray-400 dark:bg-gray-500"
            )} />
            <span>Draft</span>
          </button>
        </AlertDialogTrigger>

        {/* Sliding indicator */}
        <div
          className={cn(
            "absolute top-0.5 h-[calc(100%-4px)] rounded-full transition-all duration-300 ease-in-out shadow-sm",
            isPublished
              ? "left-0.5 w-[calc(50%-1px)] bg-white dark:bg-gray-700"
              : "left-[calc(50%+1px)] w-[calc(50%-3px)] bg-white dark:bg-gray-700"
          )}
        />
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
