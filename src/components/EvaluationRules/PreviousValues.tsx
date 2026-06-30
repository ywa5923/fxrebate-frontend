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
        <span className="inline-block w-fit self-start text-xs text-gray-600 dark:text-gray-400 mt-2 mb-2">
          {label}: {previousParts[0]}
        </span>
      </TooltipTrigger>
      {previousParts.length > 0 && (
        <TooltipContent className="text-sm text-white">
          <div className="flex flex-col divide-y divide-white/20">
            {previousParts.slice(1).map((part, index) => (
              <span key={index} className="block py-1">
                {part}
              </span>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}