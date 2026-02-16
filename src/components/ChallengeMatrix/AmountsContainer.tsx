import { ChallengeAmount, ChallengeType } from "@/types";
import AmountItem from "./AmountItem";
import AddTabBtn from "./AddTabBtn";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useState, useEffect } from "react";

interface AmountsContainerProps {
  amounts: ChallengeAmount[];
  isEditingHiddenState: boolean;
  handleAmountClick: (amount: ChallengeAmount) => void;
  openDeleteConfirmation: (
    type: "category" | "step" | "amount",
    id: number,
    name: string,
  ) => void;
  activeAmountId: number;
  brokerId: number;
  selectedCategory: ChallengeType | undefined;
  categories: ChallengeType[];
  defaultCategories: ChallengeType[];
}

export default function AmountsContainer({
  amounts,
  isEditingHiddenState,
  handleAmountClick,
  openDeleteConfirmation,
  activeAmountId,
  brokerId,
  selectedCategory,
  categories,
  defaultCategories,
}: AmountsContainerProps) {
  const [orderedAmounts, setOrderedAmounts] = useState(amounts);

  useEffect(() => {
    setOrderedAmounts(amounts);
  }, [amounts]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;

        if (isSortable(source)) {
          const { initialIndex, index } = source;

          if (initialIndex !== index) {
            setOrderedAmounts((items) => {
              const newItems = [...items];
              const [removed] = newItems.splice(initialIndex, 1);
              newItems.splice(index, 0, removed);
              return newItems;
            });
          }
        }
      }}
    >
      <div className="min-h-[40px] md:min-h-[48px] flex items-center justify-center px-2">
        <div className="flex flex-wrap justify-center items-center gap-2 w-full">
          {orderedAmounts.map((amount, index) => (
            <AmountItem
              key={amount.id}
              amount={amount}
              index={index}
              isEditingHiddenState={isEditingHiddenState}
              handleAmountClick={handleAmountClick}
              openDeleteConfirmation={openDeleteConfirmation}
              isActive={activeAmountId === amount.id}
            />
          ))}

          {isEditingHiddenState && (
            <span className="inline-flex flex-shrink-0 self-center">
              <AddTabBtn
                tabType="amount"
                selectedCategory={selectedCategory}
                categories={categories}
                defaultCategories={defaultCategories}
                addApiUrl={`/challenges/amount/${brokerId ?? 0}`}
              />
            </span>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
}
