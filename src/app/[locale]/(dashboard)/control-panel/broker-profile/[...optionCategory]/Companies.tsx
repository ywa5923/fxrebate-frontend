"use client";

import { Company, Option, OptionValue } from '@/types';
import { DynamicForm } from '@/components/DynamicForm';
import { submitBrokerProfile } from '../actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompaniesProps {
  broker_id: number;
  companies: Company[];
  options: Option[];
  is_admin?: boolean;
}

export default function Companies({ broker_id, companies, options, is_admin = false }: CompaniesProps) {
  const [activeTab, setActiveTab] = useState<string>(companies[0]?.id?.toString() || '');
  const [showNewCompany, setShowNewCompany] = useState(false);

 

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
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
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
        <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/50 animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-800">New Company</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewCompany(false)}
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
              action={submitBrokerProfile}
              is_admin={is_admin}
              entity_id={0}
              entity_type="Company"
            />
          </CardContent>
        </Card>
      )}
      
      {/* Tab Navigation */}
      {companies.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {companies.map((company, index) => (
              <Button
                key={company.id}
                variant={activeTab === company.id.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(company.id.toString())}
                className="text-xs lg:text-sm"
              >
                Company {index + 1}
              </Button>
            ))}
          </div>
          
          {/* Tab Content */}
          {companies.map((company) => (
            <div
              key={company.id}
              className={cn(
                "space-y-4",
                activeTab === company.id.toString() ? "block" : "hidden"
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Company {company.id}</h2>
                <div className="text-sm text-muted-foreground">
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
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No option values available for this company.</p>
                </div>
              )}
            </div>
          ))}
        </>
      ) : !showNewCompany && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No companies found. Click "Add New Company" to get started.</p>
        </div>
      )}
    </div>
  );
}