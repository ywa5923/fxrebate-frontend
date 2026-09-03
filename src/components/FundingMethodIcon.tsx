import { CircleDollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import americanExpress from "@/assets/funding_methods/american-express.jpg";
import applePay from "@/assets/funding_methods/Apple-Pay.png";
import astropay from "@/assets/funding_methods/AstroPay.png";
import binancePay from "@/assets/funding_methods/BINANCE-PAY.png";
import bitpay from "@/assets/funding_methods/bitpay.png";
import bitwallet from "@/assets/funding_methods/bitwallet.jpg";
import brightcart from "@/assets/funding_methods/brightcart.png";
import carteirax from "@/assets/funding_methods/carteirax.png";
import cashu from "@/assets/funding_methods/CashU.png";
import check from "@/assets/funding_methods/Check.png";
import confirmo from "@/assets/funding_methods/confirmo.png";
import cryptoWallet from "@/assets/funding_methods/Crypto-Wallet.png";
import cyptocurrencyPayments from "@/assets/funding_methods/Cyptocurrency-Payments.jpg";
import doku from "@/assets/funding_methods/DOKU.png";
import dragonpay from "@/assets/funding_methods/dragonpay.jpg";
import epay from "@/assets/funding_methods/EPay.png";
import fairpay from "@/assets/funding_methods/FairPay.png";
import fasapay from "@/assets/funding_methods/Fasapay.png";
import finrax from "@/assets/funding_methods/finrax.png";
import gcash from "@/assets/funding_methods/GCash.png";
import googlePay from "@/assets/funding_methods/Google-Pay.jpg";
import help2pay from "@/assets/funding_methods/help2pay.png";
import ideal from "@/assets/funding_methods/iDEAL.png";
import ifxPayments from "@/assets/funding_methods/IFX-Payments.png";
import jcb from "@/assets/funding_methods/JCB.jpg";
import klarna from "@/assets/funding_methods/Klarna.png";
import korapay from "@/assets/funding_methods/korapay.png";
import kuady from "@/assets/funding_methods/Kuady.jpg";
import letknowPay from "@/assets/funding_methods/LetKnow-Pay.png";
import localBank from "@/assets/funding_methods/Local-Bank.png";
import maestro from "@/assets/funding_methods/maestro.png";
import mastercard from "@/assets/funding_methods/mastercard.png";
import moneygram from "@/assets/funding_methods/MoneyGram.png";
import myfatoorah from "@/assets/funding_methods/myFatoorah.png";
import nagad from "@/assets/funding_methods/Nagad.png";
import neteller from "@/assets/funding_methods/Neteller.jpg";
import nexway from "@/assets/funding_methods/NEXWAY.jpg";
import nganLuong from "@/assets/funding_methods/Ngan-Luong.png";
import ofx from "@/assets/funding_methods/OFX.jpg";
import other from "@/assets/funding_methods/Other.png";
import paymentAsia from "@/assets/funding_methods/Payment-Asia.png";
import payoneer from "@/assets/funding_methods/Payoneer.png";
import paypal from "@/assets/funding_methods/PayPal.jpg";
import payretailers from "@/assets/funding_methods/PayRetailers.png";
import paysafecard from "@/assets/funding_methods/PaysafeCard.png";
import paysera from "@/assets/funding_methods/paysera.png";
import paytm from "@/assets/funding_methods/paytm.png";
import payu from "@/assets/funding_methods/PAYU.png";
import poli from "@/assets/funding_methods/POLi.jpg";
import przelewy24 from "@/assets/funding_methods/Przelewy24.png";
import qiwi from "@/assets/funding_methods/QIWI.png";
import revolut from "@/assets/funding_methods/Revolut.png";
import sepa from "@/assets/funding_methods/SEPA.jpg";
import skrill from "@/assets/funding_methods/Skrill.png";
import sticpay from "@/assets/funding_methods/Sticpay.png";
import stripe from "@/assets/funding_methods/Stripe.png";
import swift from "@/assets/funding_methods/SWIFT.png";
import thunderxpay from "@/assets/funding_methods/ThunderXPay.png";
import tingg from "@/assets/funding_methods/tingg.png";
import transferRapid from "@/assets/funding_methods/Transfer-Rapid.png";
import trustly from "@/assets/funding_methods/Trustly.png";
import trustpay from "@/assets/funding_methods/TrustPay.png";
import unionpayInternational from "@/assets/funding_methods/UnionPay-International.png";
import vertupay from "@/assets/funding_methods/VertuPay.png";
import virtualpay from "@/assets/funding_methods/Virtualpay.png";
import visa from "@/assets/funding_methods/VIsa.png";
import vload from "@/assets/funding_methods/VLOAD.png";
import volet from "@/assets/funding_methods/Volet.png";
import webmoney from "@/assets/funding_methods/WebMoney.png";
import westernunion from "@/assets/funding_methods/WesternUnion.jpg";
import wireTransfer from "@/assets/funding_methods/Wire-Transfer.png";
import wise from "@/assets/funding_methods/Wise.png";
import worldpay from "@/assets/funding_methods/worldpay.png";
import xPay from "@/assets/funding_methods/x-pay.png";
import zotapay from "@/assets/funding_methods/ZotaPay.jpg";
import frillpay from "@/assets/funding_methods/frillpay.jpeg";
import hwgc from "@/assets/funding_methods/hwgc.png";
import alipay from "@/assets/funding_methods/alipay.jpeg";



function assetSrc(asset: string | { src: string }): string {
  return typeof asset === "string" ? asset : asset.src;
}

const icons: Record<string, string> = {
  "AMERICAN-EXPRESS": assetSrc(americanExpress),
  "APPLE-PAY": assetSrc(applePay),
  "ASTROPAY": assetSrc(astropay),
  "BINANCE-PAY": assetSrc(binancePay),
  "BITPAY": assetSrc(bitpay),
  "BITWALLET": assetSrc(bitwallet),
  "BRIGHTCART": assetSrc(brightcart),
  "CARTEIRAX": assetSrc(carteirax),
  "CASHU": assetSrc(cashu),
  "CHECK": assetSrc(check),
  "CONFIRMO": assetSrc(confirmo),
  "CRYPTO-WALLET": assetSrc(cryptoWallet),
  "CYPTOCURRENCY-PAYMENTS": assetSrc(cyptocurrencyPayments),
  "DOKU": assetSrc(doku),
  "DRAGONPAY": assetSrc(dragonpay),
  "EPAY": assetSrc(epay),
  "FAIRPAY": assetSrc(fairpay),
  "FASAPAY": assetSrc(fasapay),
  "FINRAX": assetSrc(finrax),
  "GCASH": assetSrc(gcash),
  "GOOGLE-PAY": assetSrc(googlePay),
  "HELP2PAY": assetSrc(help2pay),
  "IDEAL": assetSrc(ideal),
  "IFX-PAYMENTS": assetSrc(ifxPayments),
  "JCB": assetSrc(jcb),
  "KLARNA": assetSrc(klarna),
  "KORAPAY": assetSrc(korapay),
  "KUADY": assetSrc(kuady),
  "LETKNOW-PAY": assetSrc(letknowPay),
  "LOCAL-BANK": assetSrc(localBank),
  "MAESTRO": assetSrc(maestro),
  "MASTERCARD": assetSrc(mastercard),
  "MONEYGRAM": assetSrc(moneygram),
  "MYFATOORAH": assetSrc(myfatoorah),
  "NAGAD": assetSrc(nagad),
  "NETELLER": assetSrc(neteller),
  "NEXWAY": assetSrc(nexway),
  "NGAN-LUONG": assetSrc(nganLuong),
  "OFX": assetSrc(ofx),
  "OTHER": assetSrc(other),
  "PAYMENT-ASIA": assetSrc(paymentAsia),
  "PAYONEER": assetSrc(payoneer),
  "PAYPAL": assetSrc(paypal),
  "PAYRETAILERS": assetSrc(payretailers),
  "PAYSAFECARD": assetSrc(paysafecard),
  "PAYSERA": assetSrc(paysera),
  "PAYTM": assetSrc(paytm),
  "PAYU": assetSrc(payu),
  "POLI": assetSrc(poli),
  "PRZELEWY24": assetSrc(przelewy24),
  "QIWI": assetSrc(qiwi),
  "REVOLUT": assetSrc(revolut),
  "SEPA": assetSrc(sepa),
  "SKRILL": assetSrc(skrill),
  "STICPAY": assetSrc(sticpay),
  "STRIPE": assetSrc(stripe),
  "SWIFT": assetSrc(swift),
  "THUNDERXPAY": assetSrc(thunderxpay),
  "TINGG": assetSrc(tingg),
  "TRANSFER-RAPID": assetSrc(transferRapid),
  "TRUSTLY": assetSrc(trustly),
  "TRUSTPAY": assetSrc(trustpay),
  "UNIONPAY-INTERNATIONAL": assetSrc(unionpayInternational),
  "VERTUPAY": assetSrc(vertupay),
  "VIRTUALPAY": assetSrc(virtualpay),
  "VISA": assetSrc(visa),
  "VLOAD": assetSrc(vload),
  "VOLET": assetSrc(volet),
  "WEBMONEY": assetSrc(webmoney),
  "WESTERNUNION": assetSrc(westernunion),
  "WIRE-TRANSFER": assetSrc(wireTransfer),
  "WISE": assetSrc(wise),
  "WORLDPAY": assetSrc(worldpay),
  "X-PAY": assetSrc(xPay),
  "ZOTAPAY": assetSrc(zotapay),
  "CRYPTOCURRENCY-PAYMENTS": assetSrc(cyptocurrencyPayments),
  "FRILLPAY": assetSrc(frillpay),
  "HWGC": assetSrc(hwgc),
  "ALIPAY": assetSrc(alipay),
};

type Props = {
  method?: string | null;
  className?: string;
};

const iconSlotClassName =
  "inline-flex h-7 w-[4.5rem] shrink-0 items-center justify-center";

export function FundingMethodIcon({
  method,
  className,
}: Props) {
  const code = method?.trim().toUpperCase();
  const src = code ? icons[code] : undefined;

  if (!src) {
    return (
      <span className={cn(iconSlotClassName, className)}>
        <CircleDollarSign
          className="size-7 text-muted-foreground"
          aria-label={code ?? "Funding method"}
        />
      </span>
    );
  }

  return (
    <span className={cn(iconSlotClassName, className)}>
      <img
        src={src}
        alt={code ?? ""}
        className="h-full w-full object-contain object-center"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
