"use client";

import {  DynamicTableRow, Option} from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Trash, LayoutGrid } from 'lucide-react';
import { Card, CardContent} from '@/components/ui/card';
import AccountLinks from './AccountLinks';
import { LinksGroupedByAccountId, LinksGroupedByType } from '@/types/AccountTypeLinks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { deleteAccountType } from '@/lib/accountType-request';
import { useRouter } from 'next/navigation';

interface AccountsProps {
  broker_id: number;
  accounts?: DynamicTableRow[];
  options: Option[];
  is_admin?: boolean;
  linksGroupedByAccountId: LinksGroupedByAccountId;
  masterLinksGroupedByType: LinksGroupedByType;
  linksGroups: Array<string>;
}
//example of accountTypeUrls, grouped by acount_type_ID and then by url type,  and urls_groups
//it also contains master-links which is a group of urls that are not associated with any account type 
//master links are shown in the section of every account type
//    {
//     '12': {
//       mobile: [Array],
//       webplatform: [Array],
//       swap: [Array],
//       commission: [Array]
//     },
//     'master-links': { mobile: [Array] }
//   },
//   url_groups: [ 'mobile', 'webplatform', 'swap', 'commission' ]

export default function Accounts({ broker_id, accounts = [], options, is_admin = false,  linksGroupedByAccountId,masterLinksGroupedByType,linksGroups }: AccountsProps) {
  const [activeTab, setActiveTab] = useState<string>(accounts[0]?.id?.toString() || '');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState<number|null>(null);
  const router = useRouter();
  const prevAccountsLength = useRef(accounts.length);

  useEffect(() => {
    // If a new account is added
    if (accounts.length > prevAccountsLength.current) {
      // Set active tab to the latest account (last in the array)
      setActiveTab(accounts[accounts.length - 1].id.toString());
    } else if (
      accounts.length > 0 &&
      !accounts.some(account => account.id.toString() === activeTab)
    ) {
      // If current activeTab is invalid, set to first account
      setActiveTab(accounts[0].id.toString());
    }
    prevAccountsLength.current = accounts.length;
  }, [accounts, activeTab]);


  async function handleDeleteAccountType(accountId: number) {
    
    try{
      const response = await deleteAccountType(accountId,broker_id);
      toast.success("Account type deleted successfully!");
      router.refresh();
    }catch(error){
      toast.error("Failed to delete account type");
      console.log("DELETE ACCOUNT TYPE ERROR",error);
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Accounts</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Configuration & Settings</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewAccount(!showNewAccount)}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
            showNewAccount
              ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          )}
          title={showNewAccount ? "Cancel" : "New Account"}
        >
          {showNewAccount ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {/* New Account Form */}
      {showNewAccount && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">New Account</p>
          <Card className="w-full border-0 shadow-none bg-[#ffffff] dark:bg-transparent">
            <CardContent>
              <DynamicForm
                broker_id={broker_id}
                options={options}
                optionsValues={[]}
                action={async (broker_id, formData, is_admin, optionsValues, entity_id, entity_type) => {
                  await submitBrokerProfile(broker_id, formData, is_admin, optionsValues, entity_id, entity_type);
                  setShowNewAccount(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="account-type"
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tab Navigation */}
      {accounts.length > 0 ? (
        <>
          <div className="mb-2">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-gray-200 dark:border-gray-700">
              {accounts.map((account, index) => {
                const isActive = activeTab === account.id.toString()
                return (
                  <button
                    key={account.id}
                    onClick={() => setActiveTab(account.id.toString())}
                    className={cn(
                      "relative px-5 py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                    )}
                  >
                    <span className="hidden sm:inline">Account {index + 1}</span>
                    <span className="sm:hidden">Acc {index + 1}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Tab Content */}
          {accounts.map((account, index) => (
            <div
              key={account.id}
              className={cn(
                "bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-px border border-dashed border-gray-200 dark:border-gray-700",
                activeTab === account.id.toString() ? "block" : "hidden"
              )}
            >
              {account.option_values && account.option_values.length > 0 ? (
                <>
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      ID: {account.id}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                      onClick={() => setConfirmDeleteAccount(account.id)}
                      title="Delete account"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <DynamicForm
                    broker_id={broker_id}
                    options={options}
                    optionsValues={account.option_values}
                    action={submitBrokerProfile}
                    is_admin={is_admin}
                    entity_id={account.id}
                    entity_type="account-type"
                  />
                </>
              ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No configuration available</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This account has no option values to configure.</p>
                    </div>
                  )}
              <AccountLinks 
              broker_id={broker_id}
              account_type_id={account?.id} 
               links={linksGroupedByAccountId[account.id]??{}}
               master_links={masterLinksGroupedByType} 
               links_groups={linksGroups} 
               is_admin={is_admin}
               />

            </div>
          ))}
          {/* Confirmation Dialog for Account Delete */}
          <Dialog open={!!confirmDeleteAccount} onOpenChange={open => { if (!open) setConfirmDeleteAccount(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this account type?</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                This action cannot be undone.
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDeleteAccount(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDeleteAccount) {
                      handleDeleteAccountType(confirmDeleteAccount);
                      setConfirmDeleteAccount(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : !showNewAccount && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No accounts found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add New Account" to get started.</p>
        </div>
      )}
    </div>
  );
} 