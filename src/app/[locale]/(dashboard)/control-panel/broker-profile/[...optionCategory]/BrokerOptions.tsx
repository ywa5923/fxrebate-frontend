"use client";

import { DynamicForm } from '@/components/DynamicForm';
import { Card, CardContent } from '@/components/ui/card';
import { Option, OptionValue } from '@/types';
import { DollarSign } from 'lucide-react';

interface BrokerOptionsProps {
  broker_id: number;
  options: Option[];
  optionsValues: OptionValue[];
  is_admin?: boolean;
  entity_id: number;
  entity_type: string;
  category: string;
  action?: (
    broker_id: number,
    formData: FormData,
    is_admin: boolean,
    originalData?: OptionValue[],
    entity_id?: number,
    entity_type?: string
  ) => Promise<void>;
}

export default function BrokerOptions({
  broker_id,
  options,
  optionsValues,
  is_admin = false,
  entity_id,
  entity_type,
  action,
  category
}: BrokerOptionsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-200 dark:bg-green-900/70 rounded-full flex items-center justify-center shadow-lg ring-2 ring-green-400 dark:ring-green-700">
              <DollarSign className="w-4 h-4 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{category}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configuration & Settings</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              ID: {entity_id}
            </div>
          </div>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardContent>
            <DynamicForm
              broker_id={broker_id}
              options={options}
              optionsValues={optionsValues}
              is_admin={is_admin}
              entity_id={entity_id}
              entity_type={entity_type}
              action={action}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}