import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function PreviousValues({ label, previousValue }: { label: string, previousValue: string | null }) {

  const previousParts =
    previousValue != null && previousValue !== ""
      ? previousValue.split("->")
        .map((part) => part.trim())
        .filter(Boolean)
      : [];

  if (previousParts.length === 0) {
    return null;
  }

  const olderParts = previousParts.slice(1);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block w-fit self-start">{label}: {previousParts[0]}</span>
      </TooltipTrigger>
      {olderParts.length > 0 && (
        <TooltipContent>
          <div className="flex flex-col gap-0.5">
            {olderParts.map((part, index) => (
              <span key={index}>{part}</span>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
