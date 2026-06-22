"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoSection, InfoSectionItem } from "@/types/InfoSections";
import { cn } from "@/lib/utils";

type Props = {
  infoSections: InfoSection[];
  optionName?: string;
  isAdmin?: boolean;
  className?: string;
};

const GRID_COLS_CLASS: Record<1 | 2 | 3, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

const DIALOG_MAX_WIDTH_CLASS: Record<1 | 2 | 3, string> = {
  1: "sm:max-w-lg",
  2: "sm:max-w-3xl",
  3: "sm:max-w-5xl",
};

function getVisibleItems(
  items: InfoSectionItem[],
  isAdmin?: boolean,
): InfoSectionItem[] {
  if (isAdmin) {
    return items;
  }
  // Non-admin: hide unpublished items entirely.
  return items.filter((item) => item.published === true);
}

function InfoSectionItemBlock({
  item,
  isUnpublished,
}: {
  item: InfoSectionItem;
  isUnpublished?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-1",
        isUnpublished && "text-muted-foreground/60",
      )}
    >
      <h3
        className={cn(
          "text-sm font-semibold leading-snug",
          isUnpublished && "text-muted-foreground/70",
        )}
      >
        {item.title}
      </h3>
      {item.subtitle ? (
        <p
          className={cn(
            "text-sm font-medium",
            isUnpublished ? "text-muted-foreground/60" : "text-foreground/80",
          )}
        >
          {item.subtitle}
        </p>
      ) : null}
      {item.description ? (
        <p
          className={cn(
            "text-sm leading-relaxed",
            isUnpublished ? "text-muted-foreground/50 border-1 border-grey-500 p-2" : "text-muted-foreground",
          )}
        >
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

function InfoSectionColumn({
  section,
  isAdmin,
}: {
  section: InfoSection;
  isAdmin?: boolean;
}) {
  const items = getVisibleItems(section.items ?? [], isAdmin);

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-2">
        <h2 className="text-base font-semibold leading-snug">{section.title}</h2>
        {section.subtitle ? (
          <p className="text-sm font-medium text-foreground/80">
            {section.subtitle}
          </p>
        ) : null}
        {section.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {section.description}
          </p>
        ) : null}
      </div>
      {items.length > 0 ? (
        <div className="space-y-4 border-t pt-4">
          {items.map((item, index) => (
            <InfoSectionItemBlock
              key={item.id ?? `${item.title}-${index}`}
              item={item}
              isUnpublished={item.published === false}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OptionInfoSections({
  infoSections,
  optionName,
  isAdmin,
  className,
}: Props) {
  if (!infoSections.length) {
    return null;
  }

  const columnCount = Math.min(infoSections.length, 3) as 1 | 2 | 3;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 rounded-full px-3 text-xs font-medium shadow-none",
            "bg-sky-100 text-sky-800",
            "hover:bg-sky-200 hover:text-sky-950",
            "dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/60 dark:hover:text-sky-100",
            className,
          )}
          aria-label={
            optionName
              ? `View information for ${optionName}`
              : "View information"
          }
        >
          Learn more
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[85vh] overflow-y-auto",
          DIALOG_MAX_WIDTH_CLASS[columnCount],
        )}
      >
        {optionName ? (
          <DialogHeader className="gap-0 pb-1">
            <div className="flex items-start gap-3 pr-8">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  "border-2 border-dotted border-green-200 text-green-700",
                  "dark:border-green-900/50 dark:text-green-400",
                )}
              >
                <BookOpen className="size-5" aria-hidden />
              </div>
              <DialogTitle className="space-y-1 text-left leading-snug">
                <span className="block text-sm font-medium text-muted-foreground">
                  Learn more about
                </span>
                <span
                  className={cn(
                    "block text-xl font-semibold tracking-tight",
                    "bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent",
                    "dark:from-green-400 dark:to-emerald-300",
                  )}
                >
                  {optionName}
                </span>
              </DialogTitle>
            </div>
          </DialogHeader>
        ) : null}
        <div
          className={cn(
            "grid grid-cols-1 gap-6",
            GRID_COLS_CLASS[columnCount],
          )}
        >
          {infoSections.map((section, index) => (
            <InfoSectionColumn
              key={section.id ?? `${section.title}-${index}`}
              section={section}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
