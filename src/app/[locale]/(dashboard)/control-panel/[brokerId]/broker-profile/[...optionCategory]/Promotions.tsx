"use client";

import { Option } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Trash, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog,  DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DynamicTableRow } from '@/types';
import { deleteDynamicTable } from '@/lib/deleteDynamicTable';

interface PromotionsProps {
  broker_id: number;
  promotions?: DynamicTableRow[];
  options: Option[];
  is_admin?: boolean;
}

export default function Promotions({ broker_id, promotions, options, is_admin = false }: PromotionsProps) {
  const [activeTab, setActiveTab] = useState<string>(promotions?.[0]?.id?.toString() || '');
  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [confirmDeletePromotion, setConfirmDeletePromotion] = useState<number|null>(null);
  const router = useRouter();
  const prevPromotionsLength = useRef(promotions?.length || 0);

  useEffect(() => {
    // If a new promotion is added
    if (promotions && promotions.length > prevPromotionsLength.current) {
      // Set active tab to the latest promotion (last in the array)
      setActiveTab(promotions[promotions.length - 1].id.toString());
    } else if (
      promotions &&
      promotions.length > 0 &&
      !promotions.some(promotion => promotion.id.toString() === activeTab)
    ) {
      // If current activeTab is invalid, set to first promotion
      setActiveTab(promotions[0].id.toString());
    }
    prevPromotionsLength.current = promotions?.length || 0;
  }, [promotions, activeTab]);

  async function handleDeletePromotion(promotionId: number) {
    try {
     
      const response = await deleteDynamicTable('promotions',promotionId,broker_id);
      toast.success("Promotion deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete promotion");
      console.log("DELETE PROMOTION ERROR", error);
    }
  }


  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Promotions</h1>
        <Button 
          onClick={() => setShowNewPromotion(!showNewPromotion)}
          className={cn(
            "transition-all duration-200",
            showNewPromotion 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl"
          )}
        >
          {showNewPromotion ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Promotion
            </>
          )}
        </Button>
      </div>
      
      {/* New Promotion Form */}
      {showNewPromotion && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Promotion</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new promotion</p>
            </div>
          </div>
          <Card className="w-full sm:max-w-2xl sm:mx-auto">
            <CardContent>
              <DynamicForm
                broker_id={broker_id}
                options={options}
                optionsValues={[]}
                action={async (broker_id, formData, is_admin, optionsValues, entity_id, entity_type) => {
                  await submitBrokerProfile(broker_id, formData, is_admin, optionsValues, entity_id, entity_type);
                  setShowNewPromotion(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="promotion"
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tab Navigation */}
      {promotions && promotions.length > 0 ? (
        <>
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2">
              {promotions.map((promotion, index) => (
                <button
                  key={promotion.id}
                  onClick={() => setActiveTab(promotion.id.toString())}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    activeTab === promotion.id.toString()
                      ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={cn(
                      "w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full",
                      activeTab === promotion.id.toString() ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                    )}></div>
                    <span className="hidden sm:inline">Promotion {index + 1}</span>
                    <span className="sm:hidden">Promo {index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          {promotions.map((promotion, index) => (
            <div
              key={promotion.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
                activeTab === promotion.id.toString() ? "block" : "hidden"
              )}
            >
              {promotion.option_values && promotion.option_values.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 mb-5 border-b border-gray-200 dark:border-gray-800 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Promotion {index + 1}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configuration & Settings</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        ID: {promotion.id}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto sm:ml-2"
                        onClick={() => setConfirmDeletePromotion(promotion.id)}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Delete Promotion
                      </Button>
                    </div>
                  </div>
                  <Card className="max-w-2xl mx-auto">
                    <CardContent>
                      <DynamicForm
                        broker_id={broker_id}
                        options={options}
                        optionsValues={promotion.option_values}
                        action={submitBrokerProfile}
                        is_admin={is_admin}
                        entity_id={promotion.id}
                        entity_type="promotion"
                      />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No configuration available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This promotion has no option values to configure.</p>
                </div>
              )}
            </div>
          ))}
          
          {/* Confirmation Dialog for Promotion Delete */}
          <Dialog open={!!confirmDeletePromotion} onOpenChange={open => { if (!open) setConfirmDeletePromotion(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this promotion?</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                This action cannot be undone.
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDeletePromotion(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDeletePromotion) {
                      handleDeletePromotion(confirmDeletePromotion);
                      setConfirmDeletePromotion(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : !showNewPromotion && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No promotions found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add New Promotion" to get started.</p>
        </div>
      )}
    </div>
  );
} 