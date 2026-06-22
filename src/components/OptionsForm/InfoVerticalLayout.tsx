import { InfoSection } from "@/types/InfoSections";
import { cn } from "@/lib/utils";
import { InfoSectionContent } from "./OptionInfoSectionsShared";

const GRID_COLS_CLASS: Record<1 | 2 | 3, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

type Props = {
  sections: InfoSection[];
  isAdmin?: boolean;
};

export function getVerticalDialogMaxWidthClass(sectionCount: number): string {
  const columnCount = Math.min(sectionCount, 3) as 1 | 2 | 3;
  const widths: Record<1 | 2 | 3, string> = {
    1: "sm:max-w-lg",
    2: "sm:max-w-3xl",
    3: "sm:max-w-5xl",
  };
  return widths[columnCount];
}

export function InfoVerticalLayout({ sections, isAdmin }: Props) {
  const columnCount = Math.min(sections.length, 3) as 1 | 2 | 3;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 md:gap-10",
        GRID_COLS_CLASS[columnCount],
      )}
    >
      {sections.map((section, index) => (
        <InfoSectionContent
          key={section.id ?? `${section.title}-${index}`}
          section={section}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
