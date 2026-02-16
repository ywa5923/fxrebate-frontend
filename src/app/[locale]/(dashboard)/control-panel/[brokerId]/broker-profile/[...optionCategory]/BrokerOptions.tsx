"use client";

import { DynamicForm } from '@/components/DynamicForm';
import { Card, CardContent } from '@/components/ui/card';
import { Option, OptionValue } from '@/types';
import { LayoutGrid } from 'lucide-react';
import { submitBrokerProfile } from "@/lib/optionValues-requests";

interface BrokerOptionsProps {
  broker_id: number;
  options: Option[];
  optionsValues: OptionValue[];
  is_admin?: boolean;
  entity_id: number;
  entity_type: string;
  category: string;
  // action?: (
  //   broker_id: number,
  //   formData: FormData,
  //   is_admin: boolean,
  //   originalData?: OptionValue[],
  //   entity_id?: number,
  //   entity_type?: string
  // ) => Promise<void>;
}

export default function BrokerOptions({
  broker_id,
  options,
  optionsValues,
  is_admin = false,
  entity_id,
  entity_type,
 // action,
  category
}: BrokerOptionsProps) {
  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="rounded-2xl bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Header with subtle background pattern */}
        <div className="relative px-5 sm:px-6 py-5 sm:py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{category}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Configuration & Settings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
              <span className="text-gray-300 dark:text-gray-700 mx-1">|</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-600 font-mono">#{entity_id}</span>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
        <Card className="max-w-2xl mx-auto border-0 shadow-none">
          <CardContent>
            <DynamicForm
              broker_id={broker_id}
              options={options}
              optionsValues={optionsValues}
              is_admin={is_admin}
              entity_id={entity_id}
              entity_type={entity_type}
              action={submitBrokerProfile}
            />
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}