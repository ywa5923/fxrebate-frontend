import { FundingMethodIcon } from "@/components/FundingMethodIcon";

export function formatFundingMethodOptionLabel(option: {
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <FundingMethodIcon method={option.value} />
      {option.label}
    </span>
  );
}
