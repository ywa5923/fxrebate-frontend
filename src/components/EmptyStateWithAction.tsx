import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  messages: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  href: string;
  className?: string;
};

export function EmptyStateWithAction({
  messages,
  href,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-12 text-center sm:px-6 sm:py-14",
        "dark:border-gray-700 dark:bg-gray-900/30",
        className,
      )}
    >
      <span
        className={cn(
          "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed",
          "border-gray-300 bg-white text-gray-400",
          "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
        )}
      >
        <ArrowRight className="h-8 w-8" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {messages.title}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {messages.description}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-900"
      >
        {messages.buttonLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
