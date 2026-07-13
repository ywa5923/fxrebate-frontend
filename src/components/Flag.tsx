type FlagProps = {
    country: string;
    className?: string;
  };
  
  export function Flag({ country, className = "" }: FlagProps) {
    return (
      <span
        className={`fi fi-${country.toLowerCase()} ${className}`}
        aria-label={country}
      />
    );
  }