"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { FileWarning, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import logger from "@/lib/logger";
import { Providers } from "@/providers/Theme";

// Error recovery must remain available when translations cannot be loaded.
const messages = {
  en: {
    title: "This page is temporarily unavailable",
    description: "We couldn't load this page. Please try again in a moment.",
    retry: "Try again",
    retrying: "Trying again...",
    home: "Go to home",
  },
  ro: {
    title: "Pagina este momentan indisponibilă",
    description: "Nu am putut încărca această pagină. Te rugăm să încerci din nou în câteva momente.",
    retry: "Încearcă din nou",
    retrying: "Se reîncearcă...",
    home: "Pagina principală",
  },
  fr: {
    title: "Cette page est momentanément indisponible",
    description: "Impossible de charger cette page. Veuillez réessayer dans quelques instants.",
    retry: "Réessayer",
    retrying: "Nouvelle tentative...",
    home: "Accueil",
  },
  gr: {
    title: "Η σελίδα δεν είναι διαθέσιμη προσωρινά",
    description: "Δεν ήταν δυνατή η φόρτωση αυτής της σελίδας. Δοκιμάστε ξανά σε λίγο.",
    retry: "Δοκιμάστε ξανά",
    retrying: "Νέα προσπάθεια...",
    home: "Αρχική σελίδα",
  },
};

type Props = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

const log = logger.child("site/error");

export default function SiteError({ error, unstable_retry }: Props) {
  const { locale } = useParams<{ locale?: string }>();
  const page = usePathname();
  const [pending, startTransition] = useTransition();
  const language = locale && Object.hasOwn(messages, locale) ? locale as keyof typeof messages : "en";
  const text = messages[language];

  useEffect(() => {
    log.error("Page could not be rendered", {
      event: "page_render_failed",
      description: "Next.js displayed the error page after a rendering or data-loading failure.",
      page,
      locale,
      digest: error.digest,
      error: { name: error.name, message: error.message, stack: error.stack },
    });
  }, [error, page, locale]);

  return (
    <Providers>
      <main className="flex min-h-[65vh] items-center justify-center bg-white px-6 py-16 text-[#0c110f] dark:bg-[#0c110f] dark:text-white sm:py-24">
        <div role="alert" aria-labelledby="page-error-title" className="w-full max-w-xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <FileWarning className="size-7" aria-hidden />
          </div>
          <h1 id="page-error-title" className="text-2xl font-semibold leading-tight [overflow-wrap:anywhere] sm:text-3xl">
            {text.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {text.description}
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              disabled={pending}
              aria-busy={pending}
              onClick={() => startTransition(() => unstable_retry())}
              className="h-auto min-h-11 min-w-40 whitespace-normal bg-[#0c110f] px-5 py-2 text-white hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#0c110f] dark:hover:bg-neutral-200"
            >
              <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden />
              {pending ? text.retrying : text.retry}
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-11 whitespace-normal border-neutral-300 bg-transparent px-5 py-2 dark:border-neutral-700">
              <Link href={`/${language}`}>
                <Home className="size-4" aria-hidden />
                {text.home}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </Providers>
  );
}
