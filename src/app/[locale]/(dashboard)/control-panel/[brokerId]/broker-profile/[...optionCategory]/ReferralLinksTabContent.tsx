"use client";

import { ExternalLink, Link2, Pencil, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AffiliateLink } from "@/types/Url";

export type Props = {
  links: AffiliateLink[];
  is_admin: boolean;
  onAddClick: () => void;
  onEditRow: (row: AffiliateLink) => void;
  onRequestDelete: (id: number) => void;
};

export function ReferralLinksTabContent({
  links,
  is_admin,
  onAddClick,
  onEditRow,
  onRequestDelete,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="border border-dashed border-gray-200 bg-[#fdfdfd] shadow-none dark:border-gray-800 dark:bg-gray-800/40">
        <CardHeader className="flex flex-row items-center justify-end gap-3 pb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30 dark:hover:text-green-300"
            onClick={onAddClick}
          >
            <Plus className="h-4 w-4" />
            Add link
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center sm:py-16">
              <Link2
                className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                No referral links yet
              </p>
              <p className="mt-1.5 max-w-sm text-xs text-gray-500 dark:text-gray-400">
                Use the Add link button above to create your first link.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((row) => {
                const isUpdated = row.is_updated_entry === 1;
                const displayName = is_admin
                  ? (row.public_name ?? row.name)
                  : row.name;
                const displayUrl = is_admin
                  ? (row.public_url ?? row.url)
                  : row.url;

                return (
                  <article
                    key={row.id}
                    className={cn(
                      "group rounded-xl border bg-white p-4 transition-all duration-150 sm:p-5",
                      "dark:bg-gray-900/60",
                      is_admin && isUpdated
                        ? "border-red-300/80 shadow-sm dark:border-red-800/80"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            AccountType:
                          </span>{" "}
                          {row.is_master_link ? (
                            <span className="font-semibold text-amber-700 dark:text-amber-300">
                              Master Link
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {row.account_type_name}
                            </span>
                          )}
                        </p>

                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            Link Name:
                          </span>{" "}
                          <span className="font-semibold text-gray-900 break-words dark:text-gray-100">
                            {displayName}
                          </span>
                        </p>

                        <p className="flex items-start gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          <span className="shrink-0 font-medium text-gray-500 dark:text-gray-400">
                            URL:
                          </span>
                          <ExternalLink
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                            aria-hidden
                          />
                          <a
                            href={displayUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 font-medium text-gray-900 break-all transition-colors hover:text-green-700 dark:text-gray-100 dark:hover:text-green-400"
                            title={displayUrl}
                          >
                            {displayUrl}
                          </a>
                        </p>

                        {is_admin && isUpdated && (
                          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                            Updated fields:{" "}
                            {row.metadata?.updated_fields?.join(", ")}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 border border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
                          onClick={() => onEditRow(row)}
                          title="Edit"
                          aria-label="Edit referral link"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 border border-red-200 text-red-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-500 dark:hover:border-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          onClick={() => onRequestDelete(row.id)}
                          title="Delete"
                          aria-label="Delete referral link"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
