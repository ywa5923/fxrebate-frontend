"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "@/providers/translations";

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Original route without a language prefix, e.g. /brokers. */
  routeKey: string;
  children: ReactNode;
};

function getLocalizedPath(routeKey: string, urls: Record<string, string>): string {
  // Direct match for static routes
  if (urls[routeKey]) {
    return urls[routeKey];
  }

  // Handle dynamic routes
  for (const [source, destination] of Object.entries(urls)) {
    const sourceRegex = new RegExp(
      "^" + source.replace(/:([a-zA-Z0-9_]+)/g, "([^/]+)") + "$"
    );
    const match = routeKey.match(sourceRegex);

    if (match) {
      const dynamicParams = match.slice(1);
      const paramNames = source.match(/(?<=:)[a-zA-Z0-9_]+/g) || [];
      
      return paramNames.reduce((path, paramName, index) => 
        path.replace(`:${paramName}`, dynamicParams[index]), 
        destination
      );
    }
  }

  return routeKey;
}

export default function LocalizedLink({ 
  routeKey, 
  children,
  className,
  ...props
}: LocalizedLinkProps) {
  const { locale } = useParams<{ locale: string }>();
  const { translations } = useTranslation();

  const { pathname, search, hash } = new URL(routeKey, "https://localized-link.invalid");
  const localePrefix = `/${locale}`;
  // Support existing callers that still supply the current language prefix.
  const sourcePath = pathname === localePrefix
    ? "/"
    : pathname.startsWith(`${localePrefix}/`) ? pathname.slice(localePrefix.length) : pathname;
  const localizedPath = getLocalizedPath(sourcePath, (translations['route-maps'] ?? {}) as Record<string, string>);

  const localizedSuffix = localizedPath === "/"
    ? ""
    : localizedPath.startsWith("/") ? localizedPath : `/${localizedPath}`;
  const href = `${localePrefix}${localizedSuffix}${search}${hash}`;

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
