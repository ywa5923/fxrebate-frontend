"use client";

import { Option } from "@/types";
import { DynamicForm } from "@/components/DynamicForm";
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
import { deleteDynamicTable } from "@/lib/deleteDynamicTable";

interface EvaluationStepsProps {
  broker_id: number;
  evaluationSteps?: DynamicTableRow[];
  options: Option[];
  is_admin?: boolean;
}

export default function EvaluationSteps({
  broker_id,
  evaluationSteps,
  options,
  is_admin = false,
}: EvaluationStepsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    evaluationSteps?.[0]?.id?.toString() || "",
  );
  const [showNewStep, setShowNewStep] = useState(false);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState<number | null>(
    null,
  );
  const router = useRouter();
  const prevStepsLength = useRef(evaluationSteps?.length || 0);

  useEffect(() => {
    if (evaluationSteps && evaluationSteps.length > prevStepsLength.current) {
      setActiveTab(
        evaluationSteps[evaluationSteps.length - 1].id.toString(),
      );
    } else if (
      evaluationSteps &&
      evaluationSteps.length > 0 &&
      !evaluationSteps.some((row) => row.id.toString() === activeTab)
    ) {
      setActiveTab(evaluationSteps[0].id.toString());
    }
    prevStepsLength.current = evaluationSteps?.length || 0;
  }, [evaluationSteps, activeTab]);

  async function handleDeleteStep(stepId: number) {
    try {
      await deleteDynamicTable("evaluation-steps", stepId, broker_id);
      toast.success("Evaluation step deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete evaluation step");
      console.log("DELETE EVALUATION STEP ERROR", error);
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
              Evaluation steps
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Configuration & Settings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNewStep(!showNewStep)}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
            showNewStep
              ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
          )}
          title={showNewStep ? "Cancel" : "New evaluation step"}
        >
          {showNewStep ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {showNewStep && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">
            New evaluation step
          </p>
          <Card className="w-full border-0 shadow-none bg-[#ffffff] dark:bg-transparent">
            <CardContent>
              <DynamicForm
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
                  setShowNewStep(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="evaluation-step"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {evaluationSteps && evaluationSteps.length > 0 ? (
        <>
          <div className="mb-2">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-gray-200 dark:border-gray-700">
              {evaluationSteps.map((row, index) => {
                const isActive = activeTab === row.id.toString();
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setActiveTab(row.id.toString())}
                    className={cn(
                      "relative px-5 py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium",
                    )}
                  >
                    <span className="hidden sm:inline">
                      Step {index + 1}
                    </span>
                    <span className="sm:hidden">St {index + 1}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {evaluationSteps.map((row) => (
            <div
              key={row.id}
              className={cn(
                "bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-px border border-dashed border-gray-200 dark:border-gray-700",
                activeTab === row.id.toString() ? "block" : "hidden",
              )}
            >
              {row.option_values && row.option_values.length > 0 ? (
                <>
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      ID: {row.id}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      onClick={() => setConfirmDeleteStep(row.id)}
                      title="Delete evaluation step"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <DynamicForm
                    broker_id={broker_id}
                    options={options}
                    optionsValues={row.option_values}
                    action={submitBrokerProfile}
                    is_admin={is_admin}
                    entity_id={row.id}
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
                    This step has no option values to configure.
                  </p>
                </div>
              )}
            </div>
          ))}

          <Dialog
            open={!!confirmDeleteStep}
            onOpenChange={(open) => {
              if (!open) setConfirmDeleteStep(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete this evaluation step?
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">This action cannot be undone.</div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteStep(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDeleteStep) {
                      handleDeleteStep(confirmDeleteStep);
                      setConfirmDeleteStep(null);
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
        !showNewStep && (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
              No evaluation steps found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Use the + button in the header to get started.
            </p>
          </div>
        )
      )}
    </div>
  );
}
