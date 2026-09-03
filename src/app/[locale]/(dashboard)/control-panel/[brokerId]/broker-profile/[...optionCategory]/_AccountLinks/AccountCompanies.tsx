"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { CompanyList, CompanyListItem } from "@/types";
import { NotFoundEntity } from "@/components/NotFoundEntity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";
import { cn } from "@/lib/utils";

const attachCompanySchema = z.object({
  company_id: z.string().min(1, "Please select a company"),
});

type AttachCompanyFormValues = z.infer<typeof attachCompanySchema>;

function updateCompanyUrl(accountTypeId: number, brokerId: number) {
  return `/account-types/${accountTypeId}/broker/${brokerId}/company`;
}

function AttachCompanyDialog({
  open,
  onOpenChange,
  accountTypeId,
  brokerId,
  availableCompanies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountTypeId: number;
  brokerId: number;
  availableCompanies: CompanyList;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AttachCompanyFormValues>({
    resolver: zodResolver(attachCompanySchema),
    defaultValues: { company_id: "" },
  });

  async function onSubmit(values: AttachCompanyFormValues) {
    setIsSubmitting(true);
    try {
      const response = await apiClient<{ company_id: number | null }>(
        updateCompanyUrl(accountTypeId, brokerId),
        UseTokenAuth.Yes,
        {
          method: "PUT",
          body: JSON.stringify({ company_id: Number(values.company_id) }),
        },
      );

      if (response.success) {
        toast.success("Company attached to this trading account");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to attach company");
        form.setError("root", {
          message: response.message ?? "Failed to attach company",
        });
      }
    } catch {
      toast.error("Failed to attach company");
      form.setError("root", { message: "Failed to attach company" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach a company</DialogTitle>
          <DialogDescription>
            Select a company to associate with this trading account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="company_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="min-w-0">
                <FieldLabel htmlFor={field.name}>Company</FieldLabel>
                <div
                  id={field.name}
                  role="listbox"
                  aria-label="Companies"
                  aria-invalid={fieldState.invalid}
                  className="max-h-52 overflow-y-auto rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40"
                >
                  {availableCompanies.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No companies available
                    </p>
                  ) : (
                    availableCompanies.map((item) => {
                      const selected = field.value === String(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => field.onChange(String(item.id))}
                          className={cn(
                            "flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors",
                            "border-b border-gray-100 last:border-b-0 dark:border-gray-800",
                            selected
                              ? "bg-green-50 font-medium text-green-800 dark:bg-green-950/50 dark:text-green-300"
                              : "text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/80",
                          )}
                        >
                          <span className="min-w-0 break-words">
                            {item.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <FieldError errors={[form.formState.errors.root]} />
          )}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-24"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                availableCompanies.length === 0 ||
                !form.watch("company_id")
              }
              className="w-full sm:w-auto sm:min-w-32 bg-green-700 text-white hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Attach company
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetachCompanyDialog({
  company,
  accountTypeId,
  brokerId,
  open,
  onOpenChange,
}: {
  company: CompanyListItem | null;
  accountTypeId: number;
  brokerId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!company) return;

    setIsDeleting(true);
    try {
      const response = await apiClient<{ company_id: number | null }>(
        updateCompanyUrl(accountTypeId, brokerId),
        UseTokenAuth.Yes,
        {
          method: "PUT",
          body: JSON.stringify({ company_id: null }),
        },
      );

      if (response.success) {
        toast.success("Company removed from this trading account");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to remove company");
      }
    } catch {
      toast.error("Failed to remove company");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove company?</DialogTitle>
          <DialogDescription>
            {company
              ? `Remove "${company.name}" from this trading account? This action cannot be undone.`
              : "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto sm:min-w-24"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto sm:min-w-24"
            onClick={handleConfirm}
            disabled={isDeleting || !company}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({
  hasCompany,
  onAdd,
  canAdd,
}: {
  hasCompany: boolean;
  onAdd: () => void;
  canAdd: boolean;
}) {
  return (
    <div className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-green-300 dark:border-green-800">
          <Building2
            className="h-6 w-6 text-green-600 dark:text-green-400"
            strokeWidth={1.5}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900 break-words dark:text-gray-100 sm:text-xl">
            {hasCompany
              ? "Attached company"
              : "Attach a company to this trading account"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {hasCompany
              ? "Legal entity linked to this account type"
              : "One company can be linked to this account type"}
          </p>
        </div>
      </div>
      {canAdd && (
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-150 ring-1 ring-inset",
            "ring-gray-300 dark:ring-gray-500 text-gray-500 dark:text-gray-400",
            "hover:ring-gray-400 dark:hover:ring-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
          )}
          title="Attach company"
          aria-label="Attach company"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function companyInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function AttachedCompanyCard({
  company,
  canRemove,
  onRemove,
}: {
  company: CompanyListItem;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-[#fdfdfd] dark:border-gray-700 dark:bg-gray-800">
      <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-4 sm:items-center sm:gap-4 sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-green-900 text-xs font-semibold tracking-wide text-green-900 dark:border-green-400 dark:text-green-400">
          {companyInitials(company.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-semibold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
            {company.name || "Untitled company"}
          </p>
        </div>
      </div>
      {canRemove && (
        <div className="flex shrink-0 items-center border-l border-gray-100 px-2 dark:border-gray-700 sm:px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            onClick={onRemove}
            title="Remove company"
            aria-label={`Remove ${company.name}`}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AccountCompanies({
  broker_id,
  account_type_id,
  attachedCompany,
  companiesList,
  can_manage = true,
}: {
  broker_id: number;
  account_type_id: number;
  attachedCompany: CompanyListItem | null;
  companiesList: CompanyList;
  can_manage?: boolean;
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [companyToDetach, setCompanyToDetach] =
    useState<CompanyListItem | null>(null);

  const availableCompanies = useMemo(
    () =>
      companiesList.filter((item) => item.id !== attachedCompany?.id),
    [companiesList, attachedCompany],
  );

  return (
    <section className="w-full min-w-0 max-w-none">
      <SectionHeader
        hasCompany={attachedCompany !== null}
        onAdd={() => setAddDialogOpen(true)}
        canAdd={can_manage && attachedCompany === null}
      />

      <AttachCompanyDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        accountTypeId={account_type_id}
        brokerId={broker_id}
        availableCompanies={availableCompanies}
      />

      <DetachCompanyDialog
        company={companyToDetach}
        accountTypeId={account_type_id}
        brokerId={broker_id}
        open={companyToDetach !== null}
        onOpenChange={(open) => {
          if (!open) setCompanyToDetach(null);
        }}
      />

      {attachedCompany === null ? (
        <NotFoundEntity
          title="No company attached to this trading account"
          description={
            can_manage
              ? companiesList.length === 0
                ? "Create a company in Company Profiles first, then attach it here."
                : "Click here or use the + button to attach a company."
              : "No company is linked to this trading account yet."
          }
          onClick={
            can_manage && companiesList.length > 0
              ? () => setAddDialogOpen(true)
              : undefined
          }
          ariaLabel="Attach company"
        />
      ) : (
        <AttachedCompanyCard
          company={attachedCompany}
          canRemove={can_manage}
          onRemove={() => setCompanyToDetach(attachedCompany)}
        />
      )}
    </section>
  );
}
