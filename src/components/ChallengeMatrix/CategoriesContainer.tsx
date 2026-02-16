import { ChallengeType } from "@/types";
import CategoryItem from "./CategoryItem";
import AddTabBtn from "./AddTabBtn";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useState, useEffect } from "react";

interface CategoriesContainerProps {
  categories: ChallengeType[];
  isEditingHiddenState: boolean;
  handleCategoryClick: (category: ChallengeType) => void;
  openDeleteConfirmation: (
    type: "category" | "step" | "amount",
    id: number,
    name: string,
  ) => void;
  activeCategoryId: number;
  brokerId: number;
  categoriesNotInBrokerList: ChallengeType[];
}

export default function CategoriesContainer({
  categories,
  isEditingHiddenState,
  handleCategoryClick,
  openDeleteConfirmation,
  categoriesNotInBrokerList,
  brokerId,
  activeCategoryId,
}: CategoriesContainerProps) {
    
  const [orderedCategories, setOrderedCategories] = useState(categories);

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { source } = event.operation;

        if (isSortable(source)) {
          const { initialIndex, index } = source;

          if (initialIndex !== index) {
            setOrderedCategories((items) => {
              const newItems = [...items];
              const [removed] = newItems.splice(initialIndex, 1);
              newItems.splice(index, 0, removed);
              return newItems;
            });
          }
        }
      }}
    >
      <div className="min-h-[60px] md:min-h-[72px] flex items-center justify-center px-2">
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full">
          {orderedCategories.map((category, index) => (
            <CategoryItem
              key={category.id}
              category={category}
              index={index}
              isEditingHiddenState={isEditingHiddenState}
              handleCategoryClick={handleCategoryClick}
              openDeleteConfirmation={openDeleteConfirmation}
              isActive={activeCategoryId === category.id}
            />
          ))}

          {isEditingHiddenState && (
            <span className="inline-flex flex-shrink-0 self-center">
              <AddTabBtn
                tabType="category"
                categories={categoriesNotInBrokerList}
                addApiUrl={`/challenges/category/${brokerId ?? 0}`}
              />
            </span>
          )}
        </div>
      </div>
    </DragDropProvider>
  );
}
