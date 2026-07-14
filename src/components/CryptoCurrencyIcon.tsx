import { CircleDollarSign } from "lucide-react";

import ada from "cryptocurrency-icons/svg/color/ada.svg";
import bch from "cryptocurrency-icons/svg/color/bch.svg";
import bnb from "cryptocurrency-icons/svg/color/bnb.svg";
import btc from "cryptocurrency-icons/svg/color/btc.svg";
import doge from "cryptocurrency-icons/svg/color/doge.svg";
import eth from "cryptocurrency-icons/svg/color/eth.svg";
import link from "cryptocurrency-icons/svg/color/link.svg";
import sol from "cryptocurrency-icons/svg/color/sol.svg";
import trx from "cryptocurrency-icons/svg/color/trx.svg";
import usdc from "cryptocurrency-icons/svg/color/usdc.svg";
import usdt from "cryptocurrency-icons/svg/color/usdt.svg";
import xlm from "cryptocurrency-icons/svg/color/xlm.svg";
import xmr from "cryptocurrency-icons/svg/color/xmr.svg";
import xrp from "cryptocurrency-icons/svg/color/xrp.svg";

const icons: Record<string, string> = {
  ADA: ada,
  BCH: bch,
  BNB: bnb,
  BTC: btc,
  DOGE: doge,
  ETH: eth,
  LINK: link,
  SOL: sol,
  TRX: trx,
  USDC: usdc,
  USDT: usdt,
  XLM: xlm,
  XMR: xmr,
  XRP: xrp,
};

type Props = {
  currency?: string | null;
  className?: string;
};

export function CryptoCurrencyIcon({
  currency,
  className = "size-5",
}: Props) {
  const code = currency?.trim().toUpperCase();
  const src = code ? icons[code] : undefined;

  if (!src) {
    return (
      <CircleDollarSign
        className={`inline-block shrink-0 ${className}`}
        aria-label={code ?? "Currency"}
      />
    );
  }

  return (
    <img
      src={src}
      alt={code ?? ""}
      className={`inline-block shrink-0 ${className}`}
    />
  );
}