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
import { InfoSection } from "@/types/InfoSections";
import { cn } from "@/lib/utils";
import { InfoHorizontalLayout } from "./InfoHorizontalLayout";
import { InfoVerticalLayout, getVerticalDialogMaxWidthClass } from "./InfoVerticalLayout";
import {
  getVisibleSections,
  type InfoSectionsLayout,
} from "./OptionInfoSectionsShared";

type Props = {
  infoSections: InfoSection[];
  optionName?: string;
  isAdmin?: boolean;
  layout?: InfoSectionsLayout;
  className?: string;
};

export function OptionInfoSections({
  infoSections,
  optionName,
  isAdmin,
  layout = "vertical",
  className,
}: Props) {
  if (!infoSections.length) {
    return null;
  }

  const visibleSections = getVisibleSections(infoSections, isAdmin);
  if (!visibleSections.length) {
    return null;
  }

  const dialogMaxWidthClass =
    layout === "horizontal"
      ? "sm:max-w-3xl"
      : getVerticalDialogMaxWidthClass(visibleSections.length);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 rounded-full px-3 text-xs font-medium shadow-none",
            "bg-green-100 text-green-800",
            "hover:bg-green-200 hover:text-green-950",
            "dark:bg-green-950/40 dark:text-green-400",
            "dark:hover:bg-green-900/60 dark:hover:text-green-300",
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
        className={cn("max-h-[85vh] overflow-y-auto", dialogMaxWidthClass)}
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
                <span className="block text-sm font-medium text-muted-foreground dark:text-green-100/70">
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
        {layout === "horizontal" ? (
          <InfoHorizontalLayout
            sections={visibleSections}
            isAdmin={isAdmin}
          />
        ) : (
          <InfoVerticalLayout sections={visibleSections} isAdmin={isAdmin} />
        )}
      </DialogContent>
    </Dialog>
  );
}
