"use client";

import { DynamicTableRow, Option } from "@/types";

import { NotFoundEntity } from "@/components/NotFoundEntity";
import { submitBrokerProfile } from "@/lib/optionValues-requests";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, Trash, LayoutGrid, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EvaluationStepLinks from "./EvaluationStepLinks";
import {
  LinkGroup,
  LinksGroupedByEntityId,
  LinksGroupedByType,
  LinksOptions,
} from "@/types/TypeLinks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import { OptionsForm } from "@/components/OptionsForm/OptionsForm";
interface Props {
  broker_id: number;
  evaluationSteps?: DynamicTableRow[];
  options: Option[];
  is_admin?: boolean;
  linksGroupedByEvaluationStepId: LinksGroupedByEntityId;
  masterLinksGroupedByType: LinksGroupedByType;
  linksGroups: LinkGroup[];
  linksOptions: LinksOptions;
}
//example of accountTypeUrls, grouped by acount_type_ID and then by url type,  and urls_groups
//it also contains master-links which is a group of urls that are not associated with any account type
//master links are shown in the section of every account type
//    {
//     '12': {
//       mobile: [Array],
//       webplatform: [Array],
//       swap: [Array],
//       commission: [Array]
//     },
//     'master-links': { mobile: [Array] }
//   },
//   url_groups: [ 'mobile', 'webplatform', 'swap', 'commission' ]

function scrollToBottom() {
  document
    .getElementById("bottom")
    ?.scrollIntoView({ behavior: "smooth", block: "end" });
}

export default function EvaluationSteps({
  broker_id,
  evaluationSteps = [],
  options,
  is_admin = false,
  linksGroupedByEvaluationStepId,
  masterLinksGroupedByType,
  linksGroups,
  linksOptions,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>(
    evaluationSteps[0]?.id?.toString() || "",
  );
  const [showNew, setShowNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<
    number | null
  >(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const router = useRouter();
  const prevEvaluationStepsLength = useRef(evaluationSteps.length);
  const thisLogger = logger.child("EvaluationSteps");
  useEffect(() => {
    // If a new account is added
    if (evaluationSteps.length > prevEvaluationStepsLength.current) {
      // Set active tab to the latest account (last in the array)
      setActiveTab(evaluationSteps[evaluationSteps.length - 1].id.toString());
      
    } else if (
      evaluationSteps.length > 0 &&
      !evaluationSteps.some((evaluationStep) => evaluationStep.id.toString() === activeTab)
    ) {
      // If current activeTab is invalid, set to first account
      setActiveTab(evaluationSteps[0].id.toString());
    }
    prevEvaluationStepsLength.current = evaluationSteps.length;
  }, [evaluationSteps, activeTab]);

  async function handleDeleteEvaluationStep(evaluationStepId: number) {
    try {
      // const response = await deleteAccountType(accountId,broker_id);
      const serverUrl =  `/evaluation-steps/${evaluationStepId}/broker/${broker_id}`;
      const response = await apiClient<DynamicTableRow>(
        serverUrl,
        UseTokenAuth.Yes,
        {
          method: "DELETE",
        },
      );
      if (response.success) {
        toast.success("Evaluation step deleted successfully!");
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to delete evaluation step");
        thisLogger.error("Failed to delete evaluation step", {
          error: response.message,
          context: { evaluationStepId, broker_id },
        });
      }
    } catch (error) {
      toast.error("Failed to delete evaluation step");
      thisLogger.error("DELETE EVALUATION STEP ERROR", {
        error: error,
        context: { evaluationStepId, broker_id },
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
              Accounts
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Configuration & Settings
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
            showNew
              ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
          )}
          title={showNew ? "Cancel" : "New Evaluation Step"}
        >
          {showNew ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* New Evaluation Step Form */}
      {showNew && (
        <div className="mb-6 border border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">
            New Evaluation Step
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
                  setShowNew(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="evaluation-step"
                onSuccess={() => setSavedSuccessfully(true)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      {evaluationSteps.length > 0 ? (
        <>
          <div className="mb-2">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-gray-200 dark:border-gray-700">
              {evaluationSteps.map((evaluationStep, index) => {
                const isActive = activeTab === evaluationStep.id.toString();
                return (
                  <button
                    key={evaluationStep.id}
                    onClick={() => setActiveTab(evaluationStep.id.toString())}
                    className={cn(
                      "relative px-5 py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium",
                    )}
                  >
                    <span className="hidden sm:inline">
                      Evaluation Step {index + 1}
                    </span>
                    <span className="sm:hidden">Evaluation Step {index + 1}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {evaluationSteps.map((evaluationStep, index) => (
            <div
              key={evaluationStep.id}
              id={`evaluation-step-tab-${evaluationStep.id}`}
              className={cn(
                "bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-px border border-dashed border-gray-200 dark:border-gray-700",
                activeTab === evaluationStep.id.toString() ? "block" : "hidden",
              )}
            >
              {evaluationStep.option_values && evaluationStep.option_values.length > 0 ? (
                <>
                  <div className="mt-3 flex items-center justify-end gap-2 mb-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      onClick={() => setConfirmDelete(evaluationStep.id)}
                      title="Delete evaluation step"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <OptionsForm
                    broker_id={broker_id}
                    options={options}
                    optionsValues={evaluationStep.option_values}
                    action={submitBrokerProfile}
                    is_admin={is_admin}
                    entity_id={evaluationStep.id}
                    entity_type="evaluation-step"
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
                    This evaluation step has no option values to configure.
                  </p>
                </div>
              )}

              <EvaluationStepLinks
                broker_id={broker_id}
                evaluation_step_id={evaluationStep.id}
                evaluation_step_name={null}
                  
                links={linksGroupedByEvaluationStepId[evaluationStep.id] ?? {}}
                master_links={masterLinksGroupedByType}
                links_groups={linksGroups}
                linksOptions={linksOptions}  
                is_admin={is_admin}
              />
            </div>
          ))}
          <div
            id="bottom"
            className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              End of evaluation step configuration — add and manage links in the
              sections above.
            </p>
          </div>
          <Dialog
            open={savedSuccessfully}
            onOpenChange={(open) => {
              if (!open) setSavedSuccessfully(false);
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="text-left">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60">
                    <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <DialogTitle>Evaluation step saved successfully</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      You can now complete the links associated with this
                      evaluation step in the sections below.
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={() => {
                    setSavedSuccessfully(false);
                    setTimeout(() => scrollToBottom(), 150);
                  }}
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Confirmation Dialog for Account Delete */}
          <Dialog
            open={!!confirmDelete}
            onOpenChange={(open) => {
              if (!open) setConfirmDelete(null);
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="text-left">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
                    <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <DialogTitle>Delete this evaluation step?</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      This action is permanent and cannot be undone.
                    </p>
                  </div>
                </div>
              </DialogHeader>
              
              <DialogFooter className="gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDelete) {
                      handleDeleteEvaluationStep(confirmDelete);
                      setConfirmDelete(null);
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
        !showNew && (
          <NotFoundEntity
            title="No accounts found"
            description="Click here or use the + button to add an account."
            onClick={() => setShowNew(true)}
            ariaLabel="Add account"
          />
        )
      )}
    </div>
  );
}
