type FlagProps = {
  country: string;
  className?: string;
};

export function Flag({ country, className = "" }: FlagProps) {
  const code = country?.trim().toLowerCase();

  if (!code || code.length !== 2) {
    return null;
  }

  return (
    <span
      className={`fi fi-${code} inline-block shrink-0 ${className}`}
      aria-label={country}
    />
  );
}