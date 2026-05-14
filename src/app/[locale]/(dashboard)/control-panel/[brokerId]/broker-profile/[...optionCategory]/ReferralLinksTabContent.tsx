"use client";

import {  Pencil, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AffiliateLink } from "@/types/Url";


const iconShellClass: Record<"ib" | "sub_ib", string> = {
  ib: "bg-green-100 dark:bg-green-900/50",
  sub_ib: "bg-blue-100 dark:bg-blue-900/50",
};

const iconGlyphClass: Record<"ib" | "sub_ib", string> = {
  ib: "text-green-600 dark:text-green-400",
  sub_ib: "text-blue-600 dark:text-blue-400",
};

export type Props = {
  links: AffiliateLink[];
  is_admin: boolean;
  onAddClick: () => void;
  onEditRow: (row: AffiliateLink) => void;
  onRequestDelete: (id: number) => void;
};
//link metadata example
// {
//   "updated_fields": [],
//   "previous_relations_values": {
//     "previous_platform_urls": [
//       "2222222222222",
//       "asxz",
//       "link nou"
//     ],
//     "previous_account_type_id": 27,
//     "previous_account_type_name": "My first account2"
//   }
// }

export function ReferralLinksTabContent({
  links,
  is_admin,
  onAddClick,
  onEditRow,
  onRequestDelete,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="border border-dashed border-gray-200 dark:border-gray-800 bg-[#fdfdfd] dark:bg-gray-800/40">
        <CardHeader className="flex flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4" />
            Add link
          </Button>
        </CardHeader>

        <CardContent className="pt-2">
          {links.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No referral links yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((row) => {
                const isUpdated = row.is_updated_entry === 1;
                const displayName = is_admin
                  ? row.public_name ?? row.name
                  : row.name;
                const displayUrl = is_admin
                  ? row.public_url ?? row.url
                  : row.url;

                return (
                  <div
                    key={row.id}
                    className={cn(
                      "border rounded-lg p-4 flex items-start justify-between gap-3",
                      is_admin && isUpdated
                        ? "border-red-400/90 dark:border-red-700"
                        : "border-gray-200 dark:border-gray-700",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {row.is_master_link ? (
                          <span className="text-xs text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-full">
                            Master Link
                          </span>
                        ) : (
                          <span className="text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {row.account_type_name}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-words">
                        <span className="font-semibold">
                          {displayName}
                        </span>
                        
                      </div>

                      <div className="mt-1 text-sm">
                        <a
                          href={displayUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 underline break-all"
                          title={displayUrl}
                        >
                          {displayUrl}
                        </a>
                        </div>
                        
                         {is_admin && row.is_updated_entry === 1 && (
                        <div className="mt-1 text-sm">
                        <span className="text-xs text-red-700 dark:text-gray-200">
                           Updated fields: {row.metadata?.updated_fields?.join(", ")}
                        </span>
                         </div>
                        )}
                      
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                        onClick={() => onEditRow(row)}
                        title="Edit"
                        aria-label="Edit referral link"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                        onClick={() => onRequestDelete(row.id)}
                        title="Delete"
                        aria-label="Delete referral link"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  
                    {/* is_admin && row.metadata && (
                      <div className="mt-1 text-sm">
                        <pre className="text-xs text-gray-700 dark:text-gray-200">
                          
                          {JSON.stringify(row.metadata, null, 2)}
                        </pre>
                      </div>
                    )*/}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
