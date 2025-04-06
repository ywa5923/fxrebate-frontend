
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getLocalizedPath } from "@/app/[lang]/layout";
import { ReactNode } from "react";

interface LocalizedLinkProps {
  routeKey: string; // Original route key (e.g., 'dashboard', 'users')
  children: ReactNode;
  className?: string;
  // Add other Link props as needed
}

export default function LocalizedLink({ 
  routeKey, 
  children,
  className,
  ...props
}: LocalizedLinkProps) {
  // Get current language from route params
  const params = useParams();
  const lang = params.locale as string;
  
  // Generate localized href
  const localizedPath = getLocalizedPath(routeKey, lang);
  const href = `/${lang}/${localizedPath}`;

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}