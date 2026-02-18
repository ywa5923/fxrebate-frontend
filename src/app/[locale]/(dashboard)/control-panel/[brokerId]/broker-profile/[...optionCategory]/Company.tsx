"use client";

import type { DynamicTableRow, Option } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyProps {
  broker_id: number;
  company: DynamicTableRow | null;
  options: Option[];
  is_admin?: boolean;
}

export default function Company({ broker_id, company, options, is_admin = false }: CompanyProps) {
  const [showNewCompany, setShowNewCompany] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Company</h1>
        {!company && (
          <button
            onClick={() => setShowNewCompany(!showNewCompany)}
            className={cn(
              "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
              showNewCompany
                ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                : "border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 hover:border-slate-600 dark:hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            title={showNewCompany ? "Cancel" : "New Company"}
          >
            {showNewCompany ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {/* New Company Form or Edit Form */}
      {(!company && showNewCompany) && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          {/* Header with icon and text */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
                entity_type="company"
              />
            </CardContent>
          </Card>
        </div>
      )}
      {/* Company Content */}
      {company ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 mb-5 border-b border-gray-200 dark:border-gray-800 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
                entity_type="company"
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
