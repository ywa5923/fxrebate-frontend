import { CircleDollarSign } from "lucide-react";

import applePay from "@/assets/funding_methods/Apple-Pay.png";
import astropay from "@/assets/funding_methods/AstroPay.png";
import binancePay from "@/assets/funding_methods/BINANCE-PAY.png";
import cashu from "@/assets/funding_methods/CashU.png";
import check from "@/assets/funding_methods/Check.png";
import cryptoWallet from "@/assets/funding_methods/Crypto-Wallet.png";
import doku from "@/assets/funding_methods/DOKU.png";
import epay from "@/assets/funding_methods/EPay.png";
import fairpay from "@/assets/funding_methods/FairPay.png";
import fasapay from "@/assets/funding_methods/Fasapay.png";
import gcash from "@/assets/funding_methods/GCash.png";
import ifxPayments from "@/assets/funding_methods/IFX-Payments.png";
import klarna from "@/assets/funding_methods/Klarna.png";
import letknowPay from "@/assets/funding_methods/LetKnow-Pay.png";
import localBank from "@/assets/funding_methods/Local-Bank.png";
import moneygram from "@/assets/funding_methods/MoneyGram.png";
import nagad from "@/assets/funding_methods/Nagad.png";
import nganLuong from "@/assets/funding_methods/Ngan-Luong.png";
import other from "@/assets/funding_methods/Other.png";
import payu from "@/assets/funding_methods/PAYU.png";
import payretailers from "@/assets/funding_methods/PayRetailers.png";
import paymentAsia from "@/assets/funding_methods/Payment-Asia.png";
import payoneer from "@/assets/funding_methods/Payoneer.png";
import paysafecard from "@/assets/funding_methods/PaysafeCard.png";
import przelewy24 from "@/assets/funding_methods/Przelewy24.png";
import qiwi from "@/assets/funding_methods/QIWI.png";
import revolut from "@/assets/funding_methods/Revolut.png";
import swift from "@/assets/funding_methods/SWIFT.png";
import skrill from "@/assets/funding_methods/Skrill.png";
import sticpay from "@/assets/funding_methods/Sticpay.png";
import stripe from "@/assets/funding_methods/Stripe.png";
import thunderxpay from "@/assets/funding_methods/ThunderXPay.png";
import transferRapid from "@/assets/funding_methods/Transfer-Rapid.png";
import trustpay from "@/assets/funding_methods/TrustPay.png";
import trustly from "@/assets/funding_methods/Trustly.png";
import unionpayInternational from "@/assets/funding_methods/UnionPay-International.png";
import visa from "@/assets/funding_methods/VIsa.png";
import vload from "@/assets/funding_methods/VLOAD.png";
import vertupay from "@/assets/funding_methods/VertuPay.png";
import virtualpay from "@/assets/funding_methods/Virtualpay.png";
import volet from "@/assets/funding_methods/Volet.png";
import webmoney from "@/assets/funding_methods/WebMoney.png";
import wireTransfer from "@/assets/funding_methods/Wire-Transfer.png";
import wise from "@/assets/funding_methods/Wise.png";
import bitpay from "@/assets/funding_methods/bitpay.png";
import brightcart from "@/assets/funding_methods/brightcart.png";
import carteirax from "@/assets/funding_methods/carteirax.png";
import confirmo from "@/assets/funding_methods/confirmo.png";
import finrax from "@/assets/funding_methods/finrax.png";
import help2pay from "@/assets/funding_methods/help2pay.png";
import ideal from "@/assets/funding_methods/iDEAL.png";
import korapay from "@/assets/funding_methods/korapay.png";
import maestro from "@/assets/funding_methods/maestro.png";
import mastercard from "@/assets/funding_methods/mastercard.png";
import myfatoorah from "@/assets/funding_methods/myFatoorah.png";
import paysera from "@/assets/funding_methods/paysera.png";
import paytm from "@/assets/funding_methods/paytm.png";
import tingg from "@/assets/funding_methods/tingg.png";
import worldpay from "@/assets/funding_methods/worldpay.png";
import xPay from "@/assets/funding_methods/x-pay.png";

function assetSrc(asset: string | { src: string }): string {
  return typeof asset === "string" ? asset : asset.src;
}

const icons: Record<string, string> = {
  "APPLE-PAY": assetSrc(applePay),
  "ASTROPAY": assetSrc(astropay),
  "BINANCE-PAY": assetSrc(binancePay),
  "CASHU": assetSrc(cashu),
  "CHECK": assetSrc(check),
  "CRYPTO-WALLET": assetSrc(cryptoWallet),
  "DOKU": assetSrc(doku),
  "EPAY": assetSrc(epay),
  "FAIRPAY": assetSrc(fairpay),
  "FASAPAY": assetSrc(fasapay),
  "GCASH": assetSrc(gcash),
  "IFX-PAYMENTS": assetSrc(ifxPayments),
  "KLARNA": assetSrc(klarna),
  "LETKNOW-PAY": assetSrc(letknowPay),
  "LOCAL-BANK": assetSrc(localBank),
  "MONEYGRAM": assetSrc(moneygram),
  "NAGAD": assetSrc(nagad),
  "NGAN-LUONG": assetSrc(nganLuong),
  "OTHER": assetSrc(other),
  "PAYU": assetSrc(payu),
  "PAYRETAILERS": assetSrc(payretailers),
  "PAYMENT-ASIA": assetSrc(paymentAsia),
  "PAYONEER": assetSrc(payoneer),
  "PAYSAFECARD": assetSrc(paysafecard),
  "PRZELEWY24": assetSrc(przelewy24),
  "QIWI": assetSrc(qiwi),
  "REVOLUT": assetSrc(revolut),
  "SWIFT": assetSrc(swift),
  "SKRILL": assetSrc(skrill),
  "STICPAY": assetSrc(sticpay),
  "STRIPE": assetSrc(stripe),
  "THUNDERXPAY": assetSrc(thunderxpay),
  "TRANSFER-RAPID": assetSrc(transferRapid),
  "TRUSTPAY": assetSrc(trustpay),
  "TRUSTLY": assetSrc(trustly),
  "UNIONPAY-INTERNATIONAL": assetSrc(unionpayInternational),
  "VISA": assetSrc(visa),
  "VLOAD": assetSrc(vload),
  "VERTUPAY": assetSrc(vertupay),
  "VIRTUALPAY": assetSrc(virtualpay),
  "VOLET": assetSrc(volet),
  "WEBMONEY": assetSrc(webmoney),
  "WIRE-TRANSFER": assetSrc(wireTransfer),
  "WISE": assetSrc(wise),
  "BITPAY": assetSrc(bitpay),
  "BRIGHTCART": assetSrc(brightcart),
  "CARTEIRAX": assetSrc(carteirax),
  "CONFIRMO": assetSrc(confirmo),
  "FINRAX": assetSrc(finrax),
  "HELP2PAY": assetSrc(help2pay),
  "IDEAL": assetSrc(ideal),
  "KORAPAY": assetSrc(korapay),
  "MAESTRO": assetSrc(maestro),
  "MASTERCARD": assetSrc(mastercard),
  "MYFATOORAH": assetSrc(myfatoorah),
  "PAYSERA": assetSrc(paysera),
  "PAYTM": assetSrc(paytm),
  "TINGG": assetSrc(tingg),
  "WORLDPAY": assetSrc(worldpay),
  "X-PAY": assetSrc(xPay),
};

type Props = {
  method?: string | null;
  className?: string;
};

export function FundingMethodIcon({
  method,
  className = "size-5",
}: Props) {
  const code = method?.trim().toUpperCase();
  const src = code ? icons[code] : undefined;

  if (!src) {
    return (
      <CircleDollarSign
        className={`inline-block shrink-0 ${className}`}
        aria-label={code ?? "Funding method"}
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
