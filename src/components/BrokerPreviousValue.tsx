"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  brokerValue?: string | null;
  previousValue?: string | null;
  className?: string;
  show?: "broker" | "previous" | "both";
  splitBrokerValueBy?: string;
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
  splitBrokerValueBy,
}: Props) {
  const previousParts =
    previousValue != null && previousValue !== ""
      ? splitPreviousValue(previousValue)
      : [];
  const brokerParts =
    brokerValue != null && brokerValue !== "" && splitBrokerValueBy
      ? brokerValue
          .split(splitBrokerValueBy)
          .map((part) => part.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="flex flex-col gap-1">
      {(show === "broker" || show === "both") && (
        brokerParts.length > 0 ? (
          <div className={className}>
            <span>Broker value:</span>
            <div className="flex flex-col">
              {brokerParts.map((part, index) => (
                <span key={`${index}-${part}`}>{part}</span>
              ))}
            </div>
          </div>
        ) : (
          <p className={className}>Broker value: {brokerValue ?? ""}</p>
        )
      )}
      {(show === "previous" || show === "both") && (
        <div className={`flex items-center gap-1.5 ${className}`}>
          
          {previousParts.length > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Show previous value history"
                  >
                   <span>Previous value:&nbsp; </span> {previousParts[0]}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="flex flex-col gap-1">
                    {previousParts.slice(1).map((part, index) => (
                      <span key={`${index + 1}-${part}`} className="block">
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
