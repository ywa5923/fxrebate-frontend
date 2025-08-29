"use client";

import { ChallengeType } from "@/types/ChallengeType";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getChallengeHeaders } from "@/lib/matrix-requests";
import StaticMatrix from "@/components/ui/StaticMatrix";

interface ChallengeCategoriesProps {
  categories: ChallengeType[];
}

export default function ChallengeCategories({ categories }: ChallengeCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<number>(categories[0]?.id || 0);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [activeAmount, setActiveAmount] = useState<number | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<any[]>([]);
  const [rowHeaders, setRowHeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedCategory = categories.find(cat => cat.id === activeCategory);
  
  // Filter out steps that start with "0-"
  const filteredSteps = selectedCategory?.steps.filter(step => !step.slug?.startsWith("0-")) || [];

  // Fetch headers when step is selected
  useEffect(() => {
    const fetchHeaders = async () => {
      if (activeStep) {
        setLoading(true);
        try {
          const { columnHeaders, rowHeaders } = await getChallengeHeaders('en', activeStep, 'challenge');
          setColumnHeaders(columnHeaders);
          setRowHeaders(rowHeaders);
        } catch (error) {
          console.error('Error fetching headers:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setColumnHeaders([]);
        setRowHeaders([]);
      }
    };

    fetchHeaders();
  }, [activeStep]);

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

        {/* Loading indicator */}
        {loading && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading headers...</p>
          </div>
        )}

       
        {activeStep && !loading && (columnHeaders.length > 0 || rowHeaders.length > 0) && (
          <div className="mb-6">
            <StaticMatrix 
              rowHeaders={rowHeaders}
              columnHeaders={columnHeaders}
              initialMatrix={[]}
              is_admin={true}
            />
          </div>
        )}

 {/* Headers Display */}
 {activeStep && !loading && (columnHeaders.length > 0 || rowHeaders.length > 0) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
              Challenge Headers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columnHeaders.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Column Headers</h4>
                  <div className="space-y-1">
                    {columnHeaders.map((header, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {header.name || header.slug || `Header ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rowHeaders.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Row Headers</h4>
                  <div className="space-y-1">
                    {rowHeaders.map((header, index) => (
                      <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {header.name || header.slug || `Header ${index + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

