"use client";

import { ChallengeStep, ChallengeType } from "@/types";
import StepItem from "./StepItem";
import AddTabBtn from "./AddTabBtn";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { toast } from "sonner";
import logger from "@/lib/logger";

interface StepsContainerProps {
  steps: ChallengeStep[];
  isEditingHiddenState: boolean;
  handleStepClick: (step: ChallengeStep) => void;
  openDeleteConfirmation: (
    type: "category" | "step" | "amount",
    id: number,
    name: string,
  ) => void;
  activeStepId: number;
  brokerId: number;
  selectedCategory: ChallengeType | undefined;
  categories: ChallengeType[];
  defaultCategories: ChallengeType[];
}

export default function StepsContainer({
  steps,
  isEditingHiddenState,
  handleStepClick,
  openDeleteConfirmation,
  activeStepId,
  brokerId,
  selectedCategory,
  categories,
  defaultCategories,
}: StepsContainerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let log = logger.child('ChallengeMatrix/StepsContainer');

  const [optimisticSteps, setOptimisticSteps] = useOptimistic(
    steps,
    (_state, newSteps: ChallengeStep[]) => newSteps,
  );

  const saveLink = `/challenges/${brokerId}/tabs/step/order`;

  const handleSaveOrder = async (newOrder: ChallengeStep[]) => {
    startTransition(async () => {
      setOptimisticSteps(newOrder);

      try {
        const response = await apiClient<any>(saveLink, UseTokenAuth.Yes, {
          method: "PUT",
          body: JSON.stringify({ tab_ids: newOrder.map((step) => step.id) }),
        }, ErrorMode.Return);

        if (!response.success) {
          toast.error("Failed to save step order");
          log.error('handleSaveOrder', { error: response.message, brokerId, context: { data: JSON.stringify({ tab_ids: newOrder.map((s) => s.id) }) } });
        } else {
          toast.success("Step order saved successfully");
          router.refresh();
        }
      } catch (error) {
        toast.error("Network error while saving step order");
        log.error('handleSaveOrder', { error, brokerId, context: { data: JSON.stringify({ tab_ids: newOrder.map((s) => s.id) }) } });
      }
    });
  };

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;
        if (isSortable(source)) {
          const { initialIndex, index } = source;

          if (initialIndex !== index) {
            const newItems = [...optimisticSteps];
            const [removed] = newItems.splice(initialIndex, 1);
            newItems.splice(index, 0, removed);
            handleSaveOrder(newItems);
          }
        }
      }}
    >
      <div className="min-h-[48px] md:min-h-[56px] flex items-center justify-center px-2">
        {isPending && (
          <div className="absolute top-2 right-2">
            <span className="text-xs text-muted-foreground">Saving...</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center items-center gap-2 w-full">
          {optimisticSteps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              isEditingHiddenState={isEditingHiddenState}
              handleStepClick={handleStepClick}
              openDeleteConfirmation={openDeleteConfirmation}
              isActive={activeStepId === step.id}
            />
          ))}

          {isEditingHiddenState && (
            <span className="inline-flex flex-shrink-0 self-center">
              <AddTabBtn
                tabType="step"
                selectedCategory={selectedCategory}
                categories={categories}
                defaultCategories={defaultCategories}
                addApiUrl={`/challenges/step/${brokerId ?? 0}`}
              />
            </span>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
}
