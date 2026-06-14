import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function PreviousValues({previousValues}: {previousValues: string}) {


    const previousParts =
    previousValues != null && previousValues !== ""
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
        <span className="inline-block w-fit self-start">Previous Value: {previousParts[0]}</span>
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