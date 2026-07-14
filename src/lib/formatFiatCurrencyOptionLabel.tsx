import { FiatCurrencyIcon } from "@/components/FiatCurrencyIcon";

export function formatFiatCurrencyOptionLabel(option: {
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <FiatCurrencyIcon currency={option.value} />
      {option.label}
    </span>
  );
}
