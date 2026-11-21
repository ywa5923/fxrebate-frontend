"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Check, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBooleanValue, valueToText, type BrokerTableColumn } from "./reviews-table";

export default function BrokerTableCell({ value, config }: { value: unknown; config: BrokerTableColumn }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <EmptyCell />;
  }

  if (config.type === "boolean") {
    const boolean = getBooleanValue(value);
    if (boolean !== null) {
      const Icon = boolean ? Check : X;
      return (
        <span role="img" aria-label={boolean ? "Yes" : "No"}>
          <Icon
            aria-hidden="true"
            className={cn("size-5", boolean ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}
          />
        </span>
      );
    }
  }

  if (config.type === "image" && typeof value === "string") {
    return <Image src={value} alt="" width={34} height={34} unoptimized className="size-[34px] rounded-full object-cover" />;
  }
  if (config.type === "rating") return <RatingCell value={value} />;
  if (config.type === "urls") {
    return <UrlsCell value={value} label={config.label} expandable={config.show_more_btn === true} />;
  }

  const text = valueToText(value);
  if (!text.trim()) return <EmptyCell />;
  if (config.show_more_btn) {
    return <ExpandableContent key={text} label={config.label} preview={text}>{text}</ExpandableContent>;
  }
  return <span className="whitespace-normal [overflow-wrap:anywhere]">{text}</span>;
}

function EmptyCell() {
  return <span className="text-[#0c110f]/50 dark:text-gray-400">—</span>;
}

function ExpandableContent({
  preview,
  children,
  label,
  hasMore = false,
}: {
  preview: ReactNode;
  children: ReactNode;
  label: string;
  hasMore?: boolean;
}) {
  const id = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || expanded) return;
    // The observer runs after layout and when the available width changes.
    const observer = new ResizeObserver(() => {
      setOverflows(element.scrollWidth > element.clientWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div className="w-[220px] max-w-full space-y-1">
      <div
        ref={contentRef}
        id={id}
        className={cn("block", expanded ? "whitespace-normal [overflow-wrap:anywhere]" : "truncate")}
      >
        {expanded ? children : preview}
      </div>
      {(hasMore || overflows || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((current) => !current)}
          className="text-xs font-medium text-[#166344] underline underline-offset-2 hover:no-underline dark:text-green-300"
        >
          {expanded ? "Show less" : "Show more"}
          <span className="sr-only">: {label}</span>
        </button>
      )}
    </div>
  );
}

function RatingCell({ value }: { value: unknown }) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return <span>{valueToText(value)}</span>;
  const normalizedRating = Math.max(0, Math.min(5, rating));

  return (
    <span className="inline-flex flex-col gap-1 whitespace-nowrap">
      <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => {
          const fillPercent = Math.max(0, Math.min(1, normalizedRating - index)) * 100;
          return (
            <span key={index} className="relative size-[15px] shrink-0" aria-hidden="true">
              <Star className="absolute inset-0 size-[15px] fill-transparent stroke-[1.5] text-[#a3a7a5] dark:text-gray-600" />
              {fillPercent > 0 && (
                <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                  <Star className="size-[15px] max-w-none fill-[#f3b73f] stroke-[1.5] text-[#f3b73f]" />
                </span>
              )}
            </span>
          );
        })}
      </span>
      <span className="text-xs underline underline-offset-2">{rating.toFixed(1)}</span>
    </span>
  );
}

type CellLink = { label: string; href: string | null };

function UrlsCell({ value, label, expandable }: { value: unknown; label: string; expandable: boolean }) {
  const items = Array.isArray(value) ? value : [value];
  const links = items.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const entry = item as { label?: unknown; url?: unknown };
    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    const url = typeof entry.url === "string" ? entry.url.trim() : "";
    if (!label && !url) return [];
    return [{ label: label || url, href: getHttpUrl(url) }];
  });

  if (links.length === 0) return <EmptyCell />;

  const content = (
    <ul className="space-y-1 whitespace-normal [overflow-wrap:anywhere]">
      {links.map((link, index) => (
        <li key={`${link.href ?? link.label}-${index}`}>
          <UrlLink link={link} />
        </li>
      ))}
    </ul>
  );

  if (!expandable) return content;

  return (
    <ExpandableContent
      key={JSON.stringify(links)}
      label={label}
      preview={<UrlLink link={links[0]} />}
      hasMore={links.length > 1}
    >
      {content}
    </ExpandableContent>
  );
}

function UrlLink({ link }: { link: CellLink }) {
  return link.href ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-[#8b5e12] underline underline-offset-4 dark:text-[#e7cb91]"
    >
      {link.label}
    </a>
  ) : <span>{link.label}</span>;
}

function getHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch {
    return null;
  }
}
