import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function PreviousValues({
  previousValues,
  label = "Previous Values",
}: {
  previousValues: string | null | undefined;
  label?: string;
}) {
    const previousParts =
    previousValues != null && previousValues !== "" && previousValues !== undefined
      ? previousValues.split("->")
        .map((part) => part.trim())
        .filter(Boolean)
      : [];

  if (previousParts.length === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block w-fit self-start">
          {label}: {previousParts[0]}
        </span>
      </TooltipTrigger>
      {previousParts.length > 0 && (
        <TooltipContent>
          <div className="flex flex-col gap-0.5">
            {previousParts.slice(1).map((part, index) => (
              <span key={index}>{part}</span>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}