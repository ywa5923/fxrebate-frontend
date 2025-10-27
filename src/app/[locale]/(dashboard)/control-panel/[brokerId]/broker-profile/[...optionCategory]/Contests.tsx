"use client";

import { Option, OptionValue } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DynamicTable } from '@/types';
import { deleteDynamicTable } from '@/lib/deleteDynamicTable';

interface ContestsProps {
  broker_id: number;
  contests?: DynamicTable[];
  options: Option[];
  is_admin?: boolean;
}

export default function Contests({ broker_id, contests, options, is_admin = false }: ContestsProps) {
  const [activeTab, setActiveTab] = useState<string>(contests?.[0]?.id?.toString() || '');
  const [showNewContest, setShowNewContest] = useState(false);
  const [confirmDeleteContest, setConfirmDeleteContest] = useState<number|null>(null);
  const router = useRouter();
  const prevContestsLength = useRef(contests?.length || 0);

  useEffect(() => {
    // If a new contest is added
    if (contests && contests.length > prevContestsLength.current) {
      // Set active tab to the latest contest (last in the array)
      setActiveTab(contests[contests.length - 1].id.toString());
    } else if (
      contests &&
      contests.length > 0 &&
      !contests.some(contest => contest.id.toString() === activeTab)
    ) {
      // If current activeTab is invalid, set to first contest
      setActiveTab(contests[0].id.toString());
    }
    prevContestsLength.current = contests?.length || 0;
  }, [contests, activeTab]);

  async function handleDeleteContest(contestId: number) {
    try {
    
     
      const response = await deleteDynamicTable('contests',contestId,broker_id);
      toast.success("Contest deleted successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete contest");
      console.log("DELETE CONTEST ERROR", error);
    }

   
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contests</h1>
        <Button 
          onClick={() => setShowNewContest(!showNewContest)}
          className={cn(
            "transition-all duration-200",
            showNewContest 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl"
          )}
        >
          {showNewContest ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Contest
            </>
          )}
        </Button>
      </div>
      
      {/* New Contest Form */}
      {showNewContest && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Contest</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new contest</p>
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
                  setShowNewContest(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="contest"
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tab Navigation */}
      {contests && contests.length > 0 ? (
        <>
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2">
              {contests.map((contest, index) => (
                <button
                  key={contest.id}
                  onClick={() => setActiveTab(contest.id.toString())}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    activeTab === contest.id.toString()
                      ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={cn(
                      "w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full",
                      activeTab === contest.id.toString() ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                    )}></div>
                    <span className="hidden sm:inline">Contest {index + 1}</span>
                    <span className="sm:hidden">Cont {index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          {contests.map((contest, index) => (
            <div
              key={contest.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
                activeTab === contest.id.toString() ? "block" : "hidden"
              )}
            >
              {contest.option_values && contest.option_values.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-200 dark:bg-green-900/70 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-400 dark:ring-green-700">
                        <svg className="w-4 h-4 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contest {index + 1}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configuration & Settings</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        ID: {contest.id}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto sm:ml-2"
                        onClick={() => setConfirmDeleteContest(contest.id)}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Delete Contest
                      </Button>
                    </div>
                  </div>
                  <Card className="max-w-2xl mx-auto">
                    <CardContent>
                      <DynamicForm
                        broker_id={broker_id}
                        options={options}
                        optionsValues={contest.option_values}
                        action={submitBrokerProfile}
                        is_admin={is_admin}
                        entity_id={contest.id}
                        entity_type="contest"
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
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This contest has no option values to configure.</p>
                </div>
              )}
            </div>
          ))}
          
          {/* Confirmation Dialog for Contest Delete */}
          <Dialog open={!!confirmDeleteContest} onOpenChange={open => { if (!open) setConfirmDeleteContest(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this contest?</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                This action cannot be undone.
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDeleteContest(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDeleteContest) {
                      handleDeleteContest(confirmDeleteContest);
                      setConfirmDeleteContest(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : !showNewContest && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No contests found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add New Contest" to get started.</p>
        </div>
      )}
    </div>
  );
} 