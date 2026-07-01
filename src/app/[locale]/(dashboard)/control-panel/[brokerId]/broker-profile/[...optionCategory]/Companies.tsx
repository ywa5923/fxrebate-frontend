"use client";

import {
  Company,
  DynamicTableRow,
  Option,
  RegulatorList,
} from "@/types";
import { OptionsForm } from "@/components/OptionsForm";
import { NotFoundEntity } from "@/components/NotFoundEntity";
import { submitBrokerProfile } from "@/lib/optionValues-requests";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Plus, X, Trash, LayoutGrid, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import logger from "@/lib/logger";
import CompanyRegulators from "./CompanyRegulators";

interface Props {
  broker_id: number;
  companies?: Company[];
  regulatorsList: RegulatorList;
  options: Option[];
  is_admin?: boolean;
}

function scrollToBottom() {
  document
    .getElementById("bottom")
    ?.scrollIntoView({ behavior: "smooth", block: "end" });
}

export default function Companies({
  broker_id,
  companies,
  regulatorsList,
  options,
  is_admin = false,
}: Props) {
  const thisLogger = logger.child("CompaniesComponent");
  const [activeTab, setActiveTab] = useState<string>(
    companies?.[0]?.id?.toString() || "",
  );
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [confirmDeleteCompany, setConfirmDeleteCompany] = useState<
    number | null
  >(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const router = useRouter();
  const prevCompaniesLength = useRef(companies?.length || 0);

  useEffect(() => {
    if (companies && companies.length > prevCompaniesLength.current) {
      setActiveTab(companies[companies.length - 1].id.toString());
    } else if (
      companies &&
      companies.length > 0 &&
      !companies.some((company) => company.id.toString() === activeTab)
    ) {
      setActiveTab(companies[0].id.toString());
    }
    prevCompaniesLength.current = companies?.length || 0;
  }, [companies, activeTab]);

  async function handleDeleteCompany(companyId: number) {
    try {
      const serverUrl = `/companies/${companyId}/broker/${broker_id}`;
      const response = await apiClient<DynamicTableRow>(
        serverUrl,
        UseTokenAuth.Yes,
        {
          method: "DELETE",
        },
      );
      if (response.success) {
        toast.success("Company deleted successfully!");
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to delete company");
        thisLogger.error("Failed to delete company", {
          error: response.message,
          context: { companyId, broker_id },
        });
      }
    } catch (error) {
      toast.error("Failed to delete company");
      thisLogger.error("Failed to delete company", {
        error: error,
        context: { companyId, broker_id },
      });
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 pt-6 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Companies
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Configuration & Settings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNewCompany(!showNewCompany)}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded border transition-all duration-150",
            showNewCompany
              ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
          )}
          title={showNewCompany ? "Cancel" : "New Company"}
        >
          {showNewCompany ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {showNewCompany && (
        <div className="mb-6 border border-dashed border-green-500 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-green-600 dark:text-green-400 mb-4">
            New Company
          </p>
          <Card className="w-full border-0 shadow-none bg-[#ffffff] dark:bg-transparent">
            <CardContent>
              <OptionsForm
                broker_id={broker_id}
                options={options}
                optionsValues={[]}
                action={async (
                  broker_id,
                  formData,
                  is_admin,
                  optionsValues,
                  entity_id,
                  entity_type,
                ) => {
                  await submitBrokerProfile(
                    broker_id,
                    formData,
                    is_admin,
                    optionsValues,
                    entity_id,
                    entity_type,
                  );
                  setShowNewCompany(false);
                }}
                is_admin={is_admin}
                entity_id={0}
                entity_type="Company"
                onSuccess={() => setSavedSuccessfully(true)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {companies && companies.length > 0 ? (
        <>
          <div className="mb-2">
            <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-gray-200 dark:border-gray-700">
              {companies.map((company, index) => {
                const isActive = activeTab === company.id.toString();
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setActiveTab(company.id.toString())}
                    className={cn(
                      "relative px-5 py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-gray-900 dark:text-white font-semibold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium",
                    )}
                  >
                    <span className="hidden sm:inline">
                      Company {index + 1}
                    </span>
                    <span className="sm:hidden">Comp {index + 1}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {companies.map((company, index) => (
            <div
              key={company.id}
              className={cn(
                "bg-[#fdfdfd] dark:bg-gray-800 rounded-lg px-6 py-px border border-dashed border-gray-200 dark:border-gray-700",
                activeTab === company.id.toString() ? "block" : "hidden",
              )}
            >
              {company.option_values && company.option_values.length > 0 ? (
                <>
                  
                  <div className="flex items-center justify-between gap-2 mb-10">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      Company Profile
                    </h1>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 border border-red-200 dark:border-red-800 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                          onClick={() => setConfirmDeleteCompany(company.id)}
                          aria-label="Delete this company"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete this company</TooltipContent>
                    </Tooltip>
                  </div>
                  <OptionsForm
                    broker_id={broker_id}
                    options={options}
                    optionsValues={company.option_values}
                    action={submitBrokerProfile}
                    is_admin={is_admin}
                    entity_id={company.id}
                    entity_type="company"
                  />
                  <div className="w-full min-w-0 mt-10 mb-10 pt-8 ">
                    <CompanyRegulators
                      broker_id={broker_id}
                      company_id={company.id}
                      regulators={company.regulators}
                      regulatorsList={regulatorsList}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No configuration available
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    This company has no option values to configure.
                  </p>
                </div>
              )}
            </div>
          ))}

          <div
            id="bottom"
            className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              End of company configuration — attach and manage regulators in the
              sections above.
            </p>
          </div>

          <Dialog
            open={savedSuccessfully}
            onOpenChange={(open) => {
              if (!open) setSavedSuccessfully(false);
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="text-left">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60">
                    <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <DialogTitle>Company details saved successfully</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      You can now attach regulators to this company in the
                      section below.
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <DialogFooter>
                <Button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  onClick={() => {
                    setSavedSuccessfully(false);
                    setTimeout(() => scrollToBottom(), 150);
                  }}
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!confirmDeleteCompany}
            onOpenChange={(open) => {
              if (!open) setConfirmDeleteCompany(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete this company?
                </DialogTitle>
              </DialogHeader>
              <div className="py-2">This action cannot be undone.</div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteCompany(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirmDeleteCompany) {
                      handleDeleteCompany(confirmDeleteCompany);
                      setConfirmDeleteCompany(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        !showNewCompany && (
          <NotFoundEntity
            title="No companies found"
            description="Click here or use the + button to add a company."
            onClick={() => setShowNewCompany(true)}
            ariaLabel="Add company"
          />
        )
      )}
    </div>
  );
}
