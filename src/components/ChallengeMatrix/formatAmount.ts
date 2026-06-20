export function formatAmount(
  amount: string,
  currency: string | null,
  locale: string,
) {
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return currency ? `${amount} ${currency}` : amount;
  }

  try {
    if (!currency) {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return currency ? `${amount} ${currency}` : amount;
  }
}
