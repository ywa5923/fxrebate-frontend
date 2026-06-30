export default function BrokerValue({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 mb-2">
      <span>{label}: {value}</span>
    </div>
  );
}