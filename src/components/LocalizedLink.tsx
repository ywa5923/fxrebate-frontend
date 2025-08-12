"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { useTranslation } from "@/providers/translations";

interface LocalizedLinkProps {
  routeKey: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

interface Translations {
  locales: Record<string, string>;
  navbar: Record<string, string>;
  'route-maps': Record<string, string>;
}

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
  const { locale } = useParams();
  const lang = locale as string;
  
  // Skip translation for English
  if (lang === 'en') {
    return (
      <Link href={routeKey} className={className} {...props}>
        {children}
      </Link>
    );
  }

  const _t = useTranslation();
  const localizedPath = getLocalizedPath(routeKey, _t['route-maps'] as Record<string, string>);

  console.log("routeKey~~~~~~~~~~~~~~~~",routeKey);
  console.log("localizedPath~~~~~~~~~~~~~~~~",localizedPath);
  console.log("routes~~~~~~~~~~~~~~~~",_t['route-maps']);
  const href = `/${lang}${localizedPath.startsWith('/') ? localizedPath : `/${localizedPath}`}`;

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}