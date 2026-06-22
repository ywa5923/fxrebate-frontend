"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AffiliateLinkTabType } from "@/types/Url";

const tabActiveClass =
  "text-green-700 dark:text-green-300 border-b-2 border-green-600 dark:border-green-500";

const tabs: Array<{
  id: AffiliateLinkTabType;
  label: string;
}> = [
  {
    id: "sign-up-ib-affiliate-link",
    label: "Sign-up IB/ Affiliate Link",
  },
  {
    id: "sign-up-sub-ib-affiliate-link",
    label: "Sign-up SUB-IB/ Sub-Affiliate Link",
  },
  { id: "notes", label: "Notes" },
];

export type Props = {
  activeTab: AffiliateLinkTabType;
  onTabChange: (tab: AffiliateLinkTabType) => void;
};

export function ReferralLinksTabHeader({ activeTab, onTabChange }: Props) {
  return (
    <div className="mb-4 border-b border-gray-200 dark:border-gray-800 flex gap-2">
      {tabs.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          className={cn(
            "rounded-none px-4 py-2 h-auto",
            activeTab === id
              ? tabActiveClass
              : "text-gray-500 dark:text-gray-400",
          )}
          onClick={() => onTabChange(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
