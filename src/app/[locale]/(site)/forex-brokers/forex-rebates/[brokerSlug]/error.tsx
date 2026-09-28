"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrokerRebateDetailError({
  unstable_retry,
}: {
  unstable_retry: () => void;
}) {
  return (
    <main className="flex min-h-[50vh] items-center bg-white px-6 py-20 text-[#0c110f] dark:bg-[#0c110f] dark:text-white">
      <div role="alert" className="mx-auto w-full max-w-[1360px]">
        <h1 className="text-2xl font-bold">This page could not be loaded</h1>
        <p className="mt-3 text-sm text-[#0c110f]/70 dark:text-white/70">
          The page content is unavailable right now. Please try again.
        </p>
        <Button type="button" onClick={unstable_retry} className="mt-6 bg-[#0c110f] text-white hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#0c110f] dark:hover:bg-white/90">
          <RefreshCw className="size-4" aria-hidden />
          Try again
        </Button>
      </div>
    </main>
  );
}
