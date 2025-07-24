"use client";

import { Company, Option, OptionValue, Url } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '../actions';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AccountLinks from './AccountLinks';
import { LinksGroupedByAccountId, LinksGroupedByType } from '@/types/AccountTypeLinks';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { deleteAccountType } from './actions';
import { useRouter } from 'next/navigation';

interface AccountsProps {
  broker_id: number;
  accounts: Company[];
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

export default function Accounts({ broker_id, accounts, options, is_admin = false,  linksGroupedByAccountId,masterLinksGroupedByType,linksGroups }: AccountsProps) {
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button 
          onClick={() => setShowNewAccount(!showNewAccount)}
          className={cn(
            "transition-all duration-200",
            showNewAccount 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl"
          )}
        >
          {showNewAccount ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Account
            </>
          )}
        </Button>
      </div>
      
      {/* New Account Form */}
      {showNewAccount && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new account type</p>
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
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2">
              {accounts.map((account, index) => (
                <button
                  key={account.id}
                  onClick={() => setActiveTab(account.id.toString())}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    activeTab === account.id.toString()
                      ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={cn(
                      "w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full",
                      activeTab === account.id.toString() ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                    )}></div>
                    <span className="hidden sm:inline">Account {index + 1}</span>
                    <span className="sm:hidden">Acc {index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          {accounts.map((account, index) => (
            <div
              key={account.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
                activeTab === account.id.toString() ? "block" : "hidden"
              )}
            >
              {account.option_values && account.option_values.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-200 dark:bg-green-900/70 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-400 dark:ring-green-700">
                        <svg className="w-4 h-4 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account {index + 1}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configuration & Settings</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        ID: {account.id}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto sm:ml-2"
                        onClick={() => setConfirmDeleteAccount(account.id)}
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                  <Card className="max-w-2xl mx-auto">
                    <CardContent>
                      <DynamicForm
                        broker_id={broker_id}
                        options={options}
                        optionsValues={account.option_values}
                        action={submitBrokerProfile}
                        is_admin={is_admin}
                        entity_id={account.id}
                        entity_type="AccountType"
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
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This account has no option values to configure.</p>
                    </div>
                  )}
              <AccountLinks 
              broker_id={broker_id}
              account_type_id={account?.id} 
               links={linksGroupedByAccountId[account.id]??{}}
               master_links={masterLinksGroupedByType} 
               links_groups={linksGroups} />

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