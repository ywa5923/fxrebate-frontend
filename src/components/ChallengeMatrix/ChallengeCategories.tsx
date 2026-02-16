"use client";

import { ChallengeType,ChallengeStep,ChallengeAmount} from "@/types";
import { useState } from "react";

import StaticMatrix from "@/components/ChallengeMatrix/StaticMatrix";
import AddTabBtn from "@/components/ChallengeMatrix/AddTabBtn";

//import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import CategoriesContainer from "./CategoriesContainer";
import StepsContainer from "./StepsContainer";
import AmountsContainer from "./AmountsContainer";

interface ChallengeCategoriesProps {
  categories: ChallengeType[];
  defaultCategories?: ChallengeType[];
  brokerId?: number ;
  type: "challenge" | "placeholder";
  is_admin: boolean;
}

type ChallengeState = {
  categoryId: number | null;
  stepId: number | null;
  amountId: number | null;
};

type DeleteConfirmation = {
  type: "category" | "step" | "amount";
  id: number;
  name: string;
} | null;

function ChallengeCategories({ categories, defaultCategories, brokerId, type, is_admin }: ChallengeCategoriesProps) {
  //const [hiddenState, setHiddenState] = useLocalStorage<HiddenState>("hidden-challenge-state", { categories: [], steps: [], amounts: [] });
  const [isEditingHiddenState, setIsEditingHiddenState] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [challengeState, setChallengeState] = useState<ChallengeState>(() => {
    const firstCategory = categories[0];
    if (!firstCategory) {
      return { categoryId: null, stepId: null, amountId: null };
    }
    return {
      categoryId: firstCategory.id,
      stepId: firstCategory.steps[0]?.id || null,
      amountId: firstCategory.amounts[0]?.id || null,
    };
  });

  //categories are broker categories, for type=placeholder, the categories are the default categories
 let categoriesNotInBrokerList = defaultCategories?.filter((cat) => !categories.some((c) => c.slug === cat.slug)) ?? [];
  
  const selectedCategory = categories.find((cat) => cat.id === challengeState.categoryId);
  const selectedStepSlug = selectedCategory?.steps.find((s) => s.id === challengeState.stepId)?.slug;
  const derivedState = {
    selectedCategory: selectedCategory,
    steps: selectedCategory?.steps || [],
    amounts: selectedCategory?.amounts || [],
    stepSlug: selectedStepSlug,
    canShowMatrix: Boolean(selectedStepSlug && challengeState.stepId && challengeState.amountId && challengeState.categoryId)
  };

  const handleCategoryClick = (category: ChallengeType) => {
    if (category.id === challengeState.categoryId) return;
    
    setChallengeState({
      categoryId: category.id,
      stepId: category.steps[0]?.id || null,
      amountId: category.amounts[0]?.id || null,
    });
  };

  const handleStepClick = (step: ChallengeStep) => {
    if (step.id === challengeState.stepId) return;
    
    setChallengeState(prev => ({
      ...prev,
      stepId: step.id,
      amountId: derivedState.selectedCategory?.amounts[0]?.id || null,
    }));
  };

  const handleAmountClick = (amount: ChallengeAmount) => {
    if (amount.id === challengeState.amountId) return;
    setChallengeState(prev => ({ ...prev, amountId: amount.id }));
  };

  const openDeleteConfirmation = (type: "category" | "step" | "amount", id: number, name: string) => {
    setDeleteConfirmation({ type, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    setIsDeleting(true);

    const { type: deleteType, id } = deleteConfirmation;
    let deleteUrl = "";
    let paramName = "";

    switch (deleteType) {
      case "category":
        deleteUrl = `/challenges/category/${brokerId}?category_id=${id}`;
        paramName = "category_id";
        break;
      case "step":
        deleteUrl = `/challenges/step/${brokerId}?step_id=${id}`;
        paramName = "step_id";
        break;
      case "amount":
        deleteUrl = `/challenges/amount/${brokerId}?amount_id=${id}`;
        paramName = "amount_id";
        break;
    }

    const deleteResponse = await apiClient<any>(deleteUrl, UseTokenAuth.Yes, {
      method: "DELETE",
    }, ErrorMode.Return);

    if (deleteResponse.success) {
      toast.success(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} removed successfully`);
      router.refresh();
    } else {
      toast.error(deleteResponse.message);
    }

    setIsDeleting(false);
    setDeleteConfirmation(null);
  };

  if (!categories.length) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="text-gray-500 dark:text-gray-400">No categories</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-2 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Challenge Categories
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Select a challenge category to get started
          </p>
          {type === "challenge" && (
            <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingHiddenState(!isEditingHiddenState)}
              className="inline-flex items-center px-3 py-1.5 text-xs md:text-sm rounded-md border border-sky-600 text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300"
            >
              {isEditingHiddenState ? "Close Edit Mode" : "Edit tabs visibility"}
            </button>
           
          </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          
          {/* STEP 1: Category Tabs */}
          <CategoriesContainer 
          categories={categories} 
          isEditingHiddenState={isEditingHiddenState}
           handleCategoryClick={handleCategoryClick} 
           openDeleteConfirmation={openDeleteConfirmation} 
           categoriesNotInBrokerList={categoriesNotInBrokerList} 
           brokerId={brokerId ?? 0} 
           activeCategoryId={challengeState.categoryId ?? 0} />

          {/* STEP 2: Steps */}
          {derivedState.selectedCategory && derivedState.steps.length > 0 ? (
            <StepsContainer
              steps={derivedState.steps}
              isEditingHiddenState={isEditingHiddenState}
              handleStepClick={handleStepClick}
              openDeleteConfirmation={openDeleteConfirmation}
              activeStepId={challengeState.stepId ?? 0}
              brokerId={brokerId ?? 0}
              selectedCategory={derivedState.selectedCategory}
              categories={categories}
              defaultCategories={defaultCategories ?? []}
            />
          ) : (
            <div className="min-h-[48px] md:min-h-[56px] flex items-center justify-center px-2">
              <div className="flex flex-wrap justify-center items-center gap-2 w-full">
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
                  {derivedState.selectedCategory ? "No steps available" : "Select a category first"}
                </span>
                {isEditingHiddenState && (
                  <span className="inline-flex flex-shrink-0 self-center">
                    <AddTabBtn tabType="step" selectedCategory={derivedState.selectedCategory} categories={categories} defaultCategories={defaultCategories} addApiUrl={`/challenges/step/${brokerId ?? 0}`} />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Amounts */}
          {type === "challenge" && derivedState.selectedCategory && derivedState.amounts.length > 0 ? (
            <AmountsContainer
              amounts={derivedState.amounts}
              isEditingHiddenState={isEditingHiddenState}
              handleAmountClick={handleAmountClick}
              openDeleteConfirmation={openDeleteConfirmation}
              activeAmountId={challengeState.amountId ?? 0}
              brokerId={brokerId ?? 0}
              selectedCategory={derivedState.selectedCategory}
              categories={categories}
              defaultCategories={defaultCategories ?? []}
            />
          ) : (
            <div className="min-h-[40px] md:min-h-[48px] flex items-center justify-center px-2">
              <div className="flex flex-wrap justify-center items-center gap-2 w-full">
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
                  {derivedState.selectedCategory ? "No amounts available" : "Select a category first"}
                </span>
                {isEditingHiddenState && (
                  <span className="inline-flex flex-shrink-0 self-center">
                    <AddTabBtn tabType="amount" selectedCategory={derivedState.selectedCategory} categories={categories} defaultCategories={defaultCategories ?? []} addApiUrl={`/challenges/amount/${brokerId ?? 0}`} />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Matrix area */}
          <div className="min-h-[250px] md:min-h-[300px] flex items-center justify-center">
            {derivedState.canShowMatrix ? (
              <div className="w-full min-h-[300px]">
                <StaticMatrix
                  brokerId={brokerId}
                  categoryId={challengeState.categoryId!}
                  stepId={challengeState.stepId!}
                  stepSlug={derivedState.stepSlug!}
                  amountId={challengeState.amountId??null}
                  zoneId={null}
                  language="en"
                  type={type}
                  is_admin={is_admin}
                />
              </div>
            ) : (
              <div className="w-full flex justify-center px-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 max-w-md">
                  <div className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200 text-center">
                    {!challengeState.stepId && "Please select a step"}
                    {challengeState.stepId && !challengeState.amountId && "Please select an amount"}
                    {challengeState.stepId && challengeState.amountId && !derivedState.stepSlug && "Step configuration incomplete"}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove the {deleteConfirmation?.type}{" "}
              <span className="font-semibold text-foreground">"{deleteConfirmation?.name}"</span>.
              This action will delete all related tables records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Removing..." : "Yes, remove it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChallengeCategories;