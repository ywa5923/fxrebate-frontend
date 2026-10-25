import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import type { BrokerRatingsData } from "@/types";
import BrokerRatingsContent from "./BrokerRatingsContent";

type Props = {
  brokerId: string;
  locale: string;
};

export default async function BrokerRatingsSection({ brokerId, locale }: Props) {
  const response = await apiClient<BrokerRatingsData>(
    `/brokers/${encodeURIComponent(brokerId)}/ratings`,
    UseTokenAuth.Yes,
    { method: "GET", cache: "no-store" },
    ErrorMode.Return,
  );

  if (!response.success || !response.data) {
    return (
      <div role="alert" className="my-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Ratings and reviews could not be loaded. Please reload the page to try again.</p>
      </div>
    );
  }

  return (
    <BrokerRatingsContent
      ratings={response.data.ratings ?? []}
      reviews={response.data.reviews ?? []}
      locale={locale === "gr" ? "el" : locale}
    />
  );
}
