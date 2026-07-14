import { CryptoCurrencyIcon } from "@/components/CryptoCurrencyIcon";
import { getCryptoCurrencyCode } from "@/lib/getCryptoCurrencyCode";

export function formatCryptoCurrencyOptionLabel(option: {
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <CryptoCurrencyIcon currency={getCryptoCurrencyCode(option.value)} />
      {option.label}
    </span>
  );
}
