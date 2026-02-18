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
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Company</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Configuration & Settings</p>
          </div>
        </div>
        {!company && (
          <button
            onClick={() => setShowNewCompany(!showNewCompany)}
            className={cn(
              "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
              showNewCompany
                ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            title={showNewCompany ? "Cancel" : "New Company"}
          >
            {showNewCompany ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {/* New Company Form */}
      {(!company && showNewCompany) && (
        <div className="mb-6 border-2 border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">New Company</p>
          <Card className="w-full border-0 shadow-none bg-[#ffffff] dark:bg-transparent">
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
        <div className="rounded-2xl bg-[#ffffff] dark:bg-gray-900 border-0 shadow-none overflow-hidden">
          <div className="relative px-5 sm:px-6 py-5 sm:py-6 border-b border-gray-200 dark:border-gray-800">
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Company</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Configuration & Settings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-green-600 dark:text-green-400 font-mono">#{company.id}</span>
              </div>
            </div>
          </div>
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
            <div className="bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-4 border border-dashed border-gray-200 dark:border-gray-700">
              <DynamicForm
                broker_id={broker_id}
                options={options}
                optionsValues={company.option_values || []}
                action={submitBrokerProfile}
                is_admin={is_admin}
                entity_id={company.id}
                entity_type="company"
              />
            </div>
          </div>
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
