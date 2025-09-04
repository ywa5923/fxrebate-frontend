"use client";

import { ChallengeType } from "@/types/ChallengeType";
import React, { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import StaticMatrix from "@/components/ui/StaticMatrix";

interface ChallengeCategoriesProps {
  categories: ChallengeType[];
}
function ChallengeCategories({ categories }: ChallengeCategoriesProps) {
  const [isPending, startTransition] = useTransition();
  const [challengeState,setChallengeState] = useState<{categoryId:number|null,stepId:number|null,amountId:number|null}>({categoryId:categories[0]?.id || 0,stepId:categories[0]?.steps[0]?.id || null,amountId:categories[0]?.amounts[0]?.id || null});

  const selectedCategory = categories.find(cat => cat.id === challengeState.categoryId);
  
  // Filter out steps that start with "0-"
  const steps = selectedCategory?.steps || [];
  
  //const filteredSteps = selectedCategory?.steps.filter(step => !step.slug?.startsWith("0-")) || [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Challenge Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a challenge category to get started
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
            type="button"
              key={category.id}
              onClick={() => {
                startTransition(() => {
                  setChallengeState({categoryId:category.id,stepId:category.steps[0]?.id || null,amountId:category.amounts[0]?.id || null});
                });
              }}
              disabled={isPending}
              className={cn(
                "px-8 py-4 text-lg font-medium rounded-lg border-2 transition-all duration-200 min-w-[200px] text-center",
                challengeState.categoryId === category.id
                  ? "bg-green-800 text-white border-green-800 shadow-lg"
                  : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Steps Row - Only show if there are filtered steps */}
        {selectedCategory && steps.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {steps.map((step) => (
                <button
                  type="button"
                  key={step.id}
                  onClick={() => {
                    startTransition(() => {
                      setChallengeState((prevState) => ({...prevState,stepId:step.id,amountId:selectedCategory?.amounts[0]?.id || null}));
                    });
                  }}
                  disabled={isPending}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 min-w-[120px] text-center",
                    challengeState.stepId === step.id
                      ? "bg-green-800 text-white border-green-800 shadow-md"
                      : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20",
                    isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {step.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amounts Row */}
        {selectedCategory && (
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {selectedCategory.amounts.map((amount) => (
                <button
                  type="button"
                  key={amount.id}
                  onClick={() => {
                    startTransition(() => {
                      setChallengeState((prevState) => ({...prevState,amountId:amount.id}));
                    });
                  }}
                  disabled={isPending}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 min-w-[80px] text-center",
                    challengeState.amountId === amount.id
                      ? "bg-green-800 text-white border-green-800 shadow-md"
                      : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20",
                    isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {amount.amount} {amount.currency}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* StaticMatrix - Show when step is selected */}
        {challengeState.stepId && (
          <div className="mb-6">
            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : (
              <StaticMatrix
                categoryId={challengeState.categoryId}
                stepId={challengeState.stepId}
                stepSlug={selectedCategory?.steps.find(s => s.id === challengeState.stepId)?.slug || null}
                amountId={challengeState.amountId}
                zoneId={null}
                language="en"
                type="challenge"
                is_admin={false}
              />
            )}
          </div>
        )}

        {/* Selection Summary */}
        {(challengeState.stepId || challengeState.amountId) && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-semibold text-green-800 dark:text-green-400">
                  {selectedCategory?.name}
                </span>
                {challengeState.stepId && (
                  <> • <span className="font-semibold text-green-800 dark:text-green-400">
                    {selectedCategory?.steps.find(s => s.id === challengeState.stepId)?.name}
                  </span></>
                )}
                {challengeState.amountId && (
                  <> • <span className="font-semibold text-green-800 dark:text-green-400">
                    {selectedCategory?.amounts.find(a => a.id === challengeState.amountId)?.amount} {selectedCategory?.amounts.find(a => a.id === challengeState.amountId)?.currency}
                  </span></>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default React.memo(ChallengeCategories);
