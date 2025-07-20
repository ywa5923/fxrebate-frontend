"use client";

import { Company, Option, OptionValue } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '../actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccountsProps {
  broker_id: number;
  accounts: Company[];
  options: Option[];
  is_admin?: boolean;
}

export default function Accounts({ broker_id, accounts, options, is_admin = false }: AccountsProps) {
  const [activeTab, setActiveTab] = useState<string>(accounts[0]?.id?.toString() || '');
  const [showNewAccount, setShowNewAccount] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button 
          onClick={() => setShowNewAccount(!showNewAccount)}
          className={cn(
            "transition-all duration-200",
            showNewAccount 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
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
      <div 
        className={cn(
          "transition-all duration-500 ease-in-out",
          showNewAccount 
            ? "opacity-100 max-h-[2000px] translate-y-0" 
            : "opacity-0 max-h-0 translate-y-[-20px] overflow-hidden"
        )}
      >
        <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-800">New Account</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewAccount(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
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
              entity_type="AccountType"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Tab Navigation */}
      {accounts.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {accounts.map((account, index) => (
              <Button
                key={account.id}
                variant={activeTab === account.id.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(account.id.toString())}
                className="text-xs lg:text-sm"
              >
                Account {index + 1}
              </Button>
            ))}
          </div>
          
          {/* Tab Content */}
          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                "space-y-4",
                activeTab === account.id.toString() ? "block" : "hidden"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Account {account.id}</h2>
                <div className="text-sm text-muted-foreground">
                  ID: {account.id}
                </div>
              </div>
              
              {account.option_values && account.option_values.length > 0 ? (
                <DynamicForm
                  broker_id={broker_id}
                  options={options}
                  optionsValues={account.option_values}
                  action={submitBrokerProfile}
                  is_admin={is_admin}
                  entity_id={account.id}
                  entity_type="AccountType"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No option values available for this account.</p>
                </div>
              )}
            </div>
          ))}
        </>
      ) : !showNewAccount && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No accounts found. Click "Add New Account" to get started.</p>
        </div>
      )}
    </div>
  );
} 