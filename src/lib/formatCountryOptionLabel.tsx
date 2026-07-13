import { Flag } from "@/components/Flag";
import { getCountryCode } from "@/lib/getCountryCode";

export function formatCountryOptionLabel(option: {
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Flag country={getCountryCode(option.value)} className="rounded-sm" />
      {option.label}
    </span>
  );
}
