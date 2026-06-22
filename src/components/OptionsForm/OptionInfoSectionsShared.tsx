import { ArrowDown } from "lucide-react";
import { InfoSection, InfoSectionItem } from "@/types/InfoSections";
import { cn } from "@/lib/utils";

export type InfoSectionsLayout = "vertical" | "horizontal";

export function getVisibleSections(
  sections: InfoSection[],
  isAdmin?: boolean,
): InfoSection[] {
  if (isAdmin) {
    return sections;
  }
  return sections.filter((section) => section.published === true);
}

export function getVisibleItems(
  items: InfoSectionItem[],
  isAdmin?: boolean,
): InfoSectionItem[] {
  if (isAdmin) {
    return items;
  }
  return items.filter((item) => item.published === true);
}

export function InfoSectionItemBlock({
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
          isUnpublished
            ? "text-muted-foreground/70 dark:text-muted-foreground/50"
            : "text-foreground dark:text-green-50",
        )}
      >
        {item.title}
      </h3>
      {item.subtitle ? (
        <p
          className={cn(
            "text-sm font-medium",
            isUnpublished
              ? "text-muted-foreground/60 dark:text-muted-foreground/45"
              : "text-foreground/80 dark:text-green-100/80",
          )}
        >
          {item.subtitle}
        </p>
      ) : null}
      {item.description ? (
        <p
          className={cn(
            "text-sm leading-relaxed",
            isUnpublished
              ? "text-muted-foreground/50 dark:text-muted-foreground/40"
              : "text-muted-foreground dark:text-green-100/60",
          )}
        >
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

export function InfoSectionContent({
  section,
  isAdmin,
}: {
  section: InfoSection;
  isAdmin?: boolean;
}) {
  const items = getVisibleItems(section.items ?? [], isAdmin);
  const isSectionUnpublished = section.published === false;

  return (
    <div
      className={cn(
        "min-w-0 space-y-4",
        isSectionUnpublished && "text-muted-foreground/60 dark:text-muted-foreground/45",
      )}
    >
      <div className="space-y-2">
        <h2
          className={cn(
            "text-lg font-semibold leading-snug",
            isSectionUnpublished
              ? "text-muted-foreground/70 dark:text-muted-foreground/50"
              : "text-foreground dark:text-green-50",
          )}
        >
          {section.title}
        </h2>
        {section.subtitle ? (
          <p
            className={cn(
              "text-sm font-medium",
              isSectionUnpublished
                ? "text-muted-foreground/60 dark:text-muted-foreground/45"
                : "text-foreground/80 dark:text-green-100/80",
            )}
          >
            {section.subtitle}
          </p>
        ) : null}
        {section.description ? (
          <p
            className={cn(
              "text-sm leading-relaxed",
              isSectionUnpublished
                ? "text-muted-foreground/50 dark:text-muted-foreground/40"
                : "text-muted-foreground dark:text-green-100/60",
            )}
          >
            {section.description}
          </p>
        ) : null}
      </div>
      {items.length > 0 ? (
        <>
          <div className="flex justify-center py-1" aria-hidden>
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                "border-2 border-dotted",
                isSectionUnpublished
                  ? "border-muted-foreground/30 text-muted-foreground/60 dark:border-muted-foreground/25 dark:text-muted-foreground/45"
                  : "border-green-200 text-green-700 dark:border-green-800/60 dark:text-green-400",
              )}
            >
              <ArrowDown className="size-3.5" />
            </div>
          </div>
          <div className="space-y-4 border-t border-border pt-4 dark:border-green-900/40">
            {items.map((item, index) => (
              <InfoSectionItemBlock
                key={item.id ?? `${item.title}-${index}`}
                item={item}
                isUnpublished={
                  isSectionUnpublished || item.published === false
                }
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
