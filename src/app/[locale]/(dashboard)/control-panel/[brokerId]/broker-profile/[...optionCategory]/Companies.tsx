"use client";

import { DynamicTableRow, Option } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';

import { submitBrokerProfile } from '@/lib/optionValues-requests';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompaniesProps {
  broker_id: number;
  companies: DynamicTableRow[];
  options: Option[];
  is_admin?: boolean;
}

export default function Companies({ broker_id, companies, options, is_admin = false }: CompaniesProps) {
  const [activeTab, setActiveTab] = useState<string>(companies[0]?.id?.toString() || '');
  const [showNewCompany, setShowNewCompany] = useState(false);

  // Track previous companies length to detect new additions
  const prevCompaniesLength = useRef(companies.length);

  useEffect(() => {
    // If a new company is added, set active tab to the latest company (last in the array)
    if (companies.length > prevCompaniesLength.current) {
      setActiveTab(companies[companies.length - 1].id.toString());
    } else if (
      companies.length > 0 &&
      !companies.some(company => company.id.toString() === activeTab)
    ) {
      // If current activeTab is invalid, set to first company
      setActiveTab(companies[0].id.toString());
    }
    prevCompaniesLength.current = companies.length;
  }, [companies, activeTab]);
 

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
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
              Add New Company
            </>
          )}
        </Button>
      </div>
      
      {/* New Company Form */}
      {showNewCompany && (
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
            entity_type="Company"
          />
        </div>
      )}
      
      {/* Tab Navigation */}
      {companies.length > 0 ? (
        <>
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2">
              {companies.map((company, index) => (
                <button
                  key={company.id}
                  onClick={() => setActiveTab(company.id.toString())}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    activeTab === company.id.toString()
                      ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500"></div>
                    <span className="hidden sm:inline">Company {index + 1}</span>
                    <span className="sm:hidden">Comp {index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          {companies.map((company, index) => (
            <div
              key={company.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
                activeTab === company.id.toString() ? "block" : "hidden"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company {index + 1}</h2>
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
                  entity_type="company"
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
          ))}
        </>
      ) : !showNewCompany && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No companies found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click "Add New Company" to get started.</p>
        </div>
      )}
    </div>
  );
}