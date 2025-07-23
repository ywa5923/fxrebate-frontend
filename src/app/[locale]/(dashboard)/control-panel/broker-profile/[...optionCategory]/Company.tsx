"use client";

import type { Company, Option, OptionValue } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '../actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

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
        <h1 className="text-2xl font-bold">Company</h1>
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
            entity_type="company"
          />
        </div>
      )}
      {/* Company Content */}
      {company ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configuration & Settings</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              ID: {company.id}
            </div>
          </div>
          {company.option_values && company.option_values.length > 0 ? (
            <DynamicForm
              broker_id={broker_id}
              options={options}
              optionsValues={company.option_values}
              action={submitBrokerProfile}
              is_admin={is_admin}
              entity_id={company.id}
              entity_type="Company"
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No configuration available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This company has no option values to configure.</p>
            </div>
          )}
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
