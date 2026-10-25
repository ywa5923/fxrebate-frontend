import { Suspense } from "react";
import { Star } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-actions";
import { isSuperAdmin } from "@/lib/permissions";
import BrokerRatingsSection from "./BrokerRatingsSection";
import BrokerRatingsSkeleton from "./BrokerRatingsSkeleton";
import BrokerRatingsFormDialog from "./BrokerRatingsFormDialog";
import ExternalMapingIdFormDialog from "./ExternalMapingIdFormDialog";

type Props = {
  params: Promise<{ locale: string; brokerId: string }>;
};

export default async function BrokerRatingsPage({ params }: Props) {
  const { locale, brokerId } = await params;
  const user = await isAuthenticated();

  if (!user) redirect(`/${locale}`);
  if (!isSuperAdmin(user)) notFound();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="border-b border-gray-200 pb-5 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Broker Ratings
            </h1>
            <div className="flex shrink-0 gap-1" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="size-5 fill-yellow-400 text-yellow-500" />
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ExternalMapingIdFormDialog key={`mapping:${brokerId}`} brokerId={brokerId} />
            <BrokerRatingsFormDialog key={brokerId} brokerId={brokerId} />
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Broker performance and client feedback.
        </p>
      </header>
      <Suspense key={`${brokerId}:${locale}`} fallback={<BrokerRatingsSkeleton />}>
        <BrokerRatingsSection brokerId={brokerId} locale={locale} />
      </Suspense>
    </section>
  );
}
