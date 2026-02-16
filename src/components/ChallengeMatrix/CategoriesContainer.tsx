"use client"; // Required for useOptimistic

import { ChallengeType } from "@/types";
import CategoryItem from "./CategoryItem";
import AddTabBtn from "./AddTabBtn";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { toast } from "sonner";
import logger from "@/lib/logger";


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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let log = logger.child('ChallengeMatrix/CategoriesContainer');
  // useOptimistic hook - categories will update instantly
  const [optimisticCategories, setOptimisticCategories] = useOptimistic(
    categories,
    (state, newCategories: ChallengeType[]) => newCategories
  );

  const saveLink = `/challenges/${brokerId}/tabs/category/order`;

  const handleSaveOrder = async (newOrder: ChallengeType[]) => {
    // Optimistically update UI immediately
    startTransition(async () => {
      setOptimisticCategories(newOrder);

     
      try {
        const response = await apiClient<any>(
          saveLink,
          UseTokenAuth.Yes,
          {
            method: "PUT",
            body: JSON.stringify({ tab_ids: newOrder.map((category) => category.id) }),
          },
          ErrorMode.Return
        );

        if (!response.success) {
          toast.error("Failed to save order");
          log.error('handleSaveOrder', {error:response.message,brokerId:brokerId,context:{data:JSON.stringify({ tab_ids: newOrder.map((category) => category.id) })}});
          // Optimistic update will automatically revert to original `categories`
          // when the transition ends without updating the prop
        } else {
          toast.success("Order saved successfully");
          router.refresh();
        }
      } catch (error) {
        toast.error("Network error while saving order");
        // Optimistic update will automatically revert
        log.error('handleSaveOrder', {error:error,brokerId:brokerId,context:{data:JSON.stringify({ tab_ids: newOrder.map((category) => category.id) })}});
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
            const newItems = [...optimisticCategories];
            const [removed] = newItems.splice(initialIndex, 1);
            newItems.splice(index, 0, removed);
            
            handleSaveOrder(newItems);
          }
        }
      }}
    >
      <div className="min-h-[60px] md:min-h-[72px] flex items-center justify-center px-2">
        {/* Optional: Show loading indicator */}
        {isPending && (
          <div className="absolute top-2 right-2">
            <span className="text-xs text-muted-foreground">Saving...</span>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full">
          {optimisticCategories.map((category, index) => (
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