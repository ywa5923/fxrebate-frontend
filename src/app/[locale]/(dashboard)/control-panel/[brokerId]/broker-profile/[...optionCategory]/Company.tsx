"use client";

import type { DynamicTableRow, Option } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { LayoutGrid } from 'lucide-react';

interface CompanyProps {
  broker_id: number;
  company: DynamicTableRow | null;
  options: Option[];
  is_admin?: boolean;
}

export default function Company({ broker_id, company, options, is_admin = false }: CompanyProps) {
  return (
    <div className="container mx-auto p-3 sm:p-6">
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
            {company && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-green-600 dark:text-green-400 font-mono">#{company.id}</span>
              </div>
            )}
          </div>
        </div>
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
          <div className="bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-4 border border-dashed border-gray-200 dark:border-gray-700">
            <DynamicForm
              broker_id={broker_id}
              options={options}
              optionsValues={company?.option_values || []}
              action={submitBrokerProfile}
              is_admin={is_admin}
              entity_id={company?.id || 0}
              entity_type="company"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
