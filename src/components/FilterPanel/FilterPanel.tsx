"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ListFilter, Star, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useFilterParams, valuesFromParams } from "./useFilterParams";

export type FilterOption = {
  label: string;
  value: string;
  stars?: number;
};

export type FilterField = {
  id: string;
  label: string;
  queryParam: string;
  type:
    | "select"
    | "multi-select"
    | "checkbox-group"
    | "rating-group"
    | "number"
    | "range"
    | "range-with-unit";
  placeholder?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  options?: FilterOption[];
};

export type FilterConfig = {
  title: string;
  clearLabel: string;
  showFilterBtnLabel: string;
  resetFilterBtnLabel: string;
  emptyOptionLabel: string;
  advancedTitle: string;
  primarySectionId: string;
  advancedSectionId: string;
  sections: { id: string; fields: FilterField[] }[];
};

const selectTriggerClass =
  "h-12 w-full min-w-0 rounded-md border-[#0c110f]/15 bg-white px-3 text-sm font-normal dark:border-white/15 dark:bg-[#191c1b]";
const rangeInputClass =
  "h-12 w-full min-w-0 rounded-md border border-[#0c110f]/15 bg-white px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#1d885b] dark:border-white/15 dark:bg-[#191c1b]";
const decimalPattern = /^-?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;
const yearPattern = /^\d{4}$/;

function parseRangeWithUnitEndpoint(value: string | undefined) {
  if (!value) return null;

  const match = value.match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))-(.+)$/);
  if (!match) return null;

  return { amount: match[1], unit: match[2] };
}

function RangeControl({
  field,
  values,
  onApply,
}: {
  field: FilterField;
  values: string[];
  onApply: (value: string[]) => void;
}) {
  const minimumFromUrl = values[0] ?? "";
  const maximumFromUrl = values[1] ?? "";
  const [minimum, setMinimum] = useState(minimumFromUrl);
  const [maximum, setMaximum] = useState(maximumFromUrl);

  const minimumIsValid = yearPattern.test(minimum.trim());
  const maximumIsValid = yearPattern.test(maximum.trim());
  const hasInput = minimum.trim() !== "" || maximum.trim() !== "";

  function applyRange(nextMinimum: string, nextMaximum: string) {
    const normalizedMinimum = nextMinimum.trim();
    const normalizedMaximum = nextMaximum.trim();

    if (!normalizedMinimum && !normalizedMaximum) {
      onApply([]);
      return;
    }

    if (yearPattern.test(normalizedMinimum) && yearPattern.test(normalizedMaximum)) {
      onApply([`${normalizedMinimum},${normalizedMaximum}`]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={minimum}
          onChange={(event) => {
            setMinimum(event.target.value);
            applyRange(event.target.value, maximum);
          }}
          placeholder={field.fromPlaceholder ?? "From"}
          aria-label={`${field.label} from`}
          aria-invalid={minimum.trim() !== "" && !minimumIsValid}
          className={cn(
            rangeInputClass,
            minimum.trim() !== "" && !minimumIsValid && "border-red-500",
          )}
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={maximum}
          onChange={(event) => {
            setMaximum(event.target.value);
            applyRange(minimum, event.target.value);
          }}
          placeholder={field.toPlaceholder ?? "To"}
          aria-label={`${field.label} to`}
          aria-invalid={maximum.trim() !== "" && !maximumIsValid}
          className={cn(
            rangeInputClass,
            maximum.trim() !== "" && !maximumIsValid && "border-red-500",
          )}
        />
      </div>
      {hasInput && (!minimumIsValid || !maximumIsValid) && (
        <p className="text-xs text-red-600 dark:text-red-400" role="status">
          Enter both years using four digits to apply this range.
        </p>
      )}
    </div>
  );
}

function RangeWithUnitControl({
  field,
  values,
  onApply,
  emptyOptionLabel,
}: {
  field: FilterField;
  values: string[];
  onApply: (value: string[]) => void;
  emptyOptionLabel: string;
}) {
  const minimumFromUrl = parseRangeWithUnitEndpoint(values[0]);
  const maximumFromUrl = parseRangeWithUnitEndpoint(values[1]);
  const [minimum, setMinimum] = useState(minimumFromUrl?.amount ?? "");
  const [maximum, setMaximum] = useState(maximumFromUrl?.amount ?? "");
  const [unit, setUnit] = useState(
    minimumFromUrl?.unit === maximumFromUrl?.unit
      ? minimumFromUrl?.unit ?? ""
      : "",
  );
  const options = field.options ?? [];

  const minimumIsValid = decimalPattern.test(minimum.trim());
  const maximumIsValid = decimalPattern.test(maximum.trim());
  const hasInput = minimum.trim() !== "" || maximum.trim() !== "" || unit !== "";

  function applyRange(nextMinimum: string, nextMaximum: string, nextUnit: string) {
    const trimmedMinimum = nextMinimum.trim();
    const trimmedMaximum = nextMaximum.trim();

    if (!trimmedMinimum && !trimmedMaximum) {
      onApply([]);
      return;
    }

    if (
      !nextUnit ||
      !options.some((option) => option.value === nextUnit) ||
      !decimalPattern.test(trimmedMinimum) ||
      !decimalPattern.test(trimmedMaximum)
    ) {
      return;
    }

    const normalizedMinimum = trimmedMinimum.replace(",", ".");
    const normalizedMaximum = trimmedMaximum.replace(",", ".");
    onApply([`${normalizedMinimum}-${nextUnit},${normalizedMaximum}-${nextUnit}`]);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={minimum}
          onChange={(event) => {
            setMinimum(event.target.value);
            applyRange(event.target.value, maximum, unit);
          }}
          placeholder={field.fromPlaceholder ?? "From"}
          aria-label={`${field.label} from`}
          aria-invalid={minimum.trim() !== "" && !minimumIsValid}
          className={cn(
            rangeInputClass,
            minimum.trim() !== "" && !minimumIsValid && "border-red-500",
          )}
        />
        <input
          type="text"
          inputMode="decimal"
          value={maximum}
          onChange={(event) => {
            setMaximum(event.target.value);
            applyRange(minimum, event.target.value, unit);
          }}
          placeholder={field.toPlaceholder ?? "To"}
          aria-label={`${field.label} to`}
          aria-invalid={maximum.trim() !== "" && !maximumIsValid}
          className={cn(
            rangeInputClass,
            maximum.trim() !== "" && !maximumIsValid && "border-red-500",
          )}
        />
      </div>
      <Select
        value={unit}
        onValueChange={(value) => {
          const nextUnit = value === "__clear__" ? "" : value;
          setUnit(nextUnit);
          if (!nextUnit) onApply([]);
          else applyRange(minimum, maximum, nextUnit);
        }}
      >
        <SelectTrigger className={selectTriggerClass} aria-label={`${field.label} unit`}>
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent className="z-[10003]">
          <SelectItem value="__clear__">{emptyOptionLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasInput &&
        (!minimumIsValid || !maximumIsValid || !unit || !options.some((option) => option.value === unit)) && (
          <p className="text-xs text-red-600 dark:text-red-400" role="status">
            Enter both valid limits and select a unit to apply this range.
          </p>
        )}
    </div>
  );
}

type FilterPanelProps = {
  config: FilterConfig;
  showResetButton?: boolean;
};

function MultiSelectControl({
  field,
  values,
  onToggle,
}: {
  field: FilterField;
  values: string[];
  onToggle: (value: string, checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOptions = (field.options ?? []).filter((option) =>
    values.includes(option.value),
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="min-w-0">
      <Button
        type="button"
        variant="outline"
        aria-label={field.label}
        aria-expanded={open}
        aria-controls={`${field.id}-options`}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          selectTriggerClass,
          "justify-between text-left font-normal",
        )}
      >
        <span className="min-w-0 truncate">
          {selectedOptions.length > 0
            ? selectedOptions.map((option) => option.label).join(", ")
            : field.placeholder ?? "Select options"}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
        />
      </Button>
      {open && (
        <div
          id={`${field.id}-options`}
          role="group"
          aria-label={field.label}
          className="mt-1 max-h-56 overflow-y-auto rounded-md border border-[#0c110f]/15 bg-white p-1 shadow-md dark:border-white/15 dark:bg-[#191c1b]"
        >
          {(field.options ?? []).map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Checkbox
                checked={values.includes(option.value)}
                onCheckedChange={(checked) => onToggle(option.value, checked === true)}
              />
              <span className="min-w-0 break-words">{option.label}</span>
            </label>
          ))}
        </div>
      )}
      {selectedOptions.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label={field.label}>
          {selectedOptions.map((option) => (
            <li
              key={option.value}
              className="flex min-w-0 max-w-full items-center gap-1 rounded-md border border-[#1d885b] bg-[#1d885b]/10 py-0.5 pr-0.5 pl-2.5 text-xs text-[#171f1c] dark:border-[#4ade80] dark:bg-[#1d885b]/15 dark:text-green-200"
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{option.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-sm text-[#166344] opacity-100 hover:bg-[#1d885b]/15 hover:text-[#171f1c] dark:text-green-200 dark:hover:bg-[#1d885b]/25 dark:hover:text-green-100"
                aria-label={`Remove ${option.label}`}
                title={`Remove ${option.label}`}
                onClick={() => onToggle(option.value, false)}
              >
                <X className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function FilterPanel({
  config,
  showResetButton = false,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const fields = useMemo(
    () => config.sections.flatMap((section) => section.fields),
    [config],
  );
  const ratingQueryParams = useMemo(
    () => fields.filter((field) => field.type === "rating-group").map((field) => field.queryParam),
    [fields],
  );
  const { searchParams, updateValue, toggleValue, clearValues } = useFilterParams(ratingQueryParams);
  const activeFilterCount = fields.reduce(
    (count, field) => {
      const selectedCount = valuesFromParams(searchParams, field.queryParam).length;
      return count + (field.type === "checkbox-group" ? selectedCount : selectedCount > 0 ? 1 : 0);
    },
    0,
  );

  function clearFilters() {
    clearValues(fields.map((field) => field.queryParam));
  }

  function renderField(field: FilterField) {
    const values = valuesFromParams(searchParams, field.queryParam);

    if (field.type === "rating-group") {
      const selected = values[0] ?? "";
      return (
        <div className="space-y-2">
          <RadioGroup
            value={selected}
            onValueChange={(value) => updateValue(field.queryParam, [value])}
            aria-label={field.label}
            className="gap-2"
          >
            {(field.options ?? []).map((option, optionIndex) => (
              <div key={option.value} className="flex min-h-8 items-center gap-2.5">
                <RadioGroupItem id={`${field.id}-rating-${optionIndex}`} value={option.value} />
                <label
                  htmlFor={`${field.id}-rating-${optionIndex}`}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-[#0c110f] dark:text-gray-200"
                >
                  <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-[15px] stroke-[1.5]",
                          index < (option.stars ?? 0)
                            ? "fill-[#f3b73f] text-[#f3b73f]"
                            : "fill-transparent text-[#a3a7a5] dark:text-gray-600",
                        )}
                      />
                    ))}
                  </span>
                  <span className="min-w-0">{option.label}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
          {selected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs"
              aria-label={`Remove ${field.label}`}
              onClick={() => updateValue(field.queryParam, [])}
            >
              <X className="size-3.5" aria-hidden="true" />
              {config.emptyOptionLabel}
            </Button>
          )}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <Select
          value={values[0] ?? ""}
          onValueChange={(value) =>
            updateValue(field.queryParam, value === "__clear__" ? [] : [value])
          }
        >
          <SelectTrigger className={selectTriggerClass} aria-label={field.label}>
            <SelectValue placeholder={field.placeholder ?? "Select"} />
          </SelectTrigger>
          <SelectContent className="z-[10003]">
            <SelectItem value="__clear__">{config.emptyOptionLabel}</SelectItem>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "multi-select") {
      return (
        <MultiSelectControl
          field={field}
          values={values}
          onToggle={(value, checked) =>
            toggleValue(field.queryParam, value, checked)
          }
        />
      );
    }

    if (field.type === "range") {
      return (
        <RangeControl
          key={`${field.id}:${JSON.stringify(values)}`}
          field={field}
          values={values}
          onApply={(nextValue) => updateValue(field.queryParam, nextValue)}
        />
      );
    }

    if (field.type === "range-with-unit") {
      return (
        <RangeWithUnitControl
          key={`${field.id}:${JSON.stringify(values)}`}
          field={field}
          values={values}
          emptyOptionLabel={config.emptyOptionLabel}
          onApply={(nextValue) => updateValue(field.queryParam, nextValue)}
        />
      );
    }

    if (field.type === "number") {
      return (
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={values[0] ?? ""}
          onChange={(event) =>
            updateValue(
              field.queryParam,
              event.target.value === "" ? [] : [event.target.value],
            )
          }
          placeholder={field.placeholder}
          aria-label={field.label}
          className={selectTriggerClass}
        />
      );
    }

    return (
      <div className="space-y-2" role="group" aria-label={field.label}>
        {(field.options ?? []).map((option) => {
          const checked = values.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-[#0c110f] dark:text-gray-200"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  toggleValue(field.queryParam, option.value, nextChecked === true);
                }}
              />
              <span className="min-w-0">{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  function renderFieldList(sectionId: string) {
    const section = config.sections.find((item) => item.id === sectionId);
    if (!section) return null;

    return (
      <div className="space-y-6">
        {section.fields.map((field) => (
          <section key={field.id} className="space-y-2">
            <h3 className="text-sm font-medium text-[#0c110f] dark:text-gray-100">
              {field.label}
            </h3>
            {renderField(field)}
          </section>
        ))}
      </div>
    );
  }

  const filterSheet = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          className={cn(
            "h-11 gap-2 rounded-md bg-[#0c110f] px-4 text-sm font-medium text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#0c110f] dark:hover:bg-gray-200",
            showResetButton ? "min-w-0 flex-1 justify-center" : "shrink-0",
          )}
        >
          <ListFilter className="size-4" />
          {config.showFilterBtnLabel}
          {activeFilterCount > 0 && (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-xs dark:bg-black/10">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        overlayClassName="z-[10001]"
        className="z-[10002] w-[min(399px,calc(100vw-12px))] max-w-none gap-0 border-l-0 bg-[#f6f6f6] p-0 text-[#0c110f] dark:bg-[#171a19] dark:text-gray-100"
      >
        <SheetHeader className="h-12 shrink-0 justify-center bg-[#efefef] py-0 pr-14 pl-6 dark:bg-[#242827]">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-lg font-semibold text-[#0c110f] dark:text-gray-100">
              {config.title}
            </SheetTitle>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#0c110f]/70 underline underline-offset-4 hover:text-[#0c110f] dark:text-gray-300 dark:hover:text-white"
              >
                {config.clearLabel}
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {renderFieldList(config.primarySectionId)}
          <Accordion
            type="single"
            collapsible
            defaultValue={config.advancedSectionId}
            className="mt-8 border-t border-[#0c110f]/15 dark:border-white/15"
          >
            <AccordionItem value={config.advancedSectionId} className="border-b-0">
              <AccordionTrigger className="py-5 text-sm font-semibold hover:no-underline">
                {config.advancedTitle}
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                {renderFieldList(config.advancedSectionId)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (!showResetButton) return filterSheet;

  return (
    <div className="flex w-full items-center gap-2 md:w-auto">
      {filterSheet}
      <Button
        type="button"
        variant="outline"
        disabled={activeFilterCount === 0}
        onClick={clearFilters}
        className="h-11 shrink-0 rounded-md border-[#0c110f]/20 px-4 text-sm font-medium text-[#0c110f] dark:border-white/30 dark:text-gray-100"
      >
        {config.resetFilterBtnLabel}
      </Button>
    </div>
  );
}
