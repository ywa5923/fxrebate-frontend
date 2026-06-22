import { InfoSection } from "@/types/InfoSections";
import { cn } from "@/lib/utils";
import { InfoSectionContent } from "./OptionInfoSectionsShared";

type Props = {
  sections: InfoSection[];
  isAdmin?: boolean;
};

export function InfoHorizontalLayout({ sections, isAdmin }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {sections.map((section, index) => (
        <div
          key={section.id ?? `${section.title}-${index}`}
          className={cn(
            "min-w-0",
            index < sections.length - 1 &&
              "border-b border-border pb-10 dark:border-green-900/40",
          )}
        >
          <InfoSectionContent section={section} isAdmin={isAdmin} />
        </div>
      ))}
    </div>
  );
}
