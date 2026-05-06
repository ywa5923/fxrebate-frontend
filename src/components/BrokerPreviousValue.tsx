type Props = {
  brokerValue?: string | null;
  previousValue?: string | null;
  className?: string;
  show?: "broker" | "previous" | "both";
};

export function BrokerPreviousValue({
  brokerValue,
  previousValue,
  className = "text-xs text-gray-600 dark:text-gray-400",
  show = "both",
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      {(show === "broker" || show === "both") && (
        <p className={className}>Broker value: {brokerValue ?? ""}</p>
      )}
      {(show === "previous" || show === "both") && (
        <p className={className}>Previous value: {previousValue ?? ""}</p>
      )}
    </div>
  );
}
