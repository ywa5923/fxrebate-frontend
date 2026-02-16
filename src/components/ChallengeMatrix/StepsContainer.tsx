import { ChallengeStep, ChallengeType } from "@/types";
import StepItem from "./StepItem";
import AddTabBtn from "./AddTabBtn";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useState, useEffect } from "react";

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
  const [orderedSteps, setOrderedSteps] = useState(steps);

  useEffect(() => {
    setOrderedSteps(steps);
  }, [steps]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;

        if (isSortable(source)) {
          const { initialIndex, index } = source;

          if (initialIndex !== index) {
            setOrderedSteps((items) => {
              const newItems = [...items];
              const [removed] = newItems.splice(initialIndex, 1);
              newItems.splice(index, 0, removed);
              return newItems;
            });
          }
        }
      }}
    >
      <div className="min-h-[48px] md:min-h-[56px] flex items-center justify-center px-2">
        <div className="flex flex-wrap justify-center items-center gap-2 w-full">
          {orderedSteps.map((step, index) => (
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
