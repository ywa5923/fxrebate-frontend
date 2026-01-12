"use client";

import { ChallengeType,ChallengeStep,ChallengeAmount} from "@/types";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import StaticMatrix from "@/components/ChallengeMatrix/StaticMatrix";

interface ChallengeCategoriesProps {
  categories: ChallengeType[];
  brokerId?: number ;
  type: "challenge" | "placeholder";
  is_admin: boolean;
}

type ChallengeState = {
  categoryId: number | null;
  stepId: number | null;
  amountId: number | null;
};

function ChallengeCategories({ categories, brokerId, type, is_admin }: ChallengeCategoriesProps) {
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
        </div>

        <div className="space-y-4 md:space-y-6">
          
          {/* STEP 1: Category Tabs */}
          <div className="min-h-[60px] md:min-h-[72px] flex items-center">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full">
              {categories.map((category) => (
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
              ))}
            </div>
          </div>

          {/* STEP 2: Steps */}
          <div className="min-h-[48px] md:min-h-[56px] flex items-center">
            {derivedState.selectedCategory && derivedState.steps.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {derivedState.steps.map((step) => (
                  <button
                    key={step.id}
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
                ))}
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {derivedState.selectedCategory ? "No steps available" : "Select a category first"}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Amounts */}
          <div className="min-h-[40px] md:min-h-[48px] flex items-center">
            {type === "challenge" && derivedState.selectedCategory && derivedState.amounts.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {derivedState.amounts.map((amount) => (
                  <button
                    key={amount.id}
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
                ))}
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {derivedState.selectedCategory ? "No amounts available" : "Select a category first"}
                </div>
              </div>
            )}
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
                  amountId={challengeState.amountId!}
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