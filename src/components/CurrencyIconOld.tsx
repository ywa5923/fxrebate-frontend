import type { ComponentType, SVGProps } from "react";
import {
  ADA,
  BCH,
  BNB,
  BTC,
  DOGE,
  ETH,
  LINK,
  SOL,
  TRX,
  USDC,
  USDT,
  XLM,
  XMR,
  XRP,
} from "ccy-icons";
import { CircleDollarSign } from "lucide-react";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

const icons: Record<string, SvgIcon> = {
  BTC,
  ETH,
  USDT,
  XRP,
  BNB,
  USDC,
  SOL,
  TRX,
  DOGE,
  BCH,
  ADA,
  LINK,
  XMR,
  XLM,
};

type CurrencyIconProps = {
  currency?: string | null;
  className?: string;
};

export function CurrencyIcon({
  currency,
  className = "",
}: CurrencyIconProps) {
  const code = currency?.trim().toUpperCase();

  const Icon = code ? icons[code] : undefined;

  if (!Icon) {
    return (
      <CircleDollarSign
        className={`inline-block shrink-0 ${className}`}
        aria-label={currency ?? "Currency"}
      />
    );
  }

  return (
    <Icon
      className={`inline-block shrink-0 ${className}`}
      aria-label={code}
    />
  );
}