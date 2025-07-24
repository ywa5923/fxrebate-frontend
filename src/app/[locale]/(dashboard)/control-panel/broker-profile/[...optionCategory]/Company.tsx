"use client";

import type { Company, Option, OptionValue } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '../actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyProps {
  broker_id: number;
  company: Company | null;
  options: Option[];
  is_admin?: boolean;
}

export default function Company({ broker_id, company, options, is_admin = false }: CompanyProps) {
  const [showNewCompany, setShowNewCompany] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
      
        {!company && (
          <Button
            onClick={() => setShowNewCompany(!showNewCompany)}
            className={cn(
              "transition-all duration-200",
              showNewCompany
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl"
            )}
          >
            {showNewCompany ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </>
            )}
          </Button>
        )}
      </div>
      {/* New Company Form or Edit Form */}
      {(!company && showNewCompany) && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Company</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add a new company</p>
            </div>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardContent>
              <DynamicForm
                broker_id={broker_id}
                options={options}
                optionsValues={[]}
                action={async (broker_id, formData, is_admin, optionsValues, entity_id, entity_type) => {
                  await submitBrokerProfile(broker_id, formData, is_admin, optionsValues, entity_id, entity_type);
                  setShowNewCompany(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="Company"
              />
            </CardContent>
          </Card>
        </div>
      )}
      {/* Company Content */}
      {company ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-200 dark:bg-green-900/70 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-400 dark:ring-green-700">
                <svg className="w-4 h-4 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configuration & Settings</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                ID: {company.id}
              </div>
              {/* If you want a Delete button for company, add it here as in Accounts */}
            </div>
          </div>
          <Card className="max-w-2xl mx-auto">
            <CardContent>
              <DynamicForm
                broker_id={broker_id}
                options={options}
                optionsValues={company.option_values || []}
                action={submitBrokerProfile}
                is_admin={is_admin}
                entity_id={company.id}
                entity_type="Company"
              />
            </CardContent>
          </Card>
        </div>
      ) : (!showNewCompany && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No company found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add Company" to get started.</p>
        </div>
      ))}
    </div>
  );
}
