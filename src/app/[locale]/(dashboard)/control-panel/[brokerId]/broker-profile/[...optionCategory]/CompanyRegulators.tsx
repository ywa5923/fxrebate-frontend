"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Regulator, RegulatorList } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Scale, ExternalLink, Loader2, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UseTokenAuth } from "@/lib/enums";

const addRegulatorSchema = z.object({
  regulator_id: z.string().min(1, "Please select a regulator"),
});

type AddRegulatorFormValues = z.infer<typeof addRegulatorSchema>;

type RegulatorDisplayField = keyof Pick<
  Regulator,
  | "name"
  | "acronym"
  | "country"
  | "zone"
  | "tier_classification"
  | "rating"
  | "investor_protection_scheme"
  | "compensation_scheme"
  | "retail_leverage_restrictions"
  | "website"
  | "year_established"
  | "jurisdiction_type"
  | "notes"
  | "description"
>;

const FIELD_LABELS: Record<Exclude<RegulatorDisplayField, "name">, string> = {
  acronym: "Acronym",
  country: "Country",
  zone: "Zone",
  tier_classification: "Tier classification",
  rating: "Rating",
  investor_protection_scheme: "Investor protection scheme",
  compensation_scheme: "Compensation scheme",
  retail_leverage_restrictions: "Retail leverage restrictions",
  website: "Website",
  year_established: "Year established",
  jurisdiction_type: "Jurisdiction type",
  notes: "Notes",
  description: "Description",
};

type RegulatorDetailField = Exclude<
  RegulatorDisplayField,
  "name" | "acronym" | "rating"
>;

const DETAIL_FIELDS: RegulatorDetailField[] = [
  "country",
  "zone",
  "tier_classification",
  "investor_protection_scheme",
  "compensation_scheme",
  "retail_leverage_restrictions",
  "website",
  "year_established",
  "jurisdiction_type",
];

const TEXT_FIELDS: Array<"notes" | "description"> = ["notes", "description"];

/** Shown on collapsed accordion header as a short summary */
const HEADER_SUMMARY_FIELDS: RegulatorDetailField[] = [
  "country",
  "zone",
  "tier_classification",
  "jurisdiction_type",
];

function formatValue(
  field: RegulatorDisplayField,
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (field === "year_established") return String(value);
  return String(value);
}

function DetailItem({
  label,
  value,
  field,
  className,
  multiline = false,
}: {
  label: string;
  value: string | null;
  field: RegulatorDisplayField;
  className?: string;
  multiline?: boolean;
}) {
  if (!value) return null;

  return (
    <div className={cn("min-w-0 w-full", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 break-words text-gray-900 dark:text-gray-100",
          multiline
            ? "text-sm leading-relaxed whitespace-pre-wrap"
            : "text-sm",
        )}
      >
        {field === "website" ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-start gap-1 text-green-700 hover:underline dark:text-green-400"
          >
            <span className="break-all">{value}</span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function HeaderSummary({ regulator }: { regulator: Regulator }) {
  const parts = HEADER_SUMMARY_FIELDS.map((field) =>
    formatValue(field, regulator[field]),
  ).filter((value): value is string => value !== null);

  if (parts.length === 0) return null;

  return (
    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
      {parts.join(" · ")}
    </p>
  );
}

function RegulatorDetails({ regulator }: { regulator: Regulator }) {
  const hasGridDetails = DETAIL_FIELDS.some(
    (field) => formatValue(field, regulator[field]) !== null,
  );
  const hasTextDetails = TEXT_FIELDS.some(
    (field) => formatValue(field, regulator[field]) !== null,
  );

  if (!hasGridDetails && !hasTextDetails) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No additional regulator details available.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {hasGridDetails && (
        <dl className="grid w-full min-w-0 grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {DETAIL_FIELDS.map((field) => (
            <DetailItem
              key={field}
              field={field}
              label={FIELD_LABELS[field]}
              value={formatValue(field, regulator[field])}
            />
          ))}
        </dl>
      )}

      {hasTextDetails && (
        <dl
          className={cn(
            "grid w-full min-w-0 grid-cols-1 gap-y-4",
            hasGridDetails && "border-t border-gray-100 pt-5 dark:border-gray-700",
          )}
        >
          {TEXT_FIELDS.map((field) => (
            <DetailItem
              key={field}
              field={field}
              label={FIELD_LABELS[field]}
              value={formatValue(field, regulator[field])}
              multiline
            />
          ))}
        </dl>
      )}
    </div>
  );
}

function RegulatorAccordionItem({
  regulator,
  onDelete,
}: {
  regulator: Regulator;
  onDelete: (regulator: Regulator) => void;
}) {
  return (
    <AccordionItem
      value={String(regulator.id)}
      className="w-full min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-[#fdfdfd] px-0 dark:border-gray-700 dark:bg-gray-800/90"
    >
      <div className="flex w-full items-stretch">
        <AccordionTrigger className="min-w-0 flex-1 px-4 py-4 hover:no-underline sm:px-5 [&>svg]:text-gray-500 dark:[&>svg]:text-gray-400">
          <div className="flex min-w-0 flex-1 flex-col gap-2 pr-2 text-left sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
            <span className="block text-base font-semibold leading-tight text-gray-900 break-words dark:text-gray-100 sm:text-lg">
              {regulator.name}
            </span>
            {regulator.acronym && (
              <span className="mt-0.5 block text-xs font-mono text-gray-500 dark:text-gray-400">
                {regulator.acronym}
              </span>
            )}
            <HeaderSummary regulator={regulator} />
          </div>
          {regulator.rating && (
            <span className="w-fit shrink-0 self-start rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 sm:self-center">
              Rating: {regulator.rating}
            </span>
          )}
          </div>
        </AccordionTrigger>
        <div className="flex shrink-0 items-center border-l border-gray-100 px-2 dark:border-gray-700 sm:px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            onClick={() => onDelete(regulator)}
            title="Remove regulator"
            aria-label={`Remove ${regulator.name}`}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AccordionContent className="border-t border-gray-100 px-4 pb-4 dark:border-gray-700 sm:px-5 sm:pb-5">
        <RegulatorDetails regulator={regulator} />
      </AccordionContent>
    </AccordionItem>
  );
}

function DeleteRegulatorDialog({
  regulator,
  companyId,
  brokerId,
  open,
  onOpenChange,
}: {
  regulator: { id: number; name: string } | null;
  companyId: number;
  brokerId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!regulator) return;

    setIsDeleting(true);
    try {
      const serverUrl = `/regulators/${regulator.id}/company/${companyId}/broker/${brokerId}`;
      const response = await apiClient(serverUrl, UseTokenAuth.Yes, {
        method: "DELETE",
      });

      if (response.success) {
        toast.success("Regulator removed from company");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to remove regulator");
      }
    } catch {
      toast.error("Failed to remove regulator");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove regulator?</DialogTitle>
          <DialogDescription>
            {regulator
              ? `Remove "${regulator.name}" from this company? This action cannot be undone.`
              : "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || !regulator}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddRegulatorDialog({
  open,
  onOpenChange,
  companyId,
  brokerId,
  availableRegulators,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  brokerId: number;
  availableRegulators: RegulatorList;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddRegulatorFormValues>({
    resolver: zodResolver(addRegulatorSchema),
    defaultValues: { regulator_id: "" },
  });

  async function onSubmit(values: AddRegulatorFormValues) {
    setIsSubmitting(true);
    try {
      const regulatorId = Number(values.regulator_id);
      const serverUrl = `/regulators/${regulatorId}/company/${companyId}/broker/${brokerId}`;
      const response = await apiClient<{ id: number }>(
        serverUrl,
        UseTokenAuth.Yes,
        { method: "POST" },
      );

      if (response.success) {
        toast.success("Regulator linked to company");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to link regulator");
        form.setError("root", {
          message: response.message ?? "Failed to link regulator",
        });
      }
    } catch {
      toast.error("Failed to link regulator");
      form.setError("root", { message: "Failed to link regulator" });
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
          <DialogTitle>Link regulator</DialogTitle>
          <DialogDescription>
            Select a regulator to associate with this company.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="regulator_id"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <FormLabel className="mb-0 shrink-0">Regulator</FormLabel>
                    <div className="min-w-0 flex-1">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={availableRegulators.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              availableRegulators.length === 0
                                ? "No regulators available"
                                : "Select a regulator"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRegulators.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || availableRegulators.length === 0}
                className="bg-green-700 text-white hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Attach regulator to this company
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CompanyRegulators({
  broker_id,
  company_id,
  regulators,
  regulatorsList,
}: {
  broker_id: number;
  company_id: number;
  regulators: Regulator[];
  regulatorsList: RegulatorList;
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [regulatorToDelete, setRegulatorToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const linkedIds = useMemo(
    () => new Set(regulators.map((r) => r.id)),
    [regulators],
  );

  const availableRegulators = useMemo(
    () => regulatorsList.filter((item) => !linkedIds.has(item.id)),
    [regulatorsList, linkedIds],
  );

  return (
    <section className="w-full min-w-0 max-w-none">
      <SectionHeader
        count={regulators.length}
        onAdd={() => setAddDialogOpen(true)}
      />

      <AddRegulatorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        companyId={company_id}
        brokerId={broker_id}
        availableRegulators={availableRegulators}
      />

      <DeleteRegulatorDialog
        regulator={regulatorToDelete}
        companyId={company_id}
        brokerId={broker_id}
        open={regulatorToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRegulatorToDelete(null);
        }}
      />

      {regulators.length === 0 ? (
        <button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          className={cn(
            "group w-full rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-12 text-center transition-all duration-150",
            "hover:border-green-500 hover:bg-green-50/50 dark:border-gray-700 dark:bg-gray-900/30",
            "dark:hover:border-green-700 dark:hover:bg-green-950/20 sm:px-6 sm:py-14",
          )}
          aria-label="Link regulator"
        >
          <span
            className={cn(
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed transition-colors",
              "border-gray-300 bg-white text-gray-400 group-hover:border-green-500 group-hover:text-green-600",
              "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
              "dark:group-hover:border-green-600 dark:group-hover:text-green-400",
            )}
          >
            <Plus className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            No regulators linked to this company
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Click here or use the + button to link a regulator.
          </p>
        </button>
      ) : (
        <Accordion
          type="multiple"
          className="flex w-full min-w-0 max-w-none flex-col gap-3"
        >
          {regulators.map((regulator) => (
            <RegulatorAccordionItem
              key={regulator.id}
              regulator={regulator}
              onDelete={(item) =>
                setRegulatorToDelete({ id: item.id, name: item.name })
              }
            />
          ))}
        </Accordion>
      )}
    </section>
  );
}

function SectionHeader({
  count,
  onAdd,
}: {
  count: number;
  onAdd: () => void;
}) {
  return (
    <div className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
          <Scale className="h-4 w-4 text-green-700 dark:text-green-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Regulators
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {count === 0
              ? "Regulatory oversight for this company"
              : `${count} regulator${count === 1 ? "" : "s"} assigned`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border transition-all duration-150",
          "border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400",
          "hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-300",
        )}
        title="Link regulator"
        aria-label="Link regulator"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
