"use client";

import { InfoIcon } from "lucide-react";
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
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
          aria-label={
            optionName
              ? `View information for ${optionName}`
              : "View information"
          }
        >
          <InfoIcon className="h-4 w-4 cursor-help" />
        </button>
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
