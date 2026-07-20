type Props = {
    currency: string;
    className?: string;
  };
  
  const currencyToCountry: Record<string, string> = {
    USD: "US",
    EUR: "EU",
    GBP: "GB",
    JPY: "JP",
    CHF: "CH",
    CAD: "CA",
    AUD: "AU",
    NZD: "NZ",
    CNY: "CN",
    HKD: "HK",
    SGD: "SG",
    INR: "IN",
    BRL: "BR",
    ZAR: "ZA",
    MXN: "MX",
    TRY: "TR",
    RUB: "RU",
    RON: "RO",
    PLN: "PL",
    SEK: "SE",
    NOK: "NO",
    DKK: "DK",
    CZK: "CZ",
    HUF: "HU",
    AED: "AE",
    SAR: "SA",
    QAR: "QA",
    KWD: "KW",
    BHD: "BH",
    OMR: "OM",
    ILS: "IL",
    EGP: "EG",
    NGN: "NG",
    KES: "KE",
    GHS: "GH",
    IDR: "ID",
    MYR: "MY",
    THB: "TH",
    VND: "VN",
    PHP: "PH",
    PKR: "PK",
    BDT: "BD",
    LKR: "LK",
    ARS: "AR",
    CLP: "CL",
    COP: "CO",
    PEN: "PE",
    UYU: "UY",
    UAH: "UA",
    KZT: "KZ",
    RSD: "RS",
  //  ALL: "AL", This is not a country, so we don't need to add it to the list
  };
  
  export function FiatCurrencyIcon({
    currency,
    className = "",
  }: Props) {
    const code = currency?.trim().toUpperCase();
  
    const country = code ? currencyToCountry[code] : undefined;
  
    if (!country) {
      return null;
    }
  
    return (
      <span
        className={`fi fi-${country.toLowerCase()} inline-block shrink-0 ${className}`}
        aria-label={currency}
      />
    );
  }