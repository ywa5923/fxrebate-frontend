"use client";

import { Option } from "@/types";
import { OptionsForm } from "@/components/OptionsForm";
import { NotFoundEntity } from "@/components/NotFoundEntity";
import { submitBrokerProfile } from "@/lib/optionValues-requests";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, Trash, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DynamicTableRow } from "@/types";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";

interface ContestsProps {
  broker_id: number;
  contests?: DynamicTableRow[];
  options: Option[];
  is_admin?: boolean;
  can_edit?: boolean;
  can_manage?: boolean;
}

export default function Contests({
  broker_id,
  contests,
  options,
  is_admin = false,
  can_edit = true,
  can_manage = true,
}: ContestsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    contests?.[0]?.id?.toString() || "",
  );
  const [showNewContest, setShowNewContest] = useState(false);
  const [confirmDeleteContest, setConfirmDeleteContest] = useState<
    number | null
  >(null);
  const router = useRouter();
  const prevContestsLength = useRef(contests?.length || 0);
  const thisLogger = logger.child("ContestsComponent");

  useEffect(() => {
    if (contests && contests.length > prevContestsLength.current) {
      setActiveTab(contests[contests.length - 1].id.toString());
    } else if (
      contests &&
      contests.length > 0 &&
      !contests.some((contest) => contest.id.toString() === activeTab)
    ) {
      setActiveTab(contests[0].id.toString());
    }
    prevContestsLength.current = contests?.length || 0;
  }, [contests, activeTab]);

  async function handleDeleteContest(contestId: number) {
    try {
      const serverUrl = `/contests/${contestId}/broker/${broker_id}`;
      const response = await apiClient<DynamicTableRow>(
        serverUrl,
        UseTokenAuth.Yes,
        {
          method: "DELETE",
        },
      );
      if (response.success) {
        toast.success("Contest deleted successfully!");
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to delete contest");
        thisLogger.error("Failed to delete contest", {
          error: response.message,
          context: { contestId, broker_id },
        });
      }
    } catch (error) {
      toast.error("Failed to delete contest");
      thisLogger.error("Failed to delete contest", {
        error: error,
        context: { contestId, broker_id },
      });
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Contests
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Configuration & Settings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNewContest(!showNewContest)}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded-md transition-all duration-150 ring-1 ring-inset",
            showNewContest
              ? "ring-red-500/60 dark:ring-red-500/70 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "ring-gray-300 dark:ring-gray-500 text-gray-500 dark:text-gray-400 hover:ring-gray-400 dark:hover:ring-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
          )}
          title={showNewContest ? "Cancel" : "New Contest"}
        >
          {showNewContest ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {showNewContest && can_manage && (
        <div className="mb-6 border border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">
            New Contest
          </p>
          <Card className="w-full border-0 shadow-none bg-[#ffffff] dark:bg-transparent">
            <CardContent>
              <OptionsForm
                broker_id={broker_id}
                options={options}
                optionsValues={[]}
                action={async (
                  broker_id,
                  formData,
                  is_admin,
                  optionsValues,
                  entity_id,
                  entity_type,
                ) => {
                  await submitBrokerProfile(
                    broker_id,
                    formData,
                    is_admin,
                    optionsValues,
                    entity_id,
                    entity_type,
                  );
                  setShowNewContest(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="contest"
                can_edit={can_edit}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {contests && contests.length > 0 ? (
        <>
          <div className="mb-2">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-gray-200 dark:border-gray-700">
              {contests.map((contest, index) => {
                const isActive = activeTab === contest.id.toString();
                return (
                  <button
                    key={contest.id}
                    type="button"
                    onClick={() => setActiveTab(contest.id.toString())}
                    className={cn(
                      "relative px-5 py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium",
                    )}
                  >
                    <span className="hidden sm:inline">
                      Contest {index + 1}
                    </span>
                    <span className="sm:hidden">Cont {index + 1}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {contests.map((contest) => (
            <div
              key={contest.id}
              className={cn(
                "bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-px border border-dashed border-gray-200 dark:border-gray-700",
                activeTab === contest.id.toString() ? "block" : "hidden",
              )}
            >
              {contest.option_values && contest.option_values.length > 0 ? (
                <>
                  <div className="flex items-center justify-end gap-2 mt-2 mb-1">
                    {can_manage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 ring-1 ring-inset ring-red-500/50 dark:ring-red-500/60 hover:ring-red-500/70 dark:hover:ring-red-400/70 transition-colors"
                        onClick={() => setConfirmDeleteContest(contest.id)}
                        title="Delete contest"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <OptionsForm
                    broker_id={broker_id}
                    options={options}
                    optionsValues={contest.option_values}
                    action={submitBrokerProfile}
                    is_admin={is_admin}
                    entity_id={contest.id}
                    entity_type="contest"
                    can_edit={can_edit}
                  />
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No configuration available
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    This contest has no option values to configure.
                  </p>
                </div>
              )}
            </div>
          ))}

          <Dialog
            open={!!confirmDeleteContest}
            onOpenChange={(open) => {
              if (!open) setConfirmDeleteContest(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete this contest?
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">This action cannot be undone.</div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteContest(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDeleteContest) {
                      handleDeleteContest(confirmDeleteContest);
                      setConfirmDeleteContest(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        !showNewContest && (
          <NotFoundEntity
            title="No contests found"
            description={
              can_manage
                ? "Click here or use the + button to add a contest."
                : "No contests are configured for this broker yet."
            }
            onClick={can_manage ? () => setShowNewContest(true) : undefined}
            ariaLabel="Add contest"
          />
        )
      )}
    </div>
  );
}
