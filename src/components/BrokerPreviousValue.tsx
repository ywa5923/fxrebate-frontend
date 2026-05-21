"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

type Props = {
  brokerValue?: string | null;
  previousValue?: string | null;
  className?: string;
  show?: "broker" | "previous" | "both";
};

function splitPreviousValue(value: string): string[] {
  return value
    .split("->")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function BrokerPreviousValue({
  brokerValue,
  previousValue,
  className = "text-xs text-gray-600 dark:text-gray-400",
  show = "both",
}: Props) {
  const previousParts =
    previousValue != null && previousValue !== ""
      ? splitPreviousValue(previousValue)
      : [];

  return (
    <div className="flex flex-col gap-1">
      {(show === "broker" || show === "both") && (
        <p className={className}>Broker value: {brokerValue ?? ""}</p>
      )}
      {(show === "previous" || show === "both") && (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <span>Previous value:</span>
          {previousParts.length > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Show previous value history"
                  >
                    <InfoIcon className="h-4 w-4 cursor-help" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="flex flex-col gap-1">
                    {previousParts.map((part, index) => (
                      <span key={`${index}-${part}`} className="block">
                        {part}
                      </span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
      )}
    </div>
  );
}
