"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoSection } from "@/types/InfoSections";
import { cn } from "@/lib/utils";

type Props = {
  infoSections: InfoSection[];
  optionName?: string;
  className?: string;
};

export function OptionInfoSections({
  infoSections,
  optionName,
  className,
}: Props) {
  if (!infoSections.length) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 rounded-full px-3 text-xs font-medium shadow-none",
            "bg-sky-100 text-sky-800",
            "hover:bg-sky-200 hover:text-sky-950",
            "dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/60 dark:hover:text-sky-100",
            className,
          )}
          aria-label={
            optionName
              ? `View information for ${optionName}`
              : "View information"
          }
        >
          Learn more
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {optionName ? (
          <DialogHeader>
            <DialogTitle>{optionName}</DialogTitle>
          </DialogHeader>
        ) : null}
        <ol className="space-y-6">
          {infoSections.map((section, index) => (
            <li key={`${section.title}-${index}`} className="flex gap-3">
              <span
                className="mt-0.5 shrink-0 text-sm font-semibold text-muted-foreground tabular-nums"
                aria-hidden
              >
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-base font-semibold leading-snug">
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
