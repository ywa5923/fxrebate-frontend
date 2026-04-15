"use client";

import { Link as LinkIcon, Pencil, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Url } from "@/types/Url";

export type ReferralLinkRow = Pick<
  Url,
  | "id"
  | "name"
  | "url"
  | "previous_name"
  | "public_name"
  | "previous_url"
  | "public_url"
  | "is_updated_entry"
  | "url_type"
  | "is_master_link"
> & {
  account_name: string;
  account_type_id: number | null;
};

const iconShellClass: Record<"ib" | "sub_ib", string> = {
  ib: "bg-green-100 dark:bg-green-900/50",
  sub_ib: "bg-blue-100 dark:bg-blue-900/50",
};

const iconGlyphClass: Record<"ib" | "sub_ib", string> = {
  ib: "text-green-600 dark:text-green-400",
  sub_ib: "text-blue-600 dark:text-blue-400",
};

export type ReferralLinksTabContentProps = {
  variant: "ib" | "sub_ib";
  title: string;
  description?: string;
  links: ReferralLinkRow[];
  is_admin: boolean;
  onAddClick: () => void;
  onEditRow: (row: ReferralLinkRow) => void;
  onRequestDelete: (id: number) => void;
};

export function ReferralLinksTabContent({
  variant,
  title,
  description = "Each row shows account_name and url_type.",
  links,
  is_admin,
  onAddClick,
  onEditRow,
  onRequestDelete,
}: ReferralLinksTabContentProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="border border-dashed border-gray-200 dark:border-gray-800 bg-[#fdfdfd] dark:bg-gray-800/40">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                iconShellClass[variant],
              )}
            >
              <LinkIcon className={cn("w-4 h-4", iconGlyphClass[variant])} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </div>
            </div>
          </div>

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
                  ? (row.public_name ?? "no data")
                  : row.name;
                const displayUrl = is_admin
                  ? (row.public_url ?? "no data")
                  : row.url;

                return (
                  <div
                    key={row.id}
                    className={cn(
                      "border rounded-lg p-4 flex items-start justify-between gap-3",
                      isUpdated
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
                            {row.account_name}
                          </span>
                        )}
                        <span className="text-xs text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-full">
                          {row.url_type}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-words">
                        <span className="font-semibold">
                          {displayName || "—"}
                        </span>
                        {is_admin ? (
                          <span className="ml-2 text-xs text-gray-700 dark:text-gray-200">
                            broker_value:{" "}
                            <span className="font-medium">
                              {row.name || "—"}
                            </span>
                            {" · "}
                            previous_value:{" "}
                            <span className="font-medium">
                              {row.previous_name ?? "—"}
                            </span>
                          </span>
                        ) : null}
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
                        {is_admin ? (
                          <span className="ml-2 text-xs text-gray-700 dark:text-gray-200">
                            broker_value:{" "}
                            <span className="font-medium">
                              {row.url || "—"}
                            </span>
                            {" · "}
                            previous_value:{" "}
                            <span className="font-medium">
                              {row.previous_url ?? "—"}
                            </span>
                          </span>
                        ) : null}
                      </div>
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
