import { CryptoCurrencyIcon } from "@/components/CryptoCurrencyIcon";

export function formatCryptoCurrencyOptionLabel(option: {
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <CryptoCurrencyIcon currency={option.value} />
      {option.label}
    </span>
  );
}
