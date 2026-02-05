"use client";

import { ChallengeType,ChallengeStep,ChallengeAmount} from "@/types";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import StaticMatrix from "@/components/ChallengeMatrix/StaticMatrix";
import AddTabBtn from "@/components/ChallengeMatrix/AddTabBtn";
import { X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ErrorMode, UseTokenAuth } from "@/lib/enums";
import { toast } from "sonner";

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



function ChallengeCategories({ categories, defaultCategories, brokerId, type, is_admin }: ChallengeCategoriesProps) {
  //const [hiddenState, setHiddenState] = useLocalStorage<HiddenState>("hidden-challenge-state", { categories: [], steps: [], amounts: [] });
  const [isEditingHiddenState, setIsEditingHiddenState] = useState(false);
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

  console.log("selected category:", selectedCategory);
  console.log("selected step slug:", selectedStepSlug);
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

  const handleCategoryHide = async (categoryId: number) => {

    let deleteUrl = `/challenges/category/${brokerId}?category_id=${categoryId}`;
    let deleteResponse = await apiClient<any>(deleteUrl, UseTokenAuth.Yes, {
      method: "DELETE",
    }, ErrorMode.Return);
    if (deleteResponse.success) {
      router.refresh();
    }else{
      toast.error(deleteResponse.message);
    }
  };
  const handleStepHide = async (stepId: number) => {
    let deleteUrl = `/challenges/step/${brokerId}?step_id=${stepId}`;
    let deleteResponse = await apiClient<any>(deleteUrl, UseTokenAuth.Yes, {
      method: "DELETE",
    }, ErrorMode.Return);
    if (deleteResponse.success) {
      router.refresh();
    }else{
      toast.error(deleteResponse.message);
    }
  };
  const handleAmountHide = async (amountId: number) => {
    let deleteUrl = `/challenges/amount/${brokerId}?amount_id=${amountId}`;
    let deleteResponse = await apiClient<any>(deleteUrl, UseTokenAuth.Yes, {
      method: "DELETE",
    }, ErrorMode.Return);
    if (deleteResponse.success) {
      router.refresh();
    }else{
      toast.error(deleteResponse.message);
    }
  };

  if (!categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gray-500 dark:text-gray-400">No categories</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
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
              {isEditingHiddenState ? "Save current state" : "Edit tabs visibility"}
            </button>
           
          </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          
          {/* STEP 1: Category Tabs */}
          <div className="min-h-[60px] md:min-h-[72px] flex items-center justify-center px-2">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full">
              {categories.map((category) => (
                <div key={category.id} className="relative inline-block">
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    "px-4 md:px-8 py-3 md:py-4",
                    "text-sm md:text-lg font-medium",
                    "rounded-lg border-2 border-green-800",
                    "min-w-[140px] md:min-w-[200px]",
                    "text-center transition-all duration-200",
                    "hover:shadow-md active:scale-95",
                    challengeState.categoryId === category.id
                      ? "bg-green-800 text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  )}
                >
                  {category.name}
                </button>
                {isEditingHiddenState && (
                  <button
                    type="button"
                    aria-label="Hide category"
                    onClick={() => handleCategoryHide(category.id)}
                    title="Hide this category"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center shadow hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                </div>
              ))}
              {isEditingHiddenState && (
                <span className="inline-flex flex-shrink-0 self-center">
                  <AddTabBtn tabType="category" categories={categoriesNotInBrokerList} addApiUrl={`/challenges/category/${brokerId ?? 0}`} />
                </span>
              )}
            </div>
          </div>

          {/* STEP 2: Steps */}
          <div className="min-h-[48px] md:min-h-[56px] flex items-center justify-center px-2">
            <div className="flex flex-wrap justify-center items-center gap-2 w-full">
              {derivedState.selectedCategory && derivedState.steps.length > 0 ? (
                <>
                  {derivedState.steps.map((step) => (
                    <div key={step.id} className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => handleStepClick(step)}
                        className={cn(
                          "px-3 md:px-4 py-2",
                          "text-xs md:text-sm font-medium",
                          "rounded-lg border-2 border-green-800",
                          "min-w-[100px] md:min-w-[120px]",
                          "text-center transition-all duration-200",
                          "hover:shadow-sm active:scale-95",
                          challengeState.stepId === step.id
                            ? "bg-green-800 text-white shadow-md"
                            : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        )}
                      >
                        {step.name}
                      </button>
                      {isEditingHiddenState && (
                        <button
                          type="button"
                          aria-label="Hide step"
                          onClick={() => handleStepHide(step.id)}
                          title="Hide this step"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center shadow hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditingHiddenState && (
                    <span className="inline-flex flex-shrink-0 self-center">
                      <AddTabBtn tabType="step" categories={categories} defaultCategories={defaultCategories ?? []} addApiUrl={`/challenges/step/${brokerId ?? 0}`} />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
                    {derivedState.selectedCategory ? "No steps available" : "Select a category first"}
                  </span>
                  {isEditingHiddenState && (
                    <span className="inline-flex flex-shrink-0 self-center">
                      <AddTabBtn tabType="step" categories={categories} defaultCategories={defaultCategories} addApiUrl={`/challenges/step/${brokerId ?? 0}`} />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* STEP 3: Amounts */}
          <div className="min-h-[40px] md:min-h-[48px] flex items-center justify-center px-2">
            <div className="flex flex-wrap justify-center items-center gap-2 w-full">
              {type === "challenge" && derivedState.selectedCategory && derivedState.amounts.length > 0 ? (
                <>
                  {derivedState.amounts.map((amount) => (
                    <div key={amount.id} className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => handleAmountClick(amount)}
                        className={cn(
                          "px-3 md:px-4 py-2",
                          "text-xs md:text-sm font-medium",
                          "rounded-lg border-2 border-green-800",
                          "min-w-[70px] md:min-w-[80px]",
                          "text-center transition-all duration-200",
                          "hover:shadow-sm active:scale-95",
                          challengeState.amountId === amount.id
                            ? "bg-green-800 text-white shadow-md"
                            : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        )}
                      >
                        <span className="block md:inline">{amount.amount}</span>
                        <span className="block md:inline md:ml-1">{amount.currency}</span>
                      </button>
                      {isEditingHiddenState && (
                        <button
                          type="button"
                          aria-label="Hide amount"
                          onClick={() => handleAmountHide(amount.id)}
                          title="Hide this amount"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center shadow hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditingHiddenState && (
                    <span className="inline-flex flex-shrink-0 self-center">
                      <AddTabBtn tabType="amount" categories={categories} defaultCategories={defaultCategories ?? []} addApiUrl={`/challenges/amount/${brokerId ?? 0}`} />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center">
                    {derivedState.selectedCategory ? "No amounts available" : "Select a category first"}
                  </span>
                  { isEditingHiddenState && (
                    <span className="inline-flex flex-shrink-0 self-center">
                      <AddTabBtn tabType="amount" categories={categories} defaultCategories={defaultCategories ?? []} addApiUrl={`/challenges/amount/${brokerId ?? 0}`} />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

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
    </div>
  );
}

export default ChallengeCategories;