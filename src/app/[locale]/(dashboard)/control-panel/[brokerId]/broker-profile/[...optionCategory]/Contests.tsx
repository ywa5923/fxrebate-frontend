"use client";

import { Option } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Trash, LayoutGrid } from 'lucide-react';
import { Card, CardContent} from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DynamicTableRow } from '@/types';
import { deleteDynamicTable } from '@/lib/deleteDynamicTable';

interface ContestsProps {
  broker_id: number;
  contests?: DynamicTableRow[];
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
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Contests</h1>
        <button
          onClick={() => setShowNewContest(!showNewContest)}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
            showNewContest
              ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 hover:border-slate-600 dark:hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          )}
          title={showNewContest ? "Cancel" : "New Contest"}
        >
          {showNewContest ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {/* New Contest Form */}
      {showNewContest && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
          <div className="mb-6">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-gray-200 dark:border-gray-700">
              {contests.map((contest, index) => {
                const isActive = activeTab === contest.id.toString()
                return (
                  <button
                    key={contest.id}
                    onClick={() => setActiveTab(contest.id.toString())}
                    className={cn(
                      "relative px-5 py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                    )}
                  >
                    <span className="hidden sm:inline">Contest {index + 1}</span>
                    <span className="sm:hidden">Cont {index + 1}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white" />
                    )}
                  </button>
                )
              })}
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 mb-5 border-b border-gray-200 dark:border-gray-800 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                        onClick={() => setConfirmDeleteContest(contest.id)}
                        title="Delete contest"
                      >
                        <Trash className="w-4 h-4" />
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