"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ListFilter, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import filterConfigJson from "./filter-config.json";

export type FilterOption = {
  label: string;
  value: string;
  stars?: number;
};

export type FilterField = {
  id: string;
  label: string;
  queryParam: string;
  type: "select" | "multi-select" | "checkbox-group" | "rating-group";
  placeholder?: string;
  options: FilterOption[];
};

export type FilterConfig = {
  title: string;
  clearLabel: string;
  emptyOptionLabel: string;
  advancedTitle: string;
  primarySectionId: string;
  advancedSectionId: string;
  sections: { id: string; fields: FilterField[] }[];
};

const filterConfig = filterConfigJson as FilterConfig;
const selectTriggerClass =
  "h-12 w-full min-w-0 rounded-md border-[#0c110f]/15 bg-white px-3 text-sm font-normal dark:border-white/15 dark:bg-[#191c1b]";

type FilterPanelProps = {
  triggerLabel: string;
  config?: FilterConfig;
};

function selectedValues(value: string | null): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function valuesFromParams(
  params: Pick<URLSearchParams, "getAll">,
  queryParam: string,
): string[] {
  return params.getAll(queryParam).flatMap(selectedValues);
}

function serializeParams(params: URLSearchParams): string {
  return params.toString().replace(/%2C/gi, ",");
}

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
  const selectedLabels = field.options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

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
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
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
          {field.options.map((option) => (
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
    </div>
  );
}

export default function FilterPanel({
  triggerLabel,
  config = filterConfig,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const latestSearchString = useRef(searchString);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    latestSearchString.current = searchString;
  }, [searchString]);

  const fields = useMemo(
    () => config.sections.flatMap((section) => section.fields),
    [config],
  );
  const activeFilterCount = fields.reduce(
    (count, field) =>
      count + (valuesFromParams(searchParams, field.queryParam).length > 0 ? 1 : 0),
    0,
  );

  function updateUrl(queryParam: string, values: string[]) {
    const nextParams = new URLSearchParams(latestSearchString.current);
    const uniqueValues = [...new Set(values)];
    if (uniqueValues.length > 0) {
      nextParams.set(queryParam, uniqueValues.join(","));
    } else {
      nextParams.delete(queryParam);
    }
    nextParams.delete("page");

    const query = serializeParams(nextParams);
    latestSearchString.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleUrlValue(queryParam: string, value: string, checked: boolean) {
    const latestParams = new URLSearchParams(latestSearchString.current);
    const currentValues = valuesFromParams(latestParams, queryParam);
    const nextValues = checked
      ? currentValues.includes(value)
        ? currentValues
        : [...currentValues, value]
      : currentValues.filter((item) => item !== value);
    updateUrl(queryParam, nextValues);
  }

  function clearFilters() {
    const nextParams = new URLSearchParams(latestSearchString.current);
    for (const field of fields) nextParams.delete(field.queryParam);
    nextParams.delete("page");

    const query = serializeParams(nextParams);
    latestSearchString.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function renderField(field: FilterField) {
    const values = valuesFromParams(searchParams, field.queryParam);

    if (field.type === "select") {
      return (
        <Select
          value={values[0] ?? ""}
          onValueChange={(value) =>
            updateUrl(field.queryParam, value === "__clear__" ? [] : [value])
          }
        >
          <SelectTrigger className={selectTriggerClass} aria-label={field.label}>
            <SelectValue placeholder={field.placeholder ?? "Select"} />
          </SelectTrigger>
          <SelectContent className="z-[10003]">
            <SelectItem value="__clear__">{config.emptyOptionLabel}</SelectItem>
            {field.options.map((option) => (
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
            toggleUrlValue(field.queryParam, value, checked)
          }
        />
      );
    }

    return (
      <div className="space-y-2" role="group" aria-label={field.label}>
        {field.options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-[#0c110f] dark:text-gray-200"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  toggleUrlValue(field.queryParam, option.value, nextChecked === true);
                }}
              />
              {field.type === "rating-group" && (
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
              )}
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          className="h-11 shrink-0 gap-2 rounded-md bg-[#0c110f] px-4 text-sm font-medium text-white shadow-[0px_3px_4px_rgba(0,0,0,0.22)] hover:bg-[#0c110f]/90 dark:bg-white dark:text-[#0c110f] dark:hover:bg-gray-200"
        >
          <ListFilter className="size-4" />
          {triggerLabel}
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
}
