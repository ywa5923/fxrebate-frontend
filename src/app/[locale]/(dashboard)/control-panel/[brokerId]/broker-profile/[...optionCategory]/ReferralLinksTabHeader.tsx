"use client";

import type { LucideIcon } from "lucide-react";
import { Link as LinkIcon, StickyNote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReferralLinksTabId = "ib_links" | "sub_ib_links" | "notes";

const tabActiveClass: Record<ReferralLinksTabId, string> = {
  ib_links:
    "text-green-700 dark:text-green-300 border-b-2 border-green-600 dark:border-green-500",
  sub_ib_links:
    "text-blue-700 dark:text-blue-300 border-b-2 border-blue-600 dark:border-blue-500",
  notes:
    "text-green-700 dark:text-green-300 border-b-2 border-green-600 dark:border-green-500",
};

const tabs: Array<{
  id: ReferralLinksTabId;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: "ib_links", label: "IB Referral links", Icon: LinkIcon },
  { id: "sub_ib_links", label: "SUB-IB Referral links", Icon: LinkIcon },
  { id: "notes", label: "Notes", Icon: StickyNote },
];

export type ReferralLinksTabHeaderProps = {
  activeTab: ReferralLinksTabId;
  onTabChange: (tab: ReferralLinksTabId) => void;
};

export  function ReferralLinksTabHeader({
  activeTab,
  onTabChange,
}: ReferralLinksTabHeaderProps) {
  return (
    <div className="mb-4 border-b border-gray-200 dark:border-gray-800 flex gap-2">
      {tabs.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          className={cn(
            "rounded-none px-4 py-2 h-auto",
            activeTab === id
              ? tabActiveClass[id]
              : "text-gray-500 dark:text-gray-400",
          )}
          onClick={() => onTabChange(id)}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );
}
