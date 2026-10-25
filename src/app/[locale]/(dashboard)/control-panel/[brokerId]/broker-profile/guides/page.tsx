import { BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-actions";
import { isSuperAdmin } from "@/lib/permissions";

type Props = {
  params: Promise<{ locale: string; brokerId: string }>;
};

export default async function BrokerGuidesPage({ params }: Props) {
  const { locale, brokerId } = await params;
  const user = await isAuthenticated();

  if (!user) redirect(`/${locale}`);
  if (!isSuperAdmin(user)) notFound();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="flex items-start gap-3 border-b border-gray-200 pb-5 dark:border-gray-800">
        <BookOpen className="mt-1 size-6 shrink-0 text-gray-700 dark:text-gray-300" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Guides
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Broker #{brokerId}
          </p>
        </div>
      </header>
      <p className="py-12 text-sm text-gray-500 dark:text-gray-400">
        No guides yet.
      </p>
    </section>
  );
}
