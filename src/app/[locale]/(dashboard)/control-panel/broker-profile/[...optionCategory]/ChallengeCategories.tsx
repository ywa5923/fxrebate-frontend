"use client";

import { ChallengeType } from "@/types/ChallengeType";
import { useState } from "react";
import { cn } from "@/lib/utils";
import StaticMatrix from "@/components/ui/StaticMatrix";

interface ChallengeCategoriesProps {
  categories: ChallengeType[];
}

export default function ChallengeCategories({ categories }: ChallengeCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<number>(categories[0]?.id || 0);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [activeAmount, setActiveAmount] = useState<number | null>(null);

  const selectedCategory = categories.find(cat => cat.id === activeCategory);
  
  // Filter out steps that start with "0-"
  const filteredSteps = selectedCategory?.steps.filter(step => !step.slug?.startsWith("0-")) || [];

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
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setActiveStep(null);
                setActiveAmount(null);
              }}
              className={cn(
                "px-8 py-4 text-lg font-medium rounded-lg border-2 transition-all duration-200 min-w-[200px] text-center",
                activeCategory === category.id
                  ? "bg-green-800 text-white border-green-800 shadow-lg"
                  : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Steps Row - Only show if there are filtered steps */}
        {selectedCategory && filteredSteps.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {filteredSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(activeStep === step.slug ? null : step.slug);
                    setActiveAmount(null);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 min-w-[120px] text-center",
                    activeStep === step.slug
                      ? "bg-green-800 text-white border-green-800 shadow-md"
                      : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
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
                  key={amount.id}
                  onClick={() => setActiveAmount(activeAmount === amount.id ? null : amount.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 min-w-[80px] text-center",
                    activeAmount === amount.id
                      ? "bg-green-800 text-white border-green-800 shadow-md"
                      : "bg-white dark:bg-gray-800 text-green-800 dark:text-green-400 border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                  )}
                >
                  {amount.amount} {amount.currency}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* StaticMatrix - Show when step is selected */}
        {activeStep && (
          <div className="mb-6">
            <StaticMatrix
              categoryId={selectedCategory?.id ?? null}
              stepId={filteredSteps.find(s => s.slug === activeStep)?.id ?? null}
              stepSlug={activeStep}
              amountId={activeAmount}
              zoneId={null}
              language="en"
              type="placeholder"
              is_admin={true}
            />
          </div>
        )}

        {/* Selection Summary */}
        {(activeStep || activeAmount) && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-semibold text-green-800 dark:text-green-400">
                  {selectedCategory?.name}
                </span>
                {activeStep && (
                  <> • <span className="font-semibold text-green-800 dark:text-green-400">
                    {filteredSteps.find(s => s.slug === activeStep)?.name}
                  </span></>
                )}
                {activeAmount && (
                  <> • <span className="font-semibold text-green-800 dark:text-green-400">
                    {selectedCategory?.amounts.find(a => a.id === activeAmount)?.amount} {selectedCategory?.amounts.find(a => a.id === activeAmount)?.currency}
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
