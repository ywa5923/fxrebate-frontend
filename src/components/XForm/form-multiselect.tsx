"use client";

import * as React from "react";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { FormBase } from "./form-components";
import { FormControlFunc } from "./types";

interface MultiSelectOption {
  value: string | number;
  label: string;
}

interface MultiSelectResponse {
  data?: MultiSelectOption[];
}

function isMultiSelectOption(value: unknown): value is MultiSelectOption {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "label" in value
  );
}

function normalizeOptions(options?: MultiSelectOption[]): MultiSelectOption[] {
  return (options ?? []).map((option) => ({
    value: String(option.value),
    label: option.label,
  }));
}

function normalizeValue(value: unknown): {
  selectedValues: string[];
  selectedOptions: MultiSelectOption[];
} {
  if (!Array.isArray(value)) {
    return {
      selectedValues: [],
      selectedOptions: [],
    };
  }

  const selectedValues: string[] = [];
  const selectedOptions: MultiSelectOption[] = [];

  value.forEach((item) => {
    if (isMultiSelectOption(item)) {
      const option = {
        value: String(item.value),
        label: item.label,
      };

      selectedValues.push(String(item.value));
      selectedOptions.push(option);
      return;
    }

    selectedValues.push(String(item));
  });

  return {
    selectedValues,
    selectedOptions,
  };
}

function mergeOptions(...optionGroups: MultiSelectOption[][]): MultiSelectOption[] {
  const merged = new Map<string, MultiSelectOption>();

  optionGroups.flat().forEach((option) => {
    merged.set(String(option.value), {
      value: String(option.value),
      label: option.label,
    });
  });

  return Array.from(merged.values());
}

export const FormMultiSelect: FormControlFunc<{
  options?: MultiSelectOption[];
  placeholder?: string;
  required?: boolean;
  searchUrl?: string;
  searchParamName?: string;
  debounceMs?: number;
}> = ({
  options = [],
  placeholder = "Select options",
  searchUrl,
  searchParamName = "search",
  debounceMs = 350,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {({ value, onChange, onBlur, ...field }) => (
        <FormMultiSelectControl
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          field={field}
          options={options}
          placeholder={placeholder}
          searchUrl={searchUrl}
          searchParamName={searchParamName}
          debounceMs={debounceMs}
        />
      )}
    </FormBase>
  );
};

function FormMultiSelectControl({
  value,
  onChange,
  onBlur,
  field,
  options,
  placeholder,
  searchUrl,
  searchParamName,
  debounceMs,
}: {
  value: unknown;
  onChange: (value: MultiSelectOption[]) => void;
  onBlur: () => void;
  field: {
    id: string;
    "aria-invalid": boolean;
  };
  options: MultiSelectOption[];
  placeholder: string;
  searchUrl?: string;
  searchParamName: string;
  debounceMs: number;
}) {
  const remoteSearchUrl = searchUrl;
  const initialOptions = React.useMemo(() => normalizeOptions(options), [options]);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [availableOptions, setAvailableOptions] = React.useState<MultiSelectOption[]>(initialOptions);
  const [knownOptions, setKnownOptions] = React.useState<MultiSelectOption[]>(initialOptions);
  const [selectedOptions, setSelectedOptions] = React.useState<MultiSelectOption[]>(() => {
    const normalizedValue = normalizeValue(value);

    return normalizedValue.selectedValues.map((selectedValue) => {
      return (
        normalizedValue.selectedOptions.find((option) => String(option.value) === selectedValue) ??
        initialOptions.find((option) => String(option.value) === selectedValue) ?? {
          value: selectedValue,
          label: selectedValue,
        }
      );
    });
  });
  const [isSearching, setIsSearching] = React.useState(false);
  const mouseSelectedValueRef = React.useRef<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setAvailableOptions(initialOptions);
    setKnownOptions((current) => mergeOptions(current, initialOptions));
  }, [initialOptions]);

  React.useEffect(() => {
    const normalizedValue = normalizeValue(value);

    setSelectedOptions(
      normalizedValue.selectedValues.map((selectedValue) => {
        return (
          normalizedValue.selectedOptions.find((option) => String(option.value) === selectedValue) ??
          knownOptions.find((option) => String(option.value) === selectedValue) ?? {
            value: selectedValue,
            label: selectedValue,
          }
        );
      })
    );
  }, [value]);

  const searchServer = useDebouncedCallback(async (term: string) => {
    if (!remoteSearchUrl) return;

    const searchTerm = term.trim();

    if (searchTerm.length < 2) {
      setAvailableOptions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await apiClient<MultiSelectOption[]>(remoteSearchUrl, true, {
        method: "POST",
        body: JSON.stringify({ [searchParamName]: searchTerm }),
      });

      if (!response.success) {
        setAvailableOptions([]);
        return;
      }

      const json = response as MultiSelectResponse;
      const nextOptions = normalizeOptions(json.data ?? []);

      setAvailableOptions(nextOptions);
      setKnownOptions((current) => mergeOptions(current, nextOptions));
    } catch {
      setAvailableOptions([]);
    } finally {
      setIsSearching(false);
    }
  }, debounceMs);

  React.useEffect(() => {
    if (!open || !remoteSearchUrl) return;
    searchServer(search);
  }, [open, remoteSearchUrl, search, searchServer]);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const selectedValues = selectedOptions.map((option) => String(option.value));
  const selectedValueSet = new Set(selectedValues);
  const canSearch = search.trim().length >= 2;
  const visibleOptions = remoteSearchUrl
    ? availableOptions
    : availableOptions.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      );

  const updateSelectedOptions = (nextOptions: MultiSelectOption[]) => {
    setSelectedOptions(nextOptions);
    onChange(
      nextOptions.map((option) => ({
        label: option.label,
        value: String(option.value),
      }))
    );
  };

  const toggleOption = (option: MultiSelectOption) => {
    const optionValue = String(option.value);
    const normalizedOption = {
      value: optionValue,
      label: option.label,
    };
    const nextOptions = selectedValueSet.has(optionValue)
      ? selectedOptions.filter((item) => String(item.value) !== optionValue)
      : [...selectedOptions, normalizedOption];

    setKnownOptions((current) => mergeOptions(current, [normalizedOption]));
    updateSelectedOptions(nextOptions);
    setSearch("");
  };

  const removeOption = (optionValue: string) => {
    updateSelectedOptions(selectedOptions.filter((item) => String(item.value) !== optionValue));
    setSearch("");
  };

  return (
          <div ref={containerRef} className="relative">
              <div
                id={field.id}
                role="combobox"
                aria-expanded={open}
                aria-invalid={field["aria-invalid"]}
                tabIndex={0}
                onBlur={onBlur}
                onClick={() => setOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpen(true);
                  }
                }}
                className={cn(
                  "border-input bg-background ring-offset-background flex min-h-10 w-full cursor-text flex-wrap items-center gap-1 rounded-md border px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  field["aria-invalid"] && "border-destructive"
                )}
              >
                {selectedOptions.map((option) => (
                  <span
                    key={String(option.value)}
                    className="inline-flex max-w-full items-center gap-1 rounded bg-muted px-2 py-0.5 text-sm"
                  >
                    <span className="truncate">{option.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeOption(String(option.value));
                      }}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </span>
                ))}
                <input
                  value={search}
                  placeholder={selectedOptions.length === 0 ? placeholder : ""}
                  onFocus={() => setOpen(true)}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setOpen(true);
                  }}
                  className="placeholder:text-muted-foreground min-w-28 flex-1 bg-transparent outline-none"
                />
              </div>
            {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
              <Command shouldFilter={false}>
                <CommandList>
                  {isSearching ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <CommandEmpty>
                      {canSearch ? "No items found." : "Type at least 2 characters to search."}
                    </CommandEmpty>
                  )}
                  <CommandGroup>
                    {visibleOptions.map((option) => {
                      const optionValue = String(option.value);
                      const isSelected = selectedValueSet.has(optionValue);

                      return (
                        <CommandItem
                          key={optionValue}
                          value={optionValue}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            mouseSelectedValueRef.current = optionValue;
                            toggleOption(option);
                          }}
                          onSelect={() => {
                            if (mouseSelectedValueRef.current === optionValue) {
                              mouseSelectedValueRef.current = null;
                              return;
                            }

                            toggleOption(option);
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{option.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
            )}
          </div>
  );
}
